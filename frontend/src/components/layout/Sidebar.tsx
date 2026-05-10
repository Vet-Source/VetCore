'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, FileText, PlusCircle, Bell, 
  Settings, LogOut, Shield, Users, BarChart3,
  ChevronLeft, Menu, Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { clsx } from 'clsx';

const navByRole: Record<string, { href: string; label: string; icon: any }[]> = {
  VET_CLINIC: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/claims', label: 'My Claims', icon: FileText },
    { href: '/claims/new', label: 'New Claim', icon: PlusCircle },
    { href: '/notifications', label: 'Notifications', icon: Bell },
  ],
  INSURER: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/claims', label: 'Review Queue', icon: FileText },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/notifications', label: 'Notifications', icon: Bell },
  ],
  PET_OWNER: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/claims', label: "My Pet's Claims", icon: FileText },
    { href: '/notifications', label: 'Notifications', icon: Bell },
  ],
  REGULATOR: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/claims', label: 'All Claims', icon: FileText },
    { href: '/audit', label: 'Audit Log', icon: Shield },
    { href: '/analytics', label: 'Reports', icon: BarChart3 },
  ],
  ADMIN: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/claims', label: 'All Claims', icon: FileText },
    { href: '/users', label: 'Users', icon: Users },
    { href: '/audit', label: 'Audit Log', icon: Shield },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = navByRole[user?.role || 'VET_CLINIC'] || [];

  return (
    <aside className={clsx(
      'flex flex-col bg-brand-900 text-white transition-all duration-300 min-h-screen',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-300" />
            <span className="font-bold text-lg tracking-tight">VET-SOURCE</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="p-1.5 rounded hover:bg-white/10 transition-colors ml-auto"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-400 flex items-center justify-center text-sm font-bold">
              {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {user.profile?.firstName} {user.profile?.lastName}
              </p>
              <p className="text-xs text-blue-300 truncate">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm',
                active
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-white/10 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors text-sm"
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors text-sm"
          title={collapsed ? 'Log Out' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
