import { exec, ExecException } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { existsSync, rmSync, mkdirSync, cpSync } from "fs";

const execAsync = promisify(exec);

const TEMPLATES_DIR = path.join(process.cwd(), "public", "templates");
const TEMP_DIR = path.join(process.cwd(), "tmp", "template-builds");
const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000";
const MAX_INSTALL_RETRIES = 2;

export type BuildPhase = "extracting" | "installing" | "building" | "copying" | "post-processing" | "done" | "failed";

export interface BuildSummary {
  totalFiles: number;
  totalSizeKb: number;
  outputDir: string;
  buildTool: "cra" | "vite" | "nextjs" | "static";
  hasIndexHtml: boolean;
  assetCount: number;
  durationMs: number;
}

export interface BuildResult {
  success: boolean;
  buildStatus: "ready" | "failed" | "static";
  buildLog: string;
  templateId?: string;
  error?: string;
  errorHint?: string;
  isStatic?: boolean;
  phases?: { phase: BuildPhase; timestamp: string; message: string }[];
  summary?: BuildSummary;
}

function getTempDir(templateId: string): string {
  return path.join(TEMP_DIR, templateId);
}

function getTemplateDir(templateId: string): string {
  return path.join(TEMPLATES_DIR, templateId);
}

async function runCommand(command: string, cwd: string, timeout: number = 600000): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    const child = exec(command, {
      cwd,
      timeout,
      maxBuffer: 100 * 1024 * 1024,
    }, (error: ExecException | null, stdout_: string | null, stderr_: string | null) => {
      if (error) {
        stdout += stdout_ || "";
        stderr += stderr_ || "";
        reject({ stdout, stderr, error });
      } else {
        resolve({ stdout: stdout_ || "", stderr: stderr_ || "" });
      }
    });

    if (child.stdout) {
      child.stdout.on("data", (data: Buffer) => {
        stdout += data.toString();
      });
    }
    if (child.stderr) {
      child.stderr.on("data", (data: Buffer) => {
        stderr += data.toString();
      });
    }
  });
}

