/**
 * Template utilities — all templates are now uploaded via the admin panel.
 * This barrel re-exports only the helpers and types other modules need.
 */
export type { TemplateManifest } from "./manifest";
export { createDefaultManifest } from "./manifest";
