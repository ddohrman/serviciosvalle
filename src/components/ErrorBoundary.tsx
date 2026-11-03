import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'Error inesperado'
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#001428] text-white flex flex-col items-center justify-center p-6 text-center antialiased">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center mb-4 shadow-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-bold mb-2 text-white">
            Oficios y Servicios Valle de Lerma
          </h1>
          <p className="text-xs text-slate-300 max-w-sm mb-6 leading-relaxed">
            Se recuperó la aplicación de una interrupción temporal en tu dispositivo. Podés reanudar tocando el botón de abajo.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-[#9e4300] hover:from-amber-400 hover:to-[#853900] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reanudar Aplicación</span>
            </button>

            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/20"
            >
              <Home className="w-4 h-4" />
              <span>Recargar Página</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
