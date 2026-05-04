"use client";

import React from "react";

interface SectionErrorBoundaryProps {
  sectionType: string;
  children: React.ReactNode;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SectionErrorBoundary] Error in section "${this.props.sectionType}":`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="py-12 px-4 text-center bg-red-50 border border-red-100 rounded-lg mx-4 my-4">
          <p className="text-red-600 font-medium mb-1">Failed to render &ldquo;{this.props.sectionType}&rdquo; section</p>
          <p className="text-sm text-red-400">This section has been hidden to prevent page breakage.</p>
        </section>
      );
    }
    return this.props.children;
  }
}
