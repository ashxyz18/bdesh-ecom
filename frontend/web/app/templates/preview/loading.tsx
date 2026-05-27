/**
 * Override the gallery loading skeleton (`app/templates/loading.tsx`) for
 * the preview route. Without this, the preview shows the gallery's gray
 * placeholder cards while streaming, making it look "blank" until the
 * page fully hydrates. A clean centered spinner is much less confusing.
 */
export default function PreviewLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </div>
  );
}
