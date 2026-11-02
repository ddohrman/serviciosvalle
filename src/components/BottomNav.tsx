import React from 'react';
import { Search, ClipboardList, Wrench, ShieldCheck, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  requestsCount: number;
  isProLoggedIn?: boolean;
  pendingApprovalsCount?: number;
  isDevAdmin?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  currentTab, 
  onNavigate, 
  requestsCount, 
  isProLoggedIn,
  pendingApprovalsCount,
  isDevAdmin = false
}) => {
  const navItems = [
    {
      id: 'explorar',
      label: 'Explorar',
      icon: Search,
    },
    {
      id: 'solicitudes',
      label: isProLoggedIn ? 'Trabajos' : 'Solicitudes',
      icon: ClipboardList,
      badge: requestsCount > 0 ? requestsCount : undefined,
    },
    {
      id: 'ser-profesional',
      label: isProLoggedIn ? 'Mi Panel Pro' : 'Ser Pro',
      icon: Wrench,
      badge: isProLoggedIn ? '30d' : undefined,
      badgeColor: isProLoggedIn ? 'bg-[#ffdbcb] text-[#783100]' : undefined,
    },
    ...(isDevAdmin ? [{
      id: 'admin',
      label: 'Jorge (Dev)',
      icon: ShieldCheck,
      badge: pendingApprovalsCount !== undefined && pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-[#9e4300] text-white',
    }] : []),
    {
      id: 'mi-cuenta',
      label: 'Mi Cuenta',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[#f8f9ff]/92 backdrop-blur-xl border-t border-[#e2e8f0] shadow-[0_-4px_20px_rgba(15,41,66,0.06)]">
      <div className="max-w-xl mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#9e4300] font-bold'
                  : 'text-[#43474d] hover:text-[#0b1c30]'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge !== undefined && (
                  <span className={`absolute -top-1.5 -right-3.5 ${item.badgeColor || 'bg-[#9e4300] text-white'} min-w-4 px-1 h-4 rounded-full text-[9px] font-black flex items-center justify-center shadow-xs border border-white`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 transition-all ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-[#9e4300] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
