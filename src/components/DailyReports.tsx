import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Calendar, 
  ChevronRight, 
  Search,
  FileText,
  Save,
  X,
  AlertCircle
} from 'lucide-react';

interface DailyReport {
  id: string;
  date: string;
  title: string;
  content: string;
  tags?: string[];
}

export default function DailyReports({ 
  reports, 
  setReports 
}: { 
  reports: DailyReport[], 
  setReports: any 
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.content.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAdd = (report: Omit<DailyReport, 'id'>) => {
    const newReport = { ...report, id: Math.random().toString(36).substring(7) };
    setReports([newReport, ...reports]);
    setIsAdding(false);
  };

  const handleUpdate = (report: DailyReport) => {
    setReports(reports.map(r => r.id === report.id ? report : r));
    setEditingReport(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este relatório?')) {
      setReports(reports.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-3xl">
          <div className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">Total de Notas</div>
          <div className="text-2xl font-black text-primary">{reports.length}</div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-primary p-4 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          <Plus size={24} />
          <span className="ml-2 font-black uppercase text-[10px] tracking-widest">Nova Nota</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar em seus relatórios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-border-main p-4 pl-12 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <motion.div 
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setEditingReport(report)}
              className="bg-white border border-border-main p-5 rounded-[2rem] shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-text-light">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {new Date(report.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }}
                  className="p-2 opacity-0 group-hover:opacity-100 text-text-light hover:text-danger transition-all bg-slate-50 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="text-sm font-black text-text-main mb-2 line-clamp-1">{report.title}</h3>
              <p className="text-xs text-text-light line-clamp-3 leading-relaxed">
                {report.content}
              </p>
              <div className="mt-4 flex items-center text-primary font-black uppercase text-[9px] tracking-widest gap-1">
                Ver detalhes <ChevronRight size={12} />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 px-6 bg-slate-50 rounded-[2.5rem] border border-dashed border-border-main">
            <ClipboardList className="mx-auto text-text-light/30 mb-4" size={48} />
            <p className="text-sm text-text-light font-medium">Nenhum relatório encontrado. Comece a documentar sua jornada!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAdding || editingReport) && (
          <ReportModal 
            report={editingReport}
            onClose={() => { setIsAdding(false); setEditingReport(null); }}
            onSave={editingReport ? handleUpdate : handleAdd}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportModal({ report, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    title: report?.title || '',
    content: report?.content || '',
    date: report?.date || new Date().toISOString().split('T')[0]
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end justify-center p-4"
    >
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-primary">
            <ClipboardList size={24} />
            <h3 className="text-lg font-black tracking-tight">
              {report ? 'Editar Nota' : 'Novo Relatório Diário'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-xl text-text-light">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2 scrollbar-hide">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Data</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full card p-3 outline-none text-sm font-medium bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Título / Assunto</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium" 
              placeholder="Ex: Achados em TC de Crânio" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Relatório Técnico / Notas</label>
            <textarea 
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium leading-relaxed" 
              placeholder="Descreva aqui suas observações diárias, casos interessantes ou referências para seu TCC..." 
            />
          </div>

          <div className="p-4 bg-primary/5 rounded-2xl flex gap-3 items-start border border-primary/10">
            <AlertCircle className="text-primary shrink-0" size={18} />
            <p className="text-[10px] text-primary font-bold leading-relaxed uppercase tracking-wider">
              DICA DE TCC: Seja detalhado na técnica radiológica utilizada e nos critérios de imagem. Isso enriquecerá seu trabalho acadêmico.
            </p>
          </div>
        </div>

        <div className="pt-6 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-bg-app border border-border-main rounded-xl font-bold text-[11px] uppercase tracking-widest text-text-light"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              if (formData.title && formData.content) {
                onSave(report ? { ...report, ...formData } : formData);
              }
            }}
            disabled={!formData.title || !formData.content}
            className="flex-1 py-4 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95 transition-all"
          >
            <Save size={16} /> Salvar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
