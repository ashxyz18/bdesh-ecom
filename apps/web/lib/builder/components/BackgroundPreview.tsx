"use client";

interface BackgroundPreviewProps {
  primaryColor: string;
  secondaryColor: string;
  companyName?: string;
  tagline?: string;
}

export function BackgroundPreview({
  primaryColor,
  secondaryColor,
  companyName,
  tagline,
}: BackgroundPreviewProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div
        style={{ backgroundColor: primaryColor }}
        className="h-8 flex items-center justify-center"
      >
        <p className="text-white text-[10px] tracking-wider">Announcement bar</p>
      </div>
      <div
        style={{ backgroundColor: primaryColor }}
        className="h-12 flex items-center px-4 gap-3"
      >
        <div className="w-6 h-6 rounded bg-white/30" />
        <div className="flex-1" />
        <div className="w-4 h-4 rounded bg-white/20" />
        <div className="w-4 h-4 rounded bg-white/20" />
        <div className="w-4 h-4 rounded bg-white/20" />
      </div>
      <div className="p-6">
        <div
          className="h-24 rounded-lg flex items-center justify-center mb-4"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <div className="text-center">
            <p className="text-base font-bold" style={{ color: primaryColor }}>
              {companyName || "Your Store"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {tagline || "Your tagline goes here"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 p-2">
              <div className="h-10 bg-gray-100 rounded mb-1.5" />
              <div className="h-2 w-3/4 bg-gray-200 rounded mb-1" />
              <div
                className="h-2 w-1/2 rounded"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="h-10" style={{ backgroundColor: primaryColor }} />
    </div>
  );
}
