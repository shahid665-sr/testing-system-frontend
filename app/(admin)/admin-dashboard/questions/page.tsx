'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import QuestionForm from '@/components/admin/questions/modal/QuestionForm';
import { QuestionHeader } from '@/components/admin/questions/QuestionHeader';
import { QuestionFilters } from '@/components/admin/questions/QuestionFilters';
import { QuestionTable } from '@/components/admin/questions/QuestionTable';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal & Edit States
  const [showForm, setShowForm] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null); // EDIT LOGIC: Ye line add ki hai

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5064/api/admin/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      const res = await fetch(`http://localhost:5064/api/admin/questions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchQuestions(); // Refresh list
    }
  };

  // EDIT LOGIC: Naya question add karne ka function
  const handleAddNew = () => {
    setSelectedQuestion(null);
    setShowForm(true);
  };

  // EDIT LOGIC: Purana question edit karne ka function
  const handleEdit = (q: any) => {
    setSelectedQuestion(q);
    setShowForm(true);
  };

  // EDIT LOGIC: Modal close karne ka function
  const handleCloseModal = () => {
    setShowForm(false);
    setSelectedQuestion(null);
  };

  const filteredQuestions = questions.filter((q: any) => {
    const matchesTab = activeTab === 'All' || q.category === activeTab;
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.id.toString().includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-8 space-y-8 relative min-h-screen">
      <QuestionHeader 
        count={filteredQuestions.length} 
        total={questions.length} 
        onAddNew={handleAddNew}  // CONNECTED: Add New
      />

      <QuestionFilters 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />

      <QuestionTable 
        questions={filteredQuestions} 
        isLoading={isLoading} 
        onEdit={handleEdit}      // CONNECTED: Edit function pass kar diya
        onDelete={handleDelete}
      />

      {/* Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <button onClick={handleCloseModal} className="absolute top-6 right-8 z-50 text-slate-400 hover:text-slate-900">
              <X size={24} />
            </button>
            <QuestionForm 
              initialData={selectedQuestion} // CONNECTED: 
              onSuccess={() => { handleCloseModal(); fetchQuestions(); }} 
              onCancel={handleCloseModal} 
            />
          </div>
        </div>
      )}
    </div>
  );
}