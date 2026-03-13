'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, MapPin, Users, 
  Briefcase, DollarSign, MoreVertical, 
  Filter, GraduationCap, Trash2, XCircle, 
  CheckCircle2, FileText
} from 'lucide-react';

interface JobItem {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string; 
  salary: string;
  education: string;   
  positions: number;    
  lastDate: string;     
  applicants: number;
  status: string; 
  postedDate: string;
}

export default function JobsManagementPage() {
  const [filter, setFilter] = useState('All');
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🟢 Dropdown menu ke maslay ke liye
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // 🟢 1. FETCH JOBS API (Fixed: Added Authorization token)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5064/api/Jobs/all`, {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setJobs(data);
        } else {
          console.error("Failed to fetch jobs");
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

  // 🟢 2. DELETE API LOGIC
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this vacancy?")) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5064/api/Jobs/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          setJobs(jobs.filter(j => j.id !== id)); // Remove from UI instantly
        } else {
          alert("Failed to delete job.");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
      } finally {
        setOpenMenuId(null);
      }
    } else {
      setOpenMenuId(null);
    }
  };

  // 🟢 3. UPDATE STATUS API LOGIC
  const handleStatusChange = async (e: React.MouseEvent, id: string, newStatus: string) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5064/api/Jobs/update-status/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state to reflect changes instantly without reloading
        setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j));
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setOpenMenuId(null);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 text-black">
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
          <div key={job.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-visible flex flex-col">
            
            {/* Top Row: Icon & Actions */}
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${
                job.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                job.status === 'Draft' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
              }`}>
                <Briefcase size={24} />
              </div>
              <div className="flex items-center gap-2 relative">
                 <div className="text-right mr-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Deadline</p>
                    <p className="text-[11px] font-black text-rose-600">{job.lastDate}</p>
                 </div>
                 
                 {/* 🟢 3 Dots Button - Z-index aur stopPropagation add kiya */}
                 <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === job.id ? null : job.id);
                    }}
                    className="text-slate-300 hover:text-slate-900 transition-colors p-2 relative z-50 bg-white rounded-full hover:bg-slate-50"
                 >
                   <MoreVertical size={20} />
                 </button>

                 {/* 🟢 Dropdown Menu & Overlay */}
                 {openMenuId === job.id && (
                    <>
                      {/* Invisible overlay jo bahar click karne par menu band karega */}
                      <div 
                        className="fixed inset-0 z-40 cursor-default" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                        }} 
                      />

                      {/* Asli Dropdown Menu */}
                      <div className="absolute top-12 right-0 bg-white border border-slate-100 shadow-2xl rounded-2xl py-2 w-44 z-50 animate-in fade-in zoom-in-95 duration-200 text-black">
                        
                        <button onClick={(e) => handleStatusChange(e, job.id, 'Active')} className="w-full text-left px-4 py-2.5 text-[11px] font-black tracking-wider uppercase text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 transition-colors">
                          <CheckCircle2 size={14} /> Set Active
                        </button>

                        <button onClick={(e) => handleStatusChange(e, job.id, 'Draft')} className="w-full text-left px-4 py-2.5 text-[11px] font-black tracking-wider uppercase text-slate-500 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors">
                          <FileText size={14} /> Move to Draft
                        </button>

                        <button onClick={(e) => handleStatusChange(e, job.id, 'Closed')} className="w-full text-left px-4 py-2.5 text-[11px] font-black tracking-wider uppercase text-slate-500 hover:bg-amber-50 hover:text-amber-600 flex items-center gap-2 transition-colors">
                          <XCircle size={14} /> Mark Closed
                        </button>

                        <div className="h-px bg-slate-100 my-1 w-full" />
                        
                        <button onClick={(e) => handleDelete(e, job.id)} className="w-full text-left px-4 py-2.5 text-[11px] font-black tracking-wider uppercase text-slate-500 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-2 transition-colors">
                          <Trash2 size={14} /> Delete Vacancy
                        </button>
                      </div>
                    </>
                 )}
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

              {/* Specs Grid */}
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
                    <div className={`w-2 h-2 rounded-full ${
                      job.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 
                      job.status === 'Draft' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{job.status}</span>
                  </div>
                </div>
                
                {/* 🟢 Arrow Button (Navigates to details page) */}
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

// Sub-component for arrow icon
function ArrowRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}