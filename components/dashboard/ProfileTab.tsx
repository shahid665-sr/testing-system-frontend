'use client';

import { useState } from 'react';
import { 
  User, Mail, CreditCard, Phone, MapPin, Calendar, 
  GraduationCap, ShieldCheck, Edit3, Plus, X, 
  Loader2, CheckCircle2, FileText, Lock, Eye, EyeOff
} from "lucide-react";

type UserData = {
  name: string;
  email: string;
  cnic: string;
  phone: string;
  city: string;
  registrationDate: string;
  education?: { degree: string; institution: string; year: string }[];
};

type ProfileTabProps = {
  userData: UserData;
};

const EDUCATION_LEVELS = ['SSC', 'HSSC', 'Bachelors', 'Masters', 'PhD'];

export default function ProfileTab({ userData }: ProfileTabProps) {
  // --- Modals State ---
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [isBasicInfoModalOpen, setIsBasicInfoModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- Password Visibility State ---
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // --- Form Data States ---
  const [eduFormData, setEduFormData] = useState({
    level: 'Bachelors', title: '', startDate: '', endDate: '', file: null as File | null
  });

  const [basicInfoData, setBasicInfoData] = useState({
    name: userData.name,
    phone: userData.phone === 'Not Provided' ? '' : userData.phone,
    city: userData.city === 'Not Provided' ? '' : userData.city,
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '', newPassword: '', confirmPassword: ''
  });

  // --- API Handlers ---
  const handleEduSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5064/api/CandidateDashboard/add-education', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          level: eduFormData.level, 
          title: eduFormData.title, 
          startDate: eduFormData.startDate, 
          endDate: eduFormData.endDate,
          filePath: "N/A" 
        })
      });
      if (response.ok) window.location.reload();
      else alert("Error adding education");
    } finally { setIsSubmitting(false); }
  };

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5064/api/CandidateDashboard/update-profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: basicInfoData.name,
          Phone: basicInfoData.phone,
          City: basicInfoData.city
        })
      });
      if (response.ok) window.location.reload();
      else alert("Error updating basic info");
    } finally { setIsSubmitting(false); }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) { 
      alert("New Passwords do not match!"); 
      return; 
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5064/api/CandidateDashboard/change-password', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ OldPassword: passwordData.oldPassword, NewPassword: passwordData.newPassword })
      });
      if (response.ok) { 
        alert("Password Updated Successfully! ✅"); 
        setIsPasswordModalOpen(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else { 
        const err = await response.json(); 
        alert(err.message || "Failed to update password."); 
      }
    } finally { setIsSubmitting(false); }
  };

  // --- Dynamic Profile Strength Calculation ---
  const calculateStrength = () => {
    let s = 40;
    if (userData.phone && userData.phone !== 'Not Provided') s += 30;
    if (userData.education && userData.education.length > 0) s += 30;
    return s;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* 🟢 Profile Header Card (Exact Original Design) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center relative group">
          <User size={48} className="text-emerald-400" />
          <button onClick={() => setIsBasicInfoModalOpen(true)} className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-lg shadow-lg hover:scale-110 transition-transform">
            <Edit3 size={14} className="text-white" />
          </button>
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-bold">{userData.name}</h3>
          <p className="text-slate-400 text-sm mt-1">{userData.email}</p>
          <div className="flex items-center gap-2 mt-4">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">Verified Candidate</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* 🟢 Personal Information Grid (Exact Original Design) */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tighter">Personal Information</h4>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <DisplayField icon={User} label="Full Name" value={userData.name} />
              <DisplayField icon={Mail} label="Email Address" value={userData.email} />
              <DisplayField icon={CreditCard} label="CNIC Number" value={userData.cnic} />
              <DisplayField icon={Phone} label="Contact Phone" value={userData.phone} />
              <DisplayField icon={MapPin} label="Residential City" value={userData.city} />
              <DisplayField icon={Calendar} label="Member Since" value={userData.registrationDate} />
            </div>
          </div>

          {/* 🟢 Academic History (Exact Original Design) */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                <GraduationCap size={18} className="text-blue-600" /> Academic History
              </h4>
              <button onClick={() => setIsEduModalOpen(true)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                <Plus size={14} /> Add New
              </button>
            </div>
            <div className="p-6 space-y-4">
              {userData.education && userData.education.length > 0 ? (
                userData.education.map((edu, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/30 group hover:border-blue-200 transition-colors">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-400 group-hover:text-blue-600 transition-colors">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{edu.degree}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{edu.institution}</p>
                      <span className="inline-block mt-2 text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">Class of {edu.year}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-slate-400 text-sm font-medium">No records added.</p>
              )}
            </div>
          </div>
        </div>

        {/* 🟢 Action Sidebar (Exact Original Design) */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Account Actions</h4>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <SidebarButton icon={Edit3} label="Edit Basic Info" primary onClick={() => setIsBasicInfoModalOpen(true)} />
            <SidebarButton icon={GraduationCap} label="Update Education" onClick={() => setIsEduModalOpen(true)} />
            <SidebarButton icon={ShieldCheck} label="Change Password" onClick={() => setIsPasswordModalOpen(true)} />
          </div>
          
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-tighter mb-2">Profile Strength</p>
            <div className="h-2 w-full bg-emerald-200 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-emerald-600 transition-all duration-1000" style={{ width: `${calculateStrength()}%` }}></div>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
              Profile completion: {calculateStrength()}%. Complete details to improve chances.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🟢 MODAL 1: ADD EDUCATION (Emerald Registration Style + Attachment) */}
      {/* ========================================================================= */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 overflow-y-auto py-10">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><GraduationCap className="text-emerald-600" /> Add New Record</h3>
              <button onClick={() => setIsEduModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleEduSubmit} className="p-6 space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest block text-center">Highest Qualification Level</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {EDUCATION_LEVELS.map((lvl) => (
                    <button key={lvl} type="button" onClick={() => setEduFormData({...eduFormData, level: lvl})} className={`py-3 rounded-xl font-bold text-[10px] uppercase transition-all border-2 ${eduFormData.level === lvl ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200 shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-200'}`}>{lvl}</button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-xs"><CheckCircle2 size={14} /> Level: {eduFormData.level}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><GraduationCap size={14}/> Degree Title / Institution</label>
                    <input required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. BS Computer Science" value={eduFormData.title} onChange={(e) => setEduFormData({...eduFormData, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><Calendar size={14}/> Start Date</label>
                    <input type="date" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500" value={eduFormData.startDate} onChange={(e) => setEduFormData({...eduFormData, startDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><Calendar size={14}/> End / Passing Date</label>
                    <input type="date" required className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500" value={eduFormData.endDate} onChange={(e) => setEduFormData({...eduFormData, endDate: e.target.value})} />
                  </div>
                  <div className="md:col-span-2 space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><FileText size={14}/> Certificate Attachment (PDF/JPG)</label>
                    <input type="file" required accept=".pdf,.jpg,.jpeg,.png" className="w-full px-4 py-2 bg-white border border-dashed border-slate-300 rounded-xl file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700" />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all">
                {isSubmitting ? <Loader2 className="animate-spin"/> : <><CheckCircle2 size={20}/> Save Qualification</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🟢 MODAL 2: EDIT BASIC INFO (Beautiful Clean Design) */}
      {/* ========================================================================= */}
      {isBasicInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Edit3 className="text-slate-700" size={20}/> Edit Basic Info</h3>
              <button onClick={() => setIsBasicInfoModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleBasicInfoSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Full Name</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-slate-400" placeholder="e.g. John Doe" value={basicInfoData.name} onChange={(e) => setBasicInfoData({...basicInfoData, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Phone Number</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-slate-400" placeholder="e.g. 03XXXXXXXXX" value={basicInfoData.phone} onChange={(e) => setBasicInfoData({...basicInfoData, phone: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Residential City</label>
                <input required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-slate-400" placeholder="e.g. Quetta" value={basicInfoData.city} onChange={(e) => setBasicInfoData({...basicInfoData, city: e.target.value})} />
              </div>
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin"/> : <><CheckCircle2 size={20}/> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🟢 MODAL 3: CHANGE PASSWORD (With Working Eye Toggles) */}
      {/* ========================================================================= */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Lock className="text-emerald-600" size={20}/> Change Password</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
              
              <div className="relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Current Password</label>
                <input required type={showOldPass ? "text" : "password"} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500 pr-12" placeholder="Enter current password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} />
                <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-4 top-8 text-slate-400 hover:text-slate-600 transition-colors">
                  {showOldPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">New Password</label>
                <input required type={showNewPass ? "text" : "password"} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500 pr-12" placeholder="Enter new password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-8 text-slate-400 hover:text-slate-600 transition-colors">
                  {showNewPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Confirm New Password</label>
                <input required type={showConfirmPass ? "text" : "password"} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-emerald-500 pr-12" placeholder="Confirm new password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-8 text-slate-400 hover:text-slate-600 transition-colors">
                  {showConfirmPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><Lock size={18}/> Update Password</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 🟢 Sub Components
function DisplayField({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Icon size={12} /> {label}</p>
      <p className="text-sm font-bold text-slate-800 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">{value}</p>
    </div>
  );
}

function SidebarButton({ icon: Icon, label, primary = false, onClick }: { icon: any; label: string; primary?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} type="button" className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${primary ? "bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"}`}>
      <Icon size={16} /> {label}
    </button>
  );
}