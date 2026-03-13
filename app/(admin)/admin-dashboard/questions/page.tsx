'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import QuestionForm from '@/components/admin/questions/modal/QuestionForm';
import { QuestionHeader } from '@/components/admin/questions/QuestionHeader';
import { QuestionFilters } from '@/components/admin/questions/QuestionFilters';
import { QuestionTable } from '@/components/admin/questions/QuestionTable';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false); // 🟢 Import Loading state
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🟢 Fixed the missing fileInputRef error
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal & Edit States
  const [showForm, setShowForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null); // EDIT LOGIC: Ye line add ki hai
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]); // 🟢 Added apiUrl to dependency array to satisfy React rules

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleDelete = async (id: number) => {
    
    if (confirm("Are you sure you want to delete this question?")) {
      const res = await fetch(`${apiUrl}/api/admin/questions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchQuestions(); // Refresh list
    }
  };

  const handleAddNew = () => {
    setSelectedQuestion(null);
    setShowForm(true);
  };

  const handleEdit = (q: any) => {
    setSelectedQuestion(q);
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setSelectedQuestion(null);
  };

  // 🟢 IMPORT LOGIC: Hidden input ko click karwana
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 🟢 IMPORT LOGIC: File select hone ke baad backend par bhejna
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch('http://localhost:5064/api/admin/questions/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // Success message
        fetchQuestions();    // Table refresh karein
      } else {
        alert("Failed to import questions. Please check the CSV format.");
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("An error occurred while importing.");
    } finally {
      setIsImporting(false);
      // Reset input taake same file dobara select ho sake
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const filteredQuestions = questions.filter((q: any) => {
    const matchesTab = activeTab === 'All' || q.category === activeTab;
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.id.toString().includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-8 space-y-8 relative min-h-screen">
      
      {/* HIDDEN FILE INPUT */}
      <input 
        type="file" 
        accept=".csv" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />

      <QuestionHeader 
        count={filteredQuestions.length} 
        total={questions.length} 
        onAddNew={handleAddNew}  
        onImport={handleImportClick} // CONNECTED: Ye prop QuestionHeader mein pass karein
      />

      <QuestionFilters 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />

      {isImporting ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
           <Loader2 size={40} className="animate-spin mb-4 text-emerald-500" />
           <p className="font-bold text-slate-900 uppercase tracking-widest">Importing Questions...</p>
        </div>
      ) : (
        <QuestionTable 
          questions={filteredQuestions} 
          isLoading={isLoading} 
          onEdit={handleEdit}      
          onDelete={handleDelete}
        />
      )}

      {/* Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <button onClick={handleCloseModal} className="absolute top-6 right-8 z-50 text-slate-400 hover:text-slate-900">
              <X size={24} />
            </button>
            <QuestionForm 
              initialData={selectedQuestion} 
              onSuccess={() => { handleCloseModal(); fetchQuestions(); }} 
              onCancel={handleCloseModal} 
            />
          </div>
        </div>
      )}
    </div>
  );
}