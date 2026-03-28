'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, ShieldAlert, Activity, Plus } from 'lucide-react';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const isSupplier = pathname.startsWith('/supplier');

  if (isSupplier) {
    return (
      <>
        <div className="nexus-accent-bar" />
        <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-16 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-[#0f1f3d] font-syne tracking-tight">NEXUS</span>
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3 font-syne">Supplier Portal</span>
            </div>
          </div>
        </nav>
      </>
    );
  }

  const isActive = (path) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      <div className="nexus-accent-bar" />
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-16 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/dashboard')}>
              <span className="font-bold text-2xl text-[#0f1f3d] font-syne tracking-tight group-hover:text-blue-700 transition-colors">NEXUS</span>
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            </div>
            <div className="hidden md:flex h-16">
              <Link 
                href="/dashboard" 
                className={`flex items-center px-4 border-b-2 gap-2 text-sm font-semibold transition-all ${
                  isActive('/dashboard') && !pathname.includes('/health') && !pathname.includes('/audit')
                    ? 'border-blue-600 text-blue-600 bg-blue-50/40' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link 
                href="/dashboard/health" 
                className={`flex items-center px-4 border-b-2 gap-2 text-sm font-semibold transition-all ${
                  isActive('/dashboard/health') 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/40' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                }`}
              >
                <Activity className="w-4 h-4" /> Health
              </Link>
              <Link 
                href="/dashboard/audit" 
                className={`flex items-center px-4 border-b-2 gap-2 text-sm font-semibold transition-all ${
                  isActive('/dashboard/audit') 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/40' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
                }`}
              >
                <ShieldAlert className="w-4 h-4" /> Audit Trail
              </Link>
            </div>
          </div>
          <button 
            onClick={() => router.push('/dashboard?new=true')}
            className="nexus-btn-primary py-2 px-4 text-sm"
          >
            <Plus className="w-4 h-4" /> New Vendor
          </button>
        </div>
      </nav>
    </>
  );
}
