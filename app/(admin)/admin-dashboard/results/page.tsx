'use client';

import { useState, useEffect } from 'react';
import { 
  Trophy, Users, TrendingUp, Download, Search,
  ChevronRight, BarChart, Award, FileSpreadsheet,
  Calendar, CheckCircle, XCircle, Layout, Loader2, Database
} from 'lucide-react';

export default function ResultsPage() {
  const [testDatabase, setTestDatabase] = useState<any>({});
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🟢 ONLY REAL DATABASE API FETCH
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5064/api/AdminResults/all-results', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data && data.length > 0) {
            const formattedData: any = {};
            data.forEach((job: any) => {
              const passPercentage = job.total > 0 ? Math.round((job.passCount / job.total) * 100) : 0;
              formattedData[job.id] = {
                name: job.name,
                date: job.date,
                stats: { 
                  pass: `${passPercentage}%`, 
                  total: job.total, 
                  high: job.highScore,
                  passCount: job.passCount,
                  failCount: job.failCount
                },
                merit: job.merit.map((m: any, index: number) => ({
                  rank: index + 1,
                  name: m.name,
                  rollNo: m.rollNo,
                  score: m.score,
                  district: m.district
                }))
              };
            });
            
            setTestDatabase(formattedData);
            setSelectedTest(Object.keys(formattedData)[0]); // Select first real test
          } else {
            setTestDatabase({});
            setSelectedTest(null);
          }
        }
      } catch (error) {
        console.error("API Error connecting to database.", error);
        setTestDatabase({});
        setSelectedTest(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-slate-400 space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} /> 
        <p className="text-xs font-black uppercase tracking-widest">Fetching Real Database...</p>
      </div>
    );
  }

  // 🟢 EMPTY STATE: Jab Database mein koi result na ho
  if (!selectedTest || Object.keys(testDatabase).length === 0) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-500 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center max-w-lg">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database className="text-slate-300" size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No Results Found</h2>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            There are no test results available in the database yet. Once assessments are completed and results are generated, they will automatically appear here.
          </p>
        </div>
      </div>
    );
  }

  const currentData = testDatabase[selectedTest];
  const testIds = Object.keys(testDatabase);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Test Selector Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Layout size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">Active Report</p>
              <select 
                className="bg-transparent text-2xl font-black outline-none cursor-pointer border-b-2 border-emerald-500/30 focus:border-emerald-500 transition-all pr-8 appearance-none"
                value={selectedTest}
                onChange={(e) => setSelectedTest(e.target.value)}
              >
                {testIds.map(id => (
                  <option key={id} value={id} className="text-slate-900">
                    {testDatabase[id].name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-6 px-8 py-4 bg-slate-800/50 rounded-3xl border border-slate-700">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Exam Date</p>
              <p className="text-sm font-bold flex items-center gap-2"><Calendar size={14}/> {currentData.date}</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-700" />
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Test ID</p>
              <p className="text-sm font-bold text-emerald-400">{selectedTest}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Candidates" value={currentData.stats.total} icon={<Users />} color="blue" />
        <StatCard title="Passing Rate" value={currentData.stats.pass} icon={<TrendingUp />} color="emerald" />
        <StatCard title="Highest Score" value={`${currentData.stats.high}/100`} icon={<Trophy />} color="amber" />
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass/Fail Ratio</p>
                <div className="flex items-center gap-3">
                    <span className="text-emerald-500 flex items-center gap-1 font-black text-lg"><CheckCircle size={16}/> {currentData.stats.passCount}</span>
                    <span className="text-rose-500 flex items-center gap-1 font-black text-lg"><XCircle size={16}/> {currentData.stats.failCount}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Merit List */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-900 flex items-center gap-2 uppercase text-xs tracking-widest">
              <Award className="text-emerald-500" size={18} /> Merit List: {currentData.name.split(' ')[0]}
            </h3>
            <button className="text-[10px] font-black text-emerald-600 hover:underline uppercase">Download PDF</button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-slate-50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Rank</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Candidate</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase">District</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentData.merit.map((item: any) => (
                <tr key={item.rank} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs italic">
                      #{item.rank}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-slate-900 text-sm">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest">{item.rollNo}</p>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-600 italic underline decoration-emerald-200 underline-offset-4">
                    {item.district}
                  </td>
                  <td className="p-6 text-center">
                    <span className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-100">
                      {item.score}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-200">
            <h3 className="font-black uppercase text-xs tracking-[0.2em] mb-4 opacity-80">Official Actions</h3>
            <div className="space-y-3">
                <button className="w-full bg-white text-emerald-600 p-4 rounded-2xl font-black text-xs flex items-center justify-between group hover:scale-[1.02] transition-all">
                    GENERATE GAZETTE <Download size={16} />
                </button>
                <button className="w-full bg-emerald-700 text-emerald-100 p-4 rounded-2xl font-black text-xs flex items-center justify-between group hover:bg-emerald-800 transition-all">
                    EMAIL ALL CANDIDATES <ChevronRight size={16} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Small Stat Card for internal use
function StatCard({ title, value, icon, color }: any) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100'
    };
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${colors[color as keyof typeof colors]}`}>
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <h4 className="text-xl font-black text-slate-900">{value}</h4>
            </div>
        </div>
    );
}