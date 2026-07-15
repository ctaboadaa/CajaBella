import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
          <h1 className="text-2xl text-ink">Algo salió mal</h1>
          <p className="text-sm text-ink-soft">
            No pudimos mostrar esta pantalla. Recarga la página; si el problema sigue, avísale a quien administra CajaBella.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-control bg-accent px-4 py-2.5 text-sm font-medium text-white active:scale-[0.98]"
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
