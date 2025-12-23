"use client";

import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  isDark?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { isDark } = this.props;
      return (
        <div
          className={`min-h-screen flex items-center justify-center p-4 ${
            isDark ? "bg-stone-900" : "bg-amber-50"
          }`}
        >
          <div
            className={`max-w-md w-full p-6 rounded-xl border ${
              isDark
                ? "bg-stone-800 border-stone-700 text-stone-200"
                : "bg-white border-stone-200 text-stone-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                  isDark ? "text-red-400" : "text-red-500"
                }`}
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">
                  Something went wrong
                </h2>
                <p
                  className={`text-sm mb-4 ${
                    isDark ? "text-stone-400" : "text-stone-500"
                  }`}
                >
                  {this.state.error?.message ||
                    "An unexpected error occurred. Try refreshing the page."}
                </p>
                <button
                  onClick={this.handleReset}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    isDark
                      ? "bg-stone-700 hover:bg-stone-600 text-stone-200"
                      : "bg-stone-100 hover:bg-stone-200 text-stone-700"
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
