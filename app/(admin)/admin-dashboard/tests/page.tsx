'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Calendar, Users, 
  Clock, Link as LinkIcon, MoreVertical, 
  PlayCircle, StopCircle, Edit
} from 'lucide-react';

// 🟢 TypeScript interface define kar di taake error na aaye
interface TestItem {
  id: string;
  title: string;
  date: string;
  duration: number;
  questions: number;
  candidates: number;
  status: string;
  key: string;
}

export default function TestsManagementPage() {
  const [filter, setFilter] = useState('All');
  
  // 🟢 NEW: Backend se aane wale tests ko store karne ke liye state
  const [testsData, setTestsData] = useState<TestItem[]>([]);

  // 🟢 NEW: Component load hone par API se data fetch karna
  useEffect(() => {
    const fetchTests = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5064/api/AdminTests/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setTestsData(data);
        } else {
          console.error("Failed to fetch tests data");
        }
      } catch (error) {
        console.error("Error connecting to API:", error);
      }
    };

    fetchTests();
  }, []);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Examination Registry</h1>
          <p className="text-slate-500 font-medium italic">Monitor scheduled assessments and active keys</p>
        </div>
        
        <Link href="/admin-dashboard/tests/create">
          <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
            <Plus size={20} /> CREATE NEW TEST
          </button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit shadow-sm">
        {['All', 'Live', 'Draft', 'Archived'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === status 
              ? 'bg-slate-900 text-white shadow-lg' 
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Test Cards Grid (Dynamically Populated) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 🟢 REPLACED: mockTests ko testsData se replace kiya, baqi HTML exact same hai */}
        {testsData.filter(t => filter === 'All' || t.status === filter).map((test) => (
          <div key={test.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
            
            {/* Status Indicator Bar */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${
              test.status === 'Live' ? 'bg-emerald-500' : 
              test.status === 'Draft' ? 'bg-amber-500' : 'bg-slate-300'
            }`} />

            <div className="flex justify-between items-start mb-6 pt-2">
              <div className={`p-3 rounded-2xl ${
                test.status === 'Live' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
              }`}>
                {test.status === 'Live' ? <PlayCircle size={24} /> : <StopCircle size={24} />}
              </div>
              <button className="text-slate-300 hover:text-slate-900">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                  {test.title}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {test.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600">{test.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600">{test.duration} Mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600">{test.candidates} Applicants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Edit size={14} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-600">{test.questions} Items</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between group-hover:bg-emerald-50 transition-colors">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Key</p>
                  <p className="text-sm font-black text-slate-900 tracking-tighter">{test.key}</p>
                </div>
                <button className="p-2 bg-white rounded-lg text-slate-400 hover:text-emerald-600 shadow-sm">
                  <LinkIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Placeholder Card */}
        <Link href="/admin-dashboard/tests/create" className="group border-2 border-dashed border-slate-200 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-all hover:bg-emerald-50/20">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-emerald-500">
            <Plus size={24} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">New Assessment</span>
        </Link>
      </div>
    </div>
  );
}