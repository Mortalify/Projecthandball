import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    console.error("App error boundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center gap-6">
          <h1 className="font-display text-3xl font-black uppercase text-primary">Something went wrong</h1>
          <p className="text-muted-foreground text-sm max-w-sm">{this.state.message}</p>
          <button
            onClick={() => {
              localStorage.removeItem("ph-cart");
              this.setState({ hasError: false, message: "" });
              window.location.href = "/";
            }}
            className="bg-accent text-white font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-accent/90 transition-colors text-sm"
          >
            Clear cart &amp; go home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
