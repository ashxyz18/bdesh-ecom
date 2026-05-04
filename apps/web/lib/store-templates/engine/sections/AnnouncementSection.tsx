"use client"

import type { AnnouncementSectionProps } from "../types"

export function AnnouncementSection({ props }: { props: AnnouncementSectionProps }) {
  return (
    <div
      className="text-center py-2.5 px-4 text-sm font-medium"
      style={{
        backgroundColor: props.bgColor || "var(--tpl-primary)",
        color: props.textColor || "#fff",
      }}
    >
      {props.message}
    </div>
  )
}
