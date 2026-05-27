interface Props {
  storeId: string;
  slug: string;
  title?: string;
}

/**
 * Renders a legacy ZIP-uploaded template inside a full-bleed iframe served by
 * /api/templates/serve. The serve route injects a `__PLATFORM_CONFIG__` script
 * and a fetch interceptor so a properly authored template can call
 * `/api/adapters/<slug>/products` and receive real catalog data.
 *
 * NOTE: many legacy templates ship with hardcoded demo data and never call
 * the adapter — that's not a platform bug, it's a template bug. See
 * docs/TEMPLATE_AUTHORING.md for the contract every uploaded template needs
 * to follow.
 */
export function LegacyTemplateFrame({ storeId, slug, title }: Props) {
  const src = `/api/templates/serve?id=${encodeURIComponent(slug)}&storeId=${encodeURIComponent(storeId)}`;
  return (
    <iframe
      src={src}
      title={title ? `Storefront: ${title}` : "Storefront"}
      className="fixed inset-0 w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
    />
  );
}
