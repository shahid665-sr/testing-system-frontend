'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings2, Plus, Trash2, Dices, Clock, Target, 
  ChevronRight, Briefcase, Percent, ShieldCheck, Loader2
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  bps: string;
  department: string;
}

interface TestRule {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  count: number;
}

export default function EnhancedTestOrchestrator() {
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState('');
  const [duration, setDuration] = useState(60);
  const [passingMarks, setPassingMarks] = useState(40);
  const [rules, setRules] = useState<TestRule[]>([
    { id: '1', category: 'English', difficulty: 'Medium', count: 10 }
  ]);

  const [announcedJobs, setAnnouncedJobs] = useState<Job[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5064';

        const response = await fetch(`${apiUrl}/api/AdminTests/available-jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAnnouncedJobs(data);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  const addRule = () => {
    setRules([...rules, { 
      id: Math.random().toString(), 
      category: 'General Knowledge', 
      difficulty: 'Easy', 
      count: 5 
    }]);
  };

  const updateRule = (index: number, field: keyof TestRule, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const removeRule = (id: string) => setRules(rules.filter(r => r.id !== id));

  const totalQuestions = rules.reduce((acc, curr) => acc + Number(curr.count), 0);

  // 🟢 YAHAN CHANGE KIYA HAI: Payload mein Title, Date aur QuestionsCount add kiye
  const handlePublish = async () => {
    if (!selectedJobId) return;
    setIsSubmitting(true);
    
    // Job ka title nikal rahe hain taake test ka title ban sake
    const selectedJob = announcedJobs.find(j => j.id === selectedJobId);
    const testTitle = selectedJob ? `${selectedJob.title} Assessment` : 'Untitled Assessment';

    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5064';
    
    // 🟢 Backend ke Model (CreateTestRequest) ke mutabiq perfect data:
    const payload = {
      jobId: parseInt(selectedJobId),
      title: testTitle,                      // Added missing title
      date: new Date().toISOString(),        // Added missing date
      duration: duration,
      questionsCount: totalQuestions,        // Added missing questions count
      passingMarks: passingMarks,
      rules: rules.map(r => ({
        category: r.category,
        difficulty: r.difficulty,
        count: Number(r.count)
      }))
    };

    try {
      const response = await fetch(`${apiUrl}/api/AdminTests/create`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Assessment Published Successfully! ✅");
        router.push('/admin-dashboard/tests'); 
      } else {
        const errorData = await response.json();
        alert(`Failed to publish assessment: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error publishing:", error);
      alert("Server error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-full text-black mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500 w-3 h-3 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">New Assessment Session</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Test Orchestrator</h1>
          <p className="text-slate-500 font-medium italic">Assign question patterns to official job announcements</p>
        </div>
        
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Marks</p>
            <p className="text-2xl font-black text-slate-900">{totalQuestions} <span className="text-slate-300 text-sm">Pts</span></p>
          </div>
          <div className="w-[1px] h-10 bg-slate-100 mx-2" />
          <div className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl shadow-slate-200">
            <Target size={24} className="text-emerald-400" />
            <span className="font-black text-xl">{totalQuestions} Qs</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Job & Basic Config */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={16} className="text-blue-500" /> Job Selection
            </h3>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Announced Position</label>
              <select 
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                <option value="">Select a Job Opening...</option>
                {announcedJobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} (BPS-{job.bps}) - {job.department}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 font-black text-sm outline-none"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pass %</label>
                <div className="relative">
                  <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 font-black text-sm outline-none"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
            <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/50 group-hover:scale-110 transition-transform" />
            <h4 className="font-black text-lg mb-2 relative z-10">Proctoring Ready</h4>
            <p className="text-xs font-medium text-emerald-100 leading-relaxed relative z-10">
              This test will include automated tab-tracking, identity verification, and anti-cheat randomization by default.
            </p>
          </div>
        </div>

        {/* Right Column: Rule Builder */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Question Bank Mapping</h3>
            <button 
              onClick={addRule}
              className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-2"
            >
              <Plus size={14} /> Add Pattern Rule
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={rule.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap md:flex-nowrap items-center gap-4 group">
                <span className="w-10 h-10 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs">
                  {index + 1}
                </span>

                <div className="flex-1 min-w-[150px]">
                  <p className="text-[9px] font-black text-slate-300 uppercase mb-1 ml-1">Category</p>
                  <select 
                    value={rule.category}
                    onChange={(e) => updateRule(index, 'category', e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>English</option>
                    <option>Computer Science</option>
                    <option>General Knowledge</option>
                    <option>Everyday Science</option>
                    <option>Islamic Studies</option>
                  </select>
                </div>

                <div className="w-40">
                  <p className="text-[9px] font-black text-slate-300 uppercase mb-1 ml-1">Difficulty</p>
                  <select 
                    value={rule.difficulty}
                    onChange={(e) => updateRule(index, 'difficulty', e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-[10px] font-black uppercase border-2 outline-none transition-all ${
                      rule.difficulty === 'Easy' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' :
                      rule.difficulty === 'Medium' ? 'border-amber-100 bg-amber-50 text-amber-600' :
                      'border-rose-100 bg-rose-50 text-rose-600'
                    }`}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>

                <div className="w-24">
                  <p className="text-[9px] font-black text-slate-300 uppercase mb-1 ml-1">Question Qty</p>
                  <input 
                    type="number" 
                    value={rule.count}
                    onChange={(e) => updateRule(index, 'count', e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs font-black outline-none"
                  />
                </div>

                <button 
                  onClick={() => removeRule(rule.id)}
                  className="mt-4 md:mt-0 p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <button 
              onClick={handlePublish}
              disabled={!selectedJobId || isSubmitting}
              className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Dices size={24} />}
              {isSubmitting ? "PUBLISHING..." : "PUBLISH OFFICIAL ASSESSMENT"}
              {!isSubmitting && <ChevronRight size={20} />}
            </button>
            {!selectedJobId && <p className="text-center text-rose-500 text-[10px] font-black uppercase mt-4 tracking-widest animate-bounce">Please select a job position to continue</p>}
          </div>
        </div>
      </div>
    </div>
  );
}