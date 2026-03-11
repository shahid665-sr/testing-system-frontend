'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, MapPin, Users, 
  Briefcase, DollarSign, MoreVertical, 
  Globe, Clock, Filter, GraduationCap, Calendar
} from 'lucide-react';

// 🟢 Updated interface to match your new creation fields
interface JobItem {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string; 
  salary: string;
  education: string;   // Added
  positions: number;    // Added (Vacancies)
  lastDate: string;     // Added (Deadline)
  applicants: number;
  status: string; 
  postedDate: string;
}

export default function JobsManagementPage() {
  const [filter, setFilter] = useState('All');
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5064/api/Jobs/all');
        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'All' || job.status === filter;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 ">Job Registry</h1>
          <p className="text-slate-500 font-medium italic">Monitor active vacancies and recruitment timelines</p>
        </div>
        
        <Link href="/admin-dashboard/jobs/create">
          <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 uppercase tracking-tight">
            <Plus size={20} /> Post New Vacancy
          </button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit shadow-sm">
          {['All', 'Active', 'Closed', 'Draft'].map((status) => (
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

        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search roles or departments..."
            className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden flex flex-col">
            
            {/* Top Row: Icon & Actions */}
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${
                job.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
              }`}>
                <Briefcase size={24} />
              </div>
              <div className="flex items-center gap-2">
                 <div className="text-right mr-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Deadline</p>
                    <p className="text-[11px] font-black text-rose-600">{job.lastDate}</p>
                 </div>
                 <button className="text-slate-300 hover:text-slate-900 transition-colors p-2">
                   <MoreVertical size={20} />
                 </button>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 flex-grow">
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 uppercase rounded-md tracking-tighter">
                    {job.department}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 italic">ID: {job.id}</span>
                </div>
              </div>

              {/* 🟢 Updated Specs Grid with New Fields */}
              <div className="grid grid-cols-2 gap-y-4 py-5 border-y border-slate-50">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin size={14} className="text-emerald-500" />
                  <span className="text-[11px] font-bold truncate">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Users size={14} className="text-emerald-500" />
                  <span className="text-[11px] font-bold">{job.positions} Vacancies</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <GraduationCap size={14} className="text-emerald-500" />
                  <span className="text-[11px] font-bold truncate">{job.education}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <DollarSign size={14} className="text-emerald-500" />
                  <span className="text-[11px] font-bold">{job.salary}</span>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between pt-4 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-black text-slate-900 leading-none">{job.applicants}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Applied</span>
                  </div>
                  <div className="h-6 w-[1px] bg-slate-100" />
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${job.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{job.status}</span>
                  </div>
                </div>
                
                <Link href={`/admin-dashboard/jobs/details/${job.id}`}>
                  <button className="bg-slate-50 hover:bg-emerald-50 p-2 rounded-xl text-slate-400 hover:text-emerald-600 transition-all group/btn">
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredJobs.length === 0 && (
           <div className="col-span-full py-24 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
              <Filter size={48} className="mb-4 opacity-20" />
              <p className="font-black text-lg text-slate-900 uppercase">No Matches Found</p>
              <p className="text-sm font-medium italic">Adjust your search or filters to see more results.</p>
           </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for arrow icon used in Link
function ArrowRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}