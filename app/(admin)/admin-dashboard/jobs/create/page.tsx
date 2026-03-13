'use client';

import { useState } from 'react';
import { 
  Briefcase, MapPin, DollarSign, Plus, Trash2, 
  Save, ArrowLeft, Sparkles, CheckCircle2, 
  GraduationCap, Users, Calendar, FileText, Gift
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateJobPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // 🟢 State ko slightly update kiya (defaults empty rakhne ke liye)
  const [jobData, setJobData] = useState({
    title: '',
    department: '', // Changed from 'Engineering' to empty string for text input
    location: '',   // Changed from 'Remote' to empty string for text input
    type: 'Full-time',
    salary: '', 
    education: '', 
    positions: 1, 
    lastDate: '', 
    description: '',
    requirements: [''],
    benefits: [''], 
  });

  const addField = (field: 'requirements' | 'benefits') => {
    setJobData({ ...jobData, [field]: [...jobData[field], ''] });
  };

  const updateField = (field: 'requirements' | 'benefits', index: number, value: string) => {
    const newArr = [...jobData[field]];
    newArr[index] = value;
    setJobData({ ...jobData, [field]: newArr });
  };

  const removeField = (field: 'requirements' | 'benefits', index: number) => {
    const newArr = jobData[field].filter((_, i) => i !== index);
    setJobData({ ...jobData, [field]: newArr });
  };

  const handleSaveJob = async () => {
    // Basic Validation
    if (!jobData.title || !jobData.lastDate || !jobData.department || !jobData.location) {
      alert("Please fill in Job Title, Department, Location, and Deadline Date.");
      return;
    }

    setIsSaving(true);
    
    const payload = {
      title: jobData.title,
      department: jobData.department,
      location: jobData.location,
      type: jobData.type,
      salary: jobData.salary,
      education: jobData.education,
      positions: jobData.positions,
      lastDate: new Date(jobData.lastDate).toISOString(),
      description: jobData.description,
      requirements: JSON.stringify(jobData.requirements.filter(r => r.trim() !== '')),
      benefits: JSON.stringify(jobData.benefits.filter(b => b.trim() !== ''))
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5064/api/Jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Vacancy Published Successfully! 🎉");
        router.push('/admin-dashboard/jobs');
      } else {
        const err = await response.json();
        alert(`Failed to publish: ${err.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Server error occurred while saving the job.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-full mx-auto bg-slate-50/30 text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin-dashboard/jobs">
            <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Post New Opening</h1>
            <p className="text-slate-500 font-medium italic">Attract top talent to your organization</p>
          </div>
        </div>
        
        <button 
          onClick={handleSaveJob}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
        >
          {isSaving ? <Sparkles className="animate-spin" size={18} /> : <Save size={18} />}
          {isSaving ? "PUBLISHING..." : "PUBLISH VACANCY"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Job Title <span className="text-rose-500">*</span></label>
              <input 
                type="text"
                placeholder="e.g. Senior Full Stack Developer"
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all"
                value={jobData.title}
                onChange={(e) => setJobData({...jobData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Detailed Description</label>
              <textarea 
                rows={5}
                placeholder="Describe the role and day-to-day responsibilities..."
                className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all"
                value={jobData.description}
                onChange={(e) => setJobData({...jobData, description: e.target.value})}
              />
            </div>
          </div>

          {/* Requirements List */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <FileText size={18} />
                <label className="text-[10px] font-black uppercase tracking-widest">Candidate Requirements</label>
              </div>
              <button onClick={() => addField('requirements')} className="text-[10px] font-black uppercase text-slate-400 hover:text-emerald-500 flex items-center gap-1">
                <Plus size={14} /> Add Line
              </button>
            </div>
            <div className="space-y-3">
              {jobData.requirements.map((req, index) => (
                <div key={index} className="flex gap-3">
                  <input 
                    type="text"
                    placeholder="Specific skill or qualification..."
                    className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all"
                    value={req}
                    onChange={(e) => updateField('requirements', index, e.target.value)}
                  />
                  <button onClick={() => removeField('requirements', index)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits List */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Gift size={18} />
                <label className="text-[10px] font-black uppercase tracking-widest">Perks & Benefits</label>
              </div>
              <button onClick={() => addField('benefits')} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-500 flex items-center gap-1">
                <Plus size={14} /> Add Line
              </button>
            </div>
            <div className="space-y-3">
              {jobData.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-3">
                  <input 
                    type="text"
                    placeholder="Health insurance, Remote-first, etc."
                    className="flex-1 bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-blue-500 transition-all"
                    value={benefit}
                    onChange={(e) => updateField('benefits', index, e.target.value)}
                  />
                  <button onClick={() => removeField('benefits', index)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Attributes & Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
              <Briefcase size={18} className="text-emerald-500" />
              Job Attributes
            </h3>

            <div className="space-y-5">
              
              {/* 🟢 Department (Now a Text Input) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 pl-9 text-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all"
                    placeholder="e.g. Engineering, HR..."
                    value={jobData.department}
                    onChange={(e) => setJobData({...jobData, department: e.target.value})}
                  />
                </div>
              </div>

              {/* 🟢 Location (Now a Text Input with identical styling) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 pl-9 text-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all"
                    placeholder="City or Remote"
                    value={jobData.location}
                    onChange={(e) => setJobData({...jobData, location: e.target.value})}
                  />
                </div>
              </div>

              {/* Vacancies / Positions */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Vacancies</label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 pl-9 text-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all"
                    value={jobData.positions}
                    onChange={(e) => setJobData({...jobData, positions: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              {/* Salary Scale */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Scale</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 pl-9 text-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all"
                    placeholder="e.g. BPS-17 or PKR 100k - 120k"
                    value={jobData.salary}
                    onChange={(e) => setJobData({...jobData, salary: e.target.value})}
                  />
                </div>
              </div>

              {/* Education Requirement */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Education Requirement</label>
                <div className="relative">
                  <GraduationCap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 pl-9 text-sm font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-emerald-500 transition-all"
                    placeholder="e.g. Bachelor's in CS"
                    value={jobData.education}
                    onChange={(e) => setJobData({...jobData, education: e.target.value})}
                  />
                </div>
              </div>

              {/* Deadline Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-rose-500">Application Deadline <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 pl-9 text-sm font-bold text-slate-700 outline-none cursor-pointer ring-2 ring-transparent focus:ring-emerald-500 transition-all"
                    value={jobData.lastDate}
                    onChange={(e) => setJobData({...jobData, lastDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Job Type Tags */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Type</label>
                <div className="flex flex-wrap gap-2">
                  {['Full-time', 'Contract', 'Internship'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setJobData({...jobData, type: t})}
                      className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                        jobData.type === t ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-100/50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={20} />
              <span className="font-black text-sm uppercase tracking-tighter">Publishing Check</span>
            </div>
            <p className="text-xs font-bold leading-relaxed opacity-90">
              Ensure the deadline is at least 7 days from today. This job will be instantly visible in the "Available Jobs" tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}