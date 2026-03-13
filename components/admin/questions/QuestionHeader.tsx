import { FileUp, Plus } from 'lucide-react';

interface Props {
  count: number;
  total: number;
  onAddNew: () => void;
  onImport?: () => void; //  NEW: Import ke liye naya prop add kiya
}

export const QuestionHeader = ({ count, total, onAddNew, onImport }: Props) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Question Bank</h1>
      <p className="text-slate-500 font-medium italic">
        Showing {count} of {total} Items
      </p>
    </div>
    <div className="flex gap-3">
      <button 
        onClick={onImport} //  CONNECTED: Ye button ab file explorer open karega
        className="flex items-center gap-2 bg-white border-2 border-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all"
      >
        <FileUp size={18} /> IMPORT
      </button>
      <button 
        onClick={onAddNew}
        className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
      >
        <Plus size={18} /> ADD NEW
      </button>
    </div>
  </div>
);