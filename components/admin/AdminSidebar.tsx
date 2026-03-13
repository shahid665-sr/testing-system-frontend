// components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // 🟢 Added useRouter
import { 
  LayoutDashboard, Users, BookOpen, 
  Settings, BarChart3, LogOut, ShieldCheck, 
  Wallpaper,
  Briefcase
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin-dashboard' },
    { icon: BookOpen, label: 'Question Bank', href: '/admin-dashboard/questions' },
    { icon: Briefcase, label: 'Jobs', href: '/admin-dashboard/jobs' },
    { icon: Users, label: 'Candidates', href: '/admin-dashboard/candidates' },
    { icon: BarChart3, label: 'Results', href: '/admin-dashboard/results' },
    { icon: Wallpaper, label: 'Tests', href: '/admin-dashboard/tests' },
    { icon: Settings, label: 'Settings', href: '/admin-dashboard/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter(); // 🟢 Initialize router

  return (
    <aside className="w-72 bg-slate-900 h-screen sticky top-0 flex flex-col p-6">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className="text-white font-black tracking-tight leading-none uppercase text-sm">BTS Admin</h2>
          <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mt-1">Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                isActive 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* CONNECTED: Logout Button */}
      <button 
        onClick={() => {
          localStorage.clear();
          router.push('/login');
        }}
        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-rose-400 hover:bg-rose-500/10 transition-all mt-auto"
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
}