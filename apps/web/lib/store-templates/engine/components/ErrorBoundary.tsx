"use client"

import { Component, ReactNode, ErrorInfo } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  sectionName?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class TemplateErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Template section ${this.props.sectionName || "unknown"} error:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <p className="font-semibold">Section render error</p>
            <p className="text-xs mt-1 opacity-80">
              {this.props.sectionName ? `${this.props.sectionName} could not load.` : "This section could not load."}
            </p>
          </div>
        )
      )
    }

    return this.props.children
  }
}

/**
 * HOC to wrap a component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  sectionName?: string
) {
  const WrappedComponent = (props: P) => (
    <TemplateErrorBoundary sectionName={sectionName}>
      <Component {...props} />
    </TemplateErrorBoundary>
  )
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || "Component"})`
  return WrappedComponent
}
