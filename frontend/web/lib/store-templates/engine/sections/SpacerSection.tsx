"use client"

import type { SpacerSectionProps } from "../types"

export function SpacerSection({ props }: { props: SpacerSectionProps }) {
  const heightClass = props.height === "sm" ? "h-8" : props.height === "lg" ? "h-24" : "h-16"
  return <div className={heightClass} />
}