export async function buildReactTemplate(
  templateId: string,
  sourceFiles: { path: string; content: Buffer }[]
): Promise<BuildResult> {
  const tempDir = getTempDir(templateId);
  const templateDir = getTemplateDir(templateId);
  let buildLog = "";
  const phases: BuildResult["phases"] = [];
  const startTime = Date.now();

  const appendLog = (message: string) => {
    buildLog += `[${new Date().toISOString()}] ${message}\n`;
    console.log(`[Build ${templateId}] ${message}`);
  };

  const trackPhase = (phase: BuildPhase, message: string) => {
    phases!.push({ phase, timestamp: new Date().toISOString(), message });
    appendLog(`[Phase: ${phase}] ${message}`);
  };

  try {
    trackPhase("extracting", "Starting template processing");

    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    mkdirSync(tempDir, { recursive: true });

    if (existsSync(templateDir)) {
      rmSync(templateDir, { recursive: true, force: true });
    }
    mkdirSync(templateDir, { recursive: true });

    trackPhase("extracting", "Extracting source files to temp directory");
    for (const file of sourceFiles) {
      const filePath = path.join(tempDir, file.path);
      const fileDir = path.dirname(filePath);

      if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true });
      }

      fs.writeFileSync(filePath, file.content);
    }
    trackPhase("extracting", `Extracted ${sourceFiles.length} files`);

    const packageJsonPath = path.join(tempDir, "package.json");
    const hasPackageJson = existsSync(packageJsonPath);
    let isReactApp = false;

    if (hasPackageJson) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        const scripts = packageJson.scripts || {};
        const buildCommand = scripts.build;

        if (buildCommand) {
          isReactApp = true;
          const isVite = buildCommand.includes("vite") || Boolean(packageJson.devDependencies?.["vite"] || packageJson.dependencies?.["vite"]);
          appendLog(`Detected ${isVite ? "Vite" : "React/CRA"} app with build script: ${buildCommand}`);
          normalizeReactRouterForTemplate(tempDir, appendLog);
          sanitizeReactBuildDependencies(packageJson, appendLog);

          // For Vite: set base path in vite.config if not already set
          if (isVite) {
            patchViteConfig(tempDir, templateId, appendLog);
          }

          fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

          // Build env vars — include both REACT_APP_ (CRA) and VITE_ (Vite) prefixes
          const envContent = `CI=true
DISABLE_ESLINT_PLUGIN=true
SKIP_PREFLIGHT_CHECK=true
TSC_COMPILE_ON_ERROR=true
DISABLE_NEW_JSX_TRANSFORM=false
PUBLIC_URL=/templates/${templateId}
REACT_APP_API_URL=/api/adapters/${templateId}
REACT_APP_PLATFORM_URL=${PLATFORM_URL}
VITE_API_URL=/api/adapters/${templateId}
VITE_PLATFORM_URL=${PLATFORM_URL}
VITE_TEMPLATE_ID=${templateId}
GENERATE_SOURCEMAP=false
`;
          // Remove any existing .env* files to ensure our settings take precedence
          try {
            const entries = fs.readdirSync(tempDir);
            for (const entry of entries) {
              if (entry.startsWith(".env")) {
                fs.unlinkSync(path.join(tempDir, entry));
                appendLog("Removed existing env file: " + entry);
              }
            }
          } catch { /* ignore */ }
          const envPath = path.join(tempDir, ".env");
          fs.writeFileSync(envPath, envContent);
          appendLog("Created .env with API_URL=/api/adapters/" + templateId);

          trackPhase("installing", "Running npm install...");
          let installSuccess = false;
          for (let attempt = 1; attempt <= MAX_INSTALL_RETRIES; attempt++) {
            try {
              const installResult = await runCommand("npm install --legacy-peer-deps", tempDir);
              appendLog("npm install stdout: " + installResult.stdout.substring(0, 500));
              if (installResult.stderr) {
                appendLog("npm install stderr: " + installResult.stderr.substring(0, 500));
              }
              trackPhase("installing", "npm install completed successfully");
              installSuccess = true;
              break;
            } catch (installError: any) {
              const errParts = [
                installError.error?.message,
                installError.stderr?.substring(0, 2000),
                installError.stdout?.substring(0, 2000),
              ].filter(Boolean);
              const errMsg = errParts.join('\n---\n') || "Unknown error";
              const isTransient = /ETARGET|ERESOLVE|ENOENT|EAI_AGAIN|ETIMEDOUT|network/.test(errMsg);
              if (isTransient && attempt < MAX_INSTALL_RETRIES) {
                appendLog(`npm install attempt ${attempt} failed (transient), retrying...`);
                // Clear node_modules before retry
                const nm = path.join(tempDir, "node_modules");
                if (existsSync(nm)) rmSync(nm, { recursive: true, force: true });
                continue;
              }
              appendLog(`npm install failed after ${attempt} attempt(s):\n${errMsg}`);
              trackPhase("failed", `npm install failed: ${errMsg.substring(0, 200)}`);
              return {
                success: false,
                buildStatus: "failed",
                buildLog: buildLog + `\nnpm install error: ${errMsg}`,
                error: `npm install failed: ${errMsg}`,
                phases,
              };
            }
          }

          trackPhase("building", "Running npm run build...");
          try {
            const buildResult = await runCommand("npm run build", tempDir);
            appendLog("npm build stdout: " + buildResult.stdout.substring(0, 1000));
            if (buildResult.stderr) {
              appendLog("npm build stderr: " + buildResult.stderr.substring(0, 1000));
            }
            trackPhase("building", "npm run build completed successfully");
          } catch (buildError: any) {
            const errParts = [
              buildError.error?.message,
              buildError.stderr?.substring(0, 2000),
              buildError.stdout?.substring(0, 2000),
            ].filter(Boolean);
            const errMsg = errParts.join('\n---\n') || "Unknown error";
            appendLog(`npm run build failed:\n${errMsg}`);
            try { appendLog("Temp directory contents: " + JSON.stringify(fs.readdirSync(tempDir))); } catch {}
            trackPhase("failed", `Build failed: ${errMsg.substring(0, 200)}`);
            return {
              success: false,
              buildStatus: "failed",
              buildLog: buildLog + `\nBuild error: ${errMsg}`,
              error: `Build failed: ${errMsg}`,
              phases,
            };
          }

          // Search multiple output dirs: build/ (CRA), dist/ (Vite), out/ (Next.js static)
          const buildDir = path.join(tempDir, "build");
          const distDir = path.join(tempDir, "dist");
          const outDir = path.join(tempDir, "out");

          let outputDir = "";
          if (existsSync(buildDir)) {
            outputDir = buildDir;
            appendLog("Found build/ directory (CRA)");
          } else if (existsSync(distDir)) {
            outputDir = distDir;
            appendLog("Found dist/ directory (Vite)");
          } else if (existsSync(outDir)) {
            outputDir = outDir;
            appendLog("Found out/ directory (Next.js export)");
          } else {
            appendLog("Error: No build/, dist/, or out/ directory found after build");
            appendLog("Contents of temp dir: " + JSON.stringify(fs.readdirSync(tempDir)));
            trackPhase("failed", "Build output directory not found");
            return {
              success: false,
              buildStatus: "failed",
              buildLog: buildLog + "\nError: Build output directory not found",
              error: "Build output not found",
              phases,
            };
          }

          const indexHtmlPath = path.join(outputDir, "index.html");
          if (!existsSync(indexHtmlPath)) {
            appendLog("Error: No index.html found in build output at: " + outputDir);
            // List what IS in the output dir for debugging
            try {
              const outputContents = fs.readdirSync(outputDir);
              appendLog("Build output contents: " + JSON.stringify(outputContents));
              // Check nested folders (some builds output to build/static/, build/public/, etc.)
              for (const item of outputContents) {
                const itemPath = path.join(outputDir, item);
                if (fs.statSync(itemPath).isDirectory()) {
                  const subContents = fs.readdirSync(itemPath);
                  appendLog(`  ${item}/ contains: ${JSON.stringify(subContents)}`);
                  if (subContents.includes("index.html")) {
                    appendLog(`Found index.html in ${item}/ — copying to root`);
                    copyDirRecursive(itemPath, outputDir);
                    if (existsSync(path.join(outputDir, "index.html"))) {
                      appendLog("Successfully moved nested build output to root");
                      break;
                    }
                  }
                }
              }
            } catch (e: any) {
              appendLog("Failed to list output dir: " + e.message);
            }

            // Re-check after potential fix
            if (!existsSync(path.join(outputDir, "index.html"))) {
              trackPhase("failed", "index.html not found in build output");
              return {
                success: false,
                buildStatus: "failed",
                buildLog: buildLog + "\nError: index.html not found in build output",
                error: "index.html not found in build output",
                phases,
              };
            }
          }

          trackPhase("copying", "Copying build output to template directory");
          copyDirRecursive(outputDir, templateDir);
          trackPhase("post-processing", "Post-processing template assets");
          postProcessTemplateAssets(templateId, templateDir, appendLog);
          injectPlatformSdkTag(templateDir, appendLog);

          const buildTool = isVite ? "vite" as const : "cra" as const;
          const summary = generateBuildSummary(templateDir, buildTool, Date.now() - startTime);
          trackPhase("done", `${isVite ? "Vite" : "React"} app built — ${summary.totalFiles} files, ${summary.totalSizeKb}KB, ${(summary.durationMs / 1000).toFixed(1)}s`);

          return {
            success: true,
            buildStatus: "ready",
            buildLog,
            templateId,
            phases,
            summary,
          };
        }
      } catch (e) {
        appendLog("Could not parse package.json, treating as static site");
      }
    }

    trackPhase("copying", "No build script found - treating as static template");
    copyDirRecursive(tempDir, templateDir);
    postProcessTemplateAssets(templateId, templateDir, appendLog);
    injectPlatformSdkTag(templateDir, appendLog);

    const summary = generateBuildSummary(templateDir, "static", Date.now() - startTime);
    trackPhase("done", `Static template extracted — ${summary.totalFiles} files, ${summary.totalSizeKb}KB`);

    return {
      success: true,
      buildStatus: "static",
      buildLog,
      templateId,
      isStatic: true,
      phases,
      summary,
    };
  } catch (error: any) {
    appendLog(`Unexpected error: ${error.message}`);
    trackPhase("failed", error.message);
    return {
      success: false,
      buildStatus: "failed",
      buildLog: buildLog + `\nUnexpected error: ${error.message}`,
      error: error.message,
      errorHint: diagnoseError(error.message),
      phases,
    };
  } finally {
    appendLog("Cleaning up temp directory");
    cleanupTempDir(tempDir);
  }
}

function sanitizeReactBuildDependencies(packageJson: any, appendLog: (message: string) => void) {
  let changed = false;

  // A global AJV override breaks Create React App 5 because its webpack plugins
  // intentionally install both AJV 6 and AJV 8 under different schema-utils versions.
  for (const field of ["overrides", "resolutions"] as const) {
    const value = packageJson[field];
    if (!value || typeof value !== "object") continue;

    if (value.ajv) {
      delete value.ajv;
      changed = true;
    }

    if (value["ajv-keywords"]) {
      delete value["ajv-keywords"];
      changed = true;
    }

    if (Object.keys(value).length === 0) {
      delete packageJson[field];
    }
  }

  if (changed) {
    appendLog("Removed global AJV overrides so react-scripts can install compatible nested versions");
  } else {
    appendLog("React build dependencies did not need AJV override changes");
  }
}

function normalizeReactRouterForTemplate(rootDir: string, appendLog: (message: string) => void) {
  const srcDir = path.join(rootDir, "src");
  if (!existsSync(srcDir)) return;

  const files = listFiles(srcDir).filter((file) => /\.(jsx?|tsx?)$/i.test(file));
  let changed = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, "utf-8");
    if (!content.includes("BrowserRouter")) continue;

    const nextContent = content
      .replace(/\bBrowserRouter\s+as\s+Router\b/g, "HashRouter as Router")
      .replace(/\bBrowserRouter\b/g, "HashRouter");

    if (nextContent !== content) {
      fs.writeFileSync(file, nextContent);
      changed += 1;
    }
  }

  if (changed > 0) {
    appendLog(`Converted BrowserRouter to HashRouter in ${changed} source file(s) for nested template hosting`);
  }
}

function postProcessTemplateAssets(templateId: string, templateDir: string, appendLog: (message: string) => void) {
  const files = listFiles(templateDir);
  const publicBase = `/templates/${templateId}`;
  let rewrittenFiles = 0;

  for (const file of files) {
    if (file.endsWith(".html")) {
      const original = fs.readFileSync(file, "utf-8");
      const rewritten = rewriteHtmlAssetPaths(original, publicBase);
      if (rewritten !== original) {
        fs.writeFileSync(file, rewritten);
        rewrittenFiles += 1;
      }
    }

    if (file.endsWith(".css")) {
      const original = fs.readFileSync(file, "utf-8");
      const rewritten = rewriteCssAssetPaths(original, publicBase);
      if (rewritten !== original) {
        fs.writeFileSync(file, rewritten);
        rewrittenFiles += 1;
      }
    }
  }

  if (rewrittenFiles > 0) {
    appendLog(`Rewrote absolute asset paths in ${rewrittenFiles} built file(s)`);
  }
}

function rewriteHtmlAssetPaths(html: string, publicBase: string) {
  return html
    .replace(/\b(src|href)=["']\/(?!\/|api\/|templates\/|_next\/|store\/|dashboard\/|assets\/?https?:)([^"']+)["']/g, (_match, attr, assetPath) => {
      return `${attr}="${publicBase}/${assetPath}"`;
    })
    .replace(/\b(src|href)=["']\/assets\//g, `${"$1"}="${publicBase}/assets/`);
}

function rewriteCssAssetPaths(css: string, publicBase: string) {
  return css.replace(/url\((['"]?)\/(?!\/|api\/|templates\/|_next\/)([^'")]+)\1\)/g, (_match, quote, assetPath) => {
    return `url(${quote}${publicBase}/${assetPath}${quote})`;
  });
}

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(entryPath));
    } else {
      files.push(entryPath);
    }
  }

  return files;
}

function copyDirRecursive(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      cpSync(srcPath, destPath);
    }
  }
}

export function cleanupTempDir(tempDir: string): void {
  try {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
      console.log(`[Build] Cleaned up temp directory: ${tempDir}`);
    }
  } catch (error) {
    console.error(`[Build] Failed to cleanup temp directory: ${tempDir}`, error);
  }
}

export function getBuildStatus(templateId: string): "pending" | "installing" | "building" | "ready" | "failed" | null {
  const templateDir = getTemplateDir(templateId);
  const manifestPath = path.join(templateDir, "manifest.json");

  if (existsSync(manifestPath)) {
    return "ready";
  }

  const buildInProgress = path.join(TEMP_DIR, templateId);
  if (existsSync(buildInProgress)) {
    return "building";
  }

  return null;
}

export async function deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const templateDir = getTemplateDir(templateId);
    const tempDir = getTempDir(templateId);

    if (existsSync(templateDir)) {
      rmSync(templateDir, { recursive: true, force: true });
    }

    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Patch vite.config to set the correct base path for template hosting.
 * This ensures all asset URLs in the built output point to /templates/{templateId}/
 */
function patchViteConfig(rootDir: string, templateId: string, appendLog: (msg: string) => void) {
  const configFiles = ["vite.config.ts", "vite.config.js", "vite.config.mjs", "vite.config.mts"];
  for (const configFile of configFiles) {
    const configPath = path.join(rootDir, configFile);
    if (!existsSync(configPath)) continue;

    let content = fs.readFileSync(configPath, "utf-8");
    // Only patch if base is not already set
    if (/base\s*:/.test(content)) {
      appendLog(`Vite config already has base set, skipping patch`);
      return;
    }

    // Insert base into defineConfig({...}) or export default {...}
    const patched = content.replace(
      /(defineConfig\s*\(\s*\{|export\s+default\s*\{)/,
      `$1\n  base: '/templates/${templateId}/',`
    );

    if (patched !== content) {
      fs.writeFileSync(configPath, patched);
      appendLog(`Patched ${configFile} with base: '/templates/${templateId}/'`);
    }
    return;
  }

  // No vite config file found — create a minimal one
  const minimalConfig = `import { defineConfig } from 'vite';\nexport default defineConfig({ base: '/templates/${templateId}/' });\n`;
  fs.writeFileSync(path.join(rootDir, "vite.config.js"), minimalConfig);
  appendLog("Created minimal vite.config.js with correct base path");
}

/**
 * Auto-inject a small platform SDK script tag into index.html so
 * templates can call window.__bdesh.getConfig() without any setup.
 */
function injectPlatformSdkTag(templateDir: string, appendLog: (msg: string) => void) {
  const indexPath = path.join(templateDir, "index.html");
  if (!existsSync(indexPath)) return;

  let html = fs.readFileSync(indexPath, "utf-8");

  // Skip if already injected
  if (html.includes("__bdesh_sdk_injected__")) return;

  const sdkMarker = `<!-- __bdesh_sdk_injected__ -->`;

  // Inject a data attribute on the root html element so templates can detect the platform
  if (!html.includes("data-bdesh-platform")) {
    html = html.replace("<html", '<html data-bdesh-platform="true"');
  }

  // Insert marker before </body> to prevent double-injection
  if (html.includes("</body>")) {
    html = html.replace("</body>", sdkMarker + "</body>");
  } else {
    html += sdkMarker;
  }

  fs.writeFileSync(indexPath, html);
  appendLog("Injected platform SDK marker into index.html");
}

/**
 * Generate a build summary with file counts, total size, and asset breakdown.
 */
function generateBuildSummary(
  templateDir: string,
  buildTool: BuildSummary["buildTool"],
  durationMs: number
): BuildSummary {
  const files = listFiles(templateDir);
  let totalSize = 0;
  let assetCount = 0;
  const assetExts = new Set([".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".woff", ".woff2", ".ttf", ".eot", ".ico"]);

  for (const file of files) {
    try {
      const stat = fs.statSync(file);
      totalSize += stat.size;
      const ext = path.extname(file).toLowerCase();
      if (assetExts.has(ext)) assetCount++;
    } catch { /* ignore */ }
  }

  return {
    totalFiles: files.length,
    totalSizeKb: Math.round(totalSize / 1024),
    outputDir: templateDir,
    buildTool,
    hasIndexHtml: existsSync(path.join(templateDir, "index.html")),
    assetCount,
    durationMs,
  };
}

/**
 * Provide human-readable fix suggestions for common build failures.
 */
function diagnoseError(errorMsg: string): string {
  if (/ENOSPC|no space left/i.test(errorMsg)) {
    return "Disk space is full. Free up space on the server and retry.";
  }
  if (/ENOMEM|out of memory|JavaScript heap/i.test(errorMsg)) {
    return "Server ran out of memory during build. Try increasing NODE_OPTIONS='--max-old-space-size=4096'.";
  }
  if (/ETARGET|version .* not found/i.test(errorMsg)) {
    return "A dependency version could not be found in the registry. Check if the template uses private packages.";
  }
  if (/ERESOLVE|peer dep|conflicting/i.test(errorMsg)) {
    return "Dependency conflict detected. The template may need --legacy-peer-deps (already applied) or manual resolution.";
  }
  if (/Module not found|Cannot find module/i.test(errorMsg)) {
    return "A required module is missing. The template may reference a local package that was not included in the ZIP.";
  }
  if (/SyntaxError|Unexpected token/i.test(errorMsg)) {
    return "The template source contains syntax errors. Verify it builds locally before uploading.";
  }
  if (/EACCES|permission denied/i.test(errorMsg)) {
    return "File permission error. The server process needs write access to the templates directory.";
  }
  if (/ETIMEDOUT|EAI_AGAIN|network/i.test(errorMsg)) {
    return "Network timeout during npm install. This is usually transient — try uploading again.";
  }
  if (/index\.html not found/i.test(errorMsg)) {
    return "The build did not produce an index.html. Ensure the template's build script generates a single-page app output.";
  }
  return "";
}
