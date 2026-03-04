'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, BookOpen, FileText, CheckCircle, 
  TrendingUp, ArrowUpRight, Play, Clock 
} from 'lucide-react';

// Mock Stats
const stats = [
  { label: 'Total Candidates', value: '12,405', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', growth: '+12%' },
  { label: 'Question Bank', value: '3,200', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', growth: '+45' },
  { label: 'Active Tests', value: '08', icon: Play, color: 'text-amber-600', bg: 'bg-amber-50', growth: 'Live Now' },
  { label: 'Completed', value: '142', icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50', growth: 'Total' },
];

export default function AdminOverview() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // CONNECTED: Authentication Check
  useEffect(() => {
    const userRole = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    if (!token || userRole !== 'Admin') {
      router.push('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // Jab tak auth check na ho jaye, kuch na dikhayein
  if (!isAuthorized) return null;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 font-medium italic">Welcome back, Admin. System is running optimally.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Time</p>
            <p className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Clock size={14} className="text-emerald-500" /> {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          {/* CONNECTED: Logout Button */}
          <button 
            onClick={() => { localStorage.clear(); router.push('/login'); }}
            className="p-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-black text-sm transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-slate-900 group-hover:text-white`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.color} bg-opacity-10 border border-current opacity-70`}>
                {stat.growth}
              </span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h2 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Test Monitor */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              Live Assessments
            </h3>
            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View All Registry</button>
          </div>

          <div className="space-y-4">
            {[
              { title: "Junior Clerk (BPS-11)", dept: "Education Dept", progress: 85, candidates: "1,200/1,500" },
              { title: "SST General (BPS-16)", dept: "Secondary Ed", progress: 40, candidates: "840/2,000" }
            ].map((test, idx) => (
              <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-black text-slate-900">{test.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{test.dept}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600">{test.candidates}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Attendees</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full group-hover:bg-slate-900 transition-all duration-1000" 
                    style={{ width: `${test.progress}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Bank Breakdown */}
        <div className="lg:col-span-4 bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-black tracking-tight mb-6">Bank Distribution</h3>
            <div className="space-y-6">
              {[
                { cat: "English", qty: 850, color: "bg-blue-400" },
                { cat: "Computer", qty: 1200, color: "bg-emerald-400" },
                { cat: "GK", qty: 650, color: "bg-amber-400" },
                { cat: "Science", qty: 500, color: "bg-rose-400" }
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                    <span>{item.cat}</span>
                    <span>{item.qty} Qs</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${(item.qty/1200)*100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10">
              Generate Detailed Report
            </button>
          </div>
          
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}