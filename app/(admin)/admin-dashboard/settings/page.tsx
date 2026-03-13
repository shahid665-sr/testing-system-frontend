'use client';

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, UserPlus, Mail, Trash2, 
  Globe, Building2, Key, Loader2, Plus, X 
} from 'lucide-react';

interface AdminMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function SettingsPage() {
  const [systemName, setSystemName] = useState('Balochistan Testing Service');
  const [supportEmail, setSupportEmail] = useState('support@bts.gob.pk');
  
  const [adminTeam, setAdminTeam] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for adding new admin
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Viewer');
  const [isAdding, setIsAdding] = useState(false);

  // 🟢 Edit Role Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminMember | null>(null);
  const [editRole, setEditRole] = useState('Viewer');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5064';

  // Fetch admin team from database
  const fetchAdminTeam = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/AdminSettings/team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAdminTeam(data);
      }
    } catch (error) {
      console.error("Failed to fetch admin team:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminTeam();
    const savedName = localStorage.getItem('orgName');
    const savedEmail = localStorage.getItem('orgEmail');
    if (savedName) setSystemName(savedName);
    if (savedEmail) setSupportEmail(savedEmail);
  }, []);

  const handleUpdateIdentity = () => {
    localStorage.setItem('orgName', systemName);
    localStorage.setItem('orgEmail', supportEmail);
    alert('Organization Info Updated Successfully!');
  };

  const handleAddAdmin = async () => {
    if (!newName || !newEmail) {
      alert("Please provide both name and email.");
      return;
    }
    
    setIsAdding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/AdminSettings/add-admin`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name: newName, email: newEmail, roleLabel: newRole })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Admin Added Successfully!\n\nEmail: ${newEmail}\nDefault Password: ${result.defaultPassword}`);
        setNewName('');
        setNewEmail('');
        fetchAdminTeam();
      } else {
        alert(result.message || "Failed to add admin.");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      alert("Server error occurred.");
    } finally {
      setIsAdding(false);
    }
  };

  // Delete Admin Function
  const handleDeleteAdmin = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this admin?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/AdminSettings/delete-admin/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setAdminTeam(adminTeam.filter(a => a.id !== id));
      } else {
        alert("Failed to delete admin.");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  // Open Edit Modal
  const openEditModal = (admin: AdminMember) => {
    setEditingAdmin(admin);
    setEditRole(admin.role);
    setIsEditModalOpen(true);
  };

  // Submit Role Update
  const submitRoleUpdate = async () => {
    if (!editingAdmin) return;
    setIsUpdatingRole(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/AdminSettings/update-role/${editingAdmin.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ roleLabel: editRole })
      });

      if (response.ok) {
        fetchAdminTeam(); // Refresh table data
        setIsEditModalOpen(false); // Close Modal
      } else {
        alert("Failed to update role.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 text-black relative">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 font-medium italic">Configure core platform behavior and manage administrative access</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: System Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" /> Organization Info
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Name</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="email" 
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@bts.gob.pk"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleUpdateIdentity}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              Update Identity
            </button>
          </div>

          <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100">
             <div className="flex items-center gap-3 mb-2 text-rose-600">
                <ShieldCheck size={20} />
                <h4 className="font-black text-xs uppercase tracking-widest">Security Protocol</h4>
             </div>
             <p className="text-[11px] font-bold text-rose-700/70 leading-relaxed uppercase">
                Two-Factor Authentication (2FA) is currently mandatory for all Super-Admin accounts.
             </p>
          </div>
        </div>

        {/* Right: Admin Team Management */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                  <UserPlus size={18} className="text-emerald-500" /> Admin Team
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Manage access levels for staff members</p>
              </div>
            </div>

            <div className="p-4 overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12 text-slate-400">
                  <Loader2 className="animate-spin mr-2" size={24} /> Fetching Staff Records...
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="p-4">Staff Member</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {adminTeam.map((member) => (
                      <tr key={member.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs uppercase border border-slate-200">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm whitespace-nowrap">{member.name}</p>
                              <p className="text-[11px] font-bold text-slate-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border whitespace-nowrap ${
                            member.role === 'Owner' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            member.role === 'Editor' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                            <span className="text-[10px] font-black uppercase text-slate-600 tracking-tighter">{member.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* 🟢 Edit Button */}
                            <button onClick={() => openEditModal(member)} className="p-2 text-slate-300 hover:text-slate-900 bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all" title="Edit Permissions">
                              <Key size={16} />
                            </button>
                            {/* 🟢 Delete Button */}
                            <button onClick={() => handleDeleteAdmin(member.id)} className="p-2 text-slate-300 hover:text-rose-600 bg-white border border-transparent hover:border-rose-100 hover:bg-rose-50 rounded-lg transition-all" title="Remove Access">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {adminTeam.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                          No administrators found in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick Create Admin Form Section */}
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-dashed border-slate-200">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex justify-between items-center">
              Quick-Add Staff
              {isAdding && <Loader2 className="animate-spin text-emerald-500" size={16} />}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <input 
                type="text" 
                placeholder="Full Name" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="md:col-span-4 bg-white border-none rounded-xl px-4 py-3 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-emerald-500" 
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="md:col-span-4 bg-white border-none rounded-xl px-4 py-3 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-emerald-500" 
              />
              <div className="md:col-span-4 flex gap-2">
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-white border-none rounded-xl px-3 py-3 text-[10px] font-black uppercase shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option>Viewer</option>
                  <option>Editor</option>
                  <option>Super Admin</option>
                </select>
                <button 
                  onClick={handleAddAdmin}
                  disabled={isAdding || !newName || !newEmail}
                  className="bg-emerald-600 text-white px-4 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0 flex items-center justify-center"
                  title="Save Admin"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <p className="text-[9px] font-medium text-slate-400 mt-4 uppercase tracking-widest italic">
              A default password will be generated for the new administrator.
            </p>
          </div>
        </div>
      </div>

      {/* 🟢 Edit Permissions Modal with high z-index */}
      {isEditModalOpen && editingAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">
              <X size={20} />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-1">Edit Permissions</h3>
            <p className="text-sm font-bold text-slate-400 mb-6">Modify access level for {editingAdmin.name}</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Role</label>
                <select 
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="Viewer">Viewer (Read Only)</option>
                  <option value="Editor">Editor (Can Modify)</option>
                  <option value="Owner">Owner / Super Admin</option>
                </select>
              </div>
              
              <button 
                onClick={submitRoleUpdate}
                disabled={isUpdatingRole}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center"
              >
                {isUpdatingRole ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}