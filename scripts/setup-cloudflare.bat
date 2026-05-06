@echo off
REM Cloudflare Deployment Setup Script for Windows
REM This script helps set up your project for Cloudflare Pages deployment

echo.
echo 🚀 BDESH E-commerce - Cloudflare Pages Setup
echo ===============================================
echo.

REM Check if Wrangler is installed
where wrangler >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing Wrangler CLI...
    npm install -g @cloudflare/wrangler
) else (
    echo ✅ Wrangler CLI is already installed
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

REM Create .env.cloudflare if it doesn't exist
if not exist .env.cloudflare (
    echo 📝 Creating .env.cloudflare...
    copy .env.example .env.cloudflare
    echo ⚠️  Please update .env.cloudflare with your Cloudflare credentials
) else (
    echo ✅ .env.cloudflare already exists
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build the project
echo 🔨 Building project...
call npm run build

REM Display next steps
echo.
echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Update .env.cloudflare with your Cloudflare credentials:
echo    - CLOUDFLARE_ACCOUNT_ID
echo    - CLOUDFLARE_API_TOKEN
echo    - CLOUDFLARE_PROJECT_NAME
echo.
echo 2. Connect your domain to Cloudflare (if not already done)
echo.
echo 3. Deploy using one of these methods:
echo    a) Using Wrangler: wrangler pages deploy frontend/web\.next\standalone
echo    b) Push to GitHub and use CI/CD workflow
echo.
echo 4. Add environment variables to Cloudflare Pages dashboard
echo.
echo For detailed instructions, see CLOUDFLARE_DEPLOYMENT.md
echo.
pause
