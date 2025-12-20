import { Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function HeaderNav() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="gradient-primary text-white shadow-elevated sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-smooth">
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Otimizador de Demanda Elétrica</h1>
              <p className="text-xs text-white/80">
                Análise inteligente para economia em contratos de energia
              </p>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-smooth hover:text-white/90 ${
                isActive('/') ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'
              }`}
            >
              Calculadora
            </Link>
            <Link
              to="/Dashboardsmart"
              className={`text-sm font-medium transition-smooth hover:text-white/90 ${
                isActive('/tokens-demo') ? 'text-white border-b-2 border-white pb-1' : 'text-white/70'
              }`}
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
