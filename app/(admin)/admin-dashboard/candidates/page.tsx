'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Key, UserX, MapPin, Calendar, AlertTriangle
} from 'lucide-react';

// 1. TypeScript Interface: Defines the expected shape of candidate data from the backend
interface Candidate {
  id: number;
  name: string;
  cnic: string;
  district: string;
  score: number | null;
  date: string;
}

export default function CandidatesPage() {
  // 2. React States for search query, candidates list, and loading status
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. API Fetching Logic
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        // Fetching data from the .NET Backend API
        const response = await fetch(`http://localhost:5064/api/admin/candidates?search=${searchTerm}`);
        if (response.ok) {
          const data = await response.json();
          setCandidates(data);
        }
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce implementation to delay the API call until the user stops typing (300ms)
    const timeoutId = setTimeout(() => {
      fetchCandidates();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // --- NEW ACTION HANDLERS ---

  // 4. Delete Logic: Sends a DELETE request to the backend and removes the candidate from UI
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete ${name}?`)) {
      try {
        const response = await fetch(`http://localhost:5064/api/admin/candidates/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Instantly remove the deleted candidate from the table without refreshing the page
          setCandidates(candidates.filter(c => c.id !== id));
          alert(`${name} has been deleted successfully.`);
        } else {
          // If response is not ok, it might be due to database foreign key constraints
          alert("Failed to delete candidate. They might have dependent records (e.g., test scores) in the database.");
        }
      } catch (error) {
        console.error("Error deleting candidate:", error);
      }
    }
  };

  // 5. Reset Password Logic: Triggers the reset password API endpoint
  const handleResetPassword = async (id: number, name: string) => {
    try {
      const response = await fetch(`http://localhost:5064/api/admin/candidates/${id}/reset-password`, {
        method: 'POST',
      });

      if (response.ok) {
        alert(`Password reset link sent securely for ${name}.`);
      } else {
        alert("Failed to initiate password reset.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Candidate Accounts</h1>
          <p className="text-slate-500 font-medium italic">Manage applicant security and database records</p>
        </div>
        
        <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
          <Download size={18} /> EXPORT DATABASE
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Name, CNIC or District..."
            className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate Profile</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity Info</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Progress</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              
              {/* Conditional Rendering: Loading, Empty, or Data state */}
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500 font-bold">Loading records...</td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500 font-bold">No candidates found.</td>
                </tr>
              ) : (
                candidates.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-base">{user.name}</p>
                          <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Registered: {user.date}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-700 font-mono tracking-tight">{user.cnic}</p>
                        <div className="flex items-center gap-1 text-emerald-600">
                          <MapPin size={12} fill="currentColor" className="opacity-20" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{user.district}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-6">
                      {user.score !== null ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center max-w-[100px]">
                             <span className="text-[10px] font-black text-slate-400">SCORE</span>
                             <span className="text-xs font-black text-slate-900">{user.score}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 max-w-[120px] rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${user.score}%` }} />
                          </div>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-lg uppercase tracking-tighter">Not Attempted</span>
                      )}
                    </td>

                    <td className="p-6">
                      <div className="flex items-center justify-center gap-3">
                        {/* CONNECTED: Reset Password Button */}
                        <button 
                          onClick={() => handleResetPassword(user.id, user.name)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                        >
                          <Key size={14} /> Reset
                        </button>

                        {/* CONNECTED: Delete Button */}
                        <button 
                          onClick={() => handleDelete(user.id, user.name)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
                        >
                          <UserX size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Note */}
      <div className="bg-slate-900 rounded-[2rem] p-6 flex items-center gap-4 text-white">
        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
          <AlertTriangle className="text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Administrative Protocol</p>
          <p className="text-sm font-medium text-slate-300">
            Deleting a candidate account will **permanently remove** all their test history and merit records. Resetting passwords will send a temporary secure link to their registered email.
          </p>
        </div>
      </div>
    </div>
  );
}