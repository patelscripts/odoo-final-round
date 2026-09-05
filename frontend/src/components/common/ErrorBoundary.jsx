import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="card max-w-lg w-full">
            <h1 className="text-2xl mb-2">This page could not be rendered</h1>
            <p className="text-sm mb-4">{this.state.error.message}</p>
            <button className="btn-primary" onClick={() => window.location.assign("/")}>
              Go home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
