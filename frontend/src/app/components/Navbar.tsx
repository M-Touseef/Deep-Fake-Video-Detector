import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, Upload, History, Info, LogOut, LayoutDashboard, Newspaper } from 'lucide-react';
import { useAuth } from './AuthContext';

export const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  const navLink = (to: string, icon: React.ReactNode, label: string) => (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(to)
        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
        : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
        }`}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <nav className="bg-slate-900/80 border-b border-slate-700/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to={user?.role === 'admin' ? '/admin' : '/home'}
            className="flex items-center gap-2.5 group"
          >
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-1.5 rounded-lg shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm tracking-wide">ProofOfReality</span>
              <span className="text-blue-400 text-[10px] font-medium tracking-widest uppercase">Deepfake Detector</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {user?.role !== 'admin' && (
              <>
                {navLink('/home', <Home className="h-4 w-4" />, 'Home')}
                {navLink('/upload', <Upload className="h-4 w-4" />, 'Analyse')}
                {navLink('/verify-news', <Newspaper className="h-4 w-4" />, 'Verify News')}
                {navLink('/history', <History className="h-4 w-4" />, 'History')}
                {navLink('/about', <Info className="h-4 w-4" />, 'About')}
              </>
            )}
            {user?.role === 'admin' &&
              navLink('/admin', <LayoutDashboard className="h-4 w-4" />, 'Dashboard')}
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-white text-sm font-medium leading-none">{user?.name}</span>
              <span className="text-slate-400 text-xs mt-0.5">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};
