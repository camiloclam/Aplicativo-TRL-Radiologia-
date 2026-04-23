/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Menu, 
  Heart, 
  BookOpen, 
  Plus, 
  ChevronRight, 
  ArrowLeft, 
  Trash2, 
  Brain, 
  Accessibility, 
  Stethoscope, 
  Hand, 
  Footprints,
  PlusCircle,
  X,
  Star,
  Monitor,
  Image as ImageIcon,
  Clock,
  Settings,
  HelpCircle,
  User,
  Activity,
  Disc,
  Baby,
  Zap,
  Map,
  PersonStanding,
  FileText,
  Youtube,
  Calculator,
  Users,
  Share2,
  MessageSquare,
  ArrowRightLeft,
  AlertCircle,
  Filter,
  Send,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ai, MODELS } from './lib/gemini';
import { Exam, Category, Flashcard } from './types';
import { INITIAL_CATEGORIES, INITIAL_EXAMS } from './constants';
import RadiologicalCalculator from './components/RadiologicalCalculator';
import Community from './components/Community';

const ICON_MAP = {
  Brain,
  BookOpen,
  Accessibility: PersonStanding,
  Stethoscope,
  Hand,
  Footprints,
  Activity,
  Disc,
  Baby,
  PersonStanding
};

type View = 'home' | 'skeleton' | 'category-list' | 'exam-detail' | 'study' | 'add-exam' | 'favorites' | 'add-category' | 'tools' | 'community' | 'profile';

export default function App() {
  // Persistence
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('trl_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('trl_exams');
    return saved ? JSON.parse(saved) : INITIAL_EXAMS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('trl_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  
  const [studyMaterials, setStudyMaterials] = useState<{ id: string, title: string, url: string }[]>(() => {
    const saved = localStorage.getItem('trl_study_materials');
    return saved ? JSON.parse(saved) : [];
  });

  const [videoLessons, setVideoLessons] = useState<{ id: string, title: string, url: string }[]>(() => {
    const saved = localStorage.getItem('trl_video_lessons');
    return saved ? JSON.parse(saved) : [];
  });

  // Professional / Networking State
  const [userProfile, setUserProfile] = useState<{ name: string, area: string, experience: string, photo?: string } | null>(() => {
    const saved = localStorage.getItem('trl_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [communityPosts, setCommunityPosts] = useState<any[]>(() => {
    const saved = localStorage.getItem('trl_community_posts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('trl_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('trl_community_posts', JSON.stringify(communityPosts));
  }, [communityPosts]);

  useEffect(() => {
    localStorage.setItem('trl_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('trl_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('trl_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('trl_study_materials', JSON.stringify(studyMaterials));
  }, [studyMaterials]);

  useEffect(() => {
    localStorage.setItem('trl_video_lessons', JSON.stringify(videoLessons));
  }, [videoLessons]);

  // Navigation and Selection
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const studyFileInputRef = useRef<HTMLInputElement>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoLinkData, setVideoLinkData] = useState({ title: '', url: '' });

  // Derived State
  const filteredExams = useMemo(() => {
    let result = exams;
    if (selectedCategory && currentView === 'category-list') {
      result = result.filter(exam => exam.category === selectedCategory.id);
    }
    if (searchQuery) {
      result = result.filter(exam => 
        exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.incidences.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [exams, selectedCategory, searchQuery, currentView]);

  const selectedExam = exams.find(e => e.id === selectedExamId);

  // Actions
  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const deleteCategory = (id: string) => {
    if (confirm('Tem certeza que deseja apagar esta categoria? Todos os exames vinculados serão mantidos, mas a categoria sumirá do menu.')) {
      setCategories(prev => prev.filter(c => c.id !== id));
      if (selectedCategory?.id === id) {
        setCurrentView('home');
        setSelectedCategory(null);
      }
    }
  };

  const deleteExam = (id: string) => {
    if (confirm('Deseja apagar este exame?')) {
      setExams(prev => prev.filter(e => e.id !== id));
      if (selectedExamId === id) {
        setCurrentView('home');
        setSelectedExamId(null);
      }
    }
  };

  const navigateToCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setCurrentView('category-list');
    setSearchQuery('');
  };

  const navigateToExam = (exam: Exam) => {
    setSelectedExamId(exam.id);
    setCurrentView('exam-detail');
  };

  const goBack = () => {
    if (currentView === 'exam-detail') {
      setCurrentView('category-list');
    } else if (currentView === 'category-list' || currentView === 'skeleton' || currentView === 'study' || currentView === 'add-exam' || currentView === 'favorites') {
      setCurrentView('home');
    }
  };

  const handleGenerateAIImage = async () => {
    if (!selectedExam) return;
    
    setIsGeneratingImage(true);
    try {
      const prompt = `Medical illustration of patient positioning for radiological exam. Exam name: ${selectedExam.name}. Technical positioning: ${selectedExam.positioning}. Show a professional, clear medical scene of the patient on a radiology table or standing. No text, clean background.`;
      
      const response = await ai.models.generateContent({
        model: MODELS.IMAGE,
        contents: {
          parts: [{ text: prompt }],
        },
      });

      let genImageUrl = '';
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            genImageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (genImageUrl) {
        setExams(prev => prev.map(e => 
          e.id === selectedExam.id ? { ...e, imageUrl: genImageUrl } : e
        ));
      } else {
        alert("A IA não retornou uma imagem. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar imagem IA:", error);
      alert("Erro ao conectar com a IA para geração de imagens.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedExam) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      if (b64) {
        setExams(prev => prev.map(e => 
          e.id === selectedExam.id ? { ...e, imageUrl: b64 } : e
        ));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStudyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a PDF or Ebook type if we want, but let's be flexible
    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      if (b64) {
        setStudyMaterials(prev => [...prev, { 
          id: Math.random().toString(36).substr(2, 9), 
          title: file.name, 
          url: b64,
          type: 'local'
        }]);
      }
    };
    reader.readAsDataURL(file);
    // Reset input
    e.target.value = '';
  };

  const handleAddVideoLink = () => {
    if (videoLinkData.title && videoLinkData.url) {
      setVideoLessons(prev => [...prev, { 
        id: Math.random().toString(36).substr(2, 9), 
        title: videoLinkData.title, 
        url: videoLinkData.url 
      }]);
      setVideoLinkData({ title: '', url: '' });
      setShowVideoModal(false);
    } else {
      alert('Por favor, preencha o título e o link do vídeo.');
    }
  };

  const handleAddExam = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newExam: Exam = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      positioning: formData.get('positioning') as string,
      incidences: formData.get('incidences') as string,
      angulation: formData.get('angulation') as string,
      ffd: formData.get('ffd') as string,
      kv: formData.get('kv') as string,
      mas: formData.get('mas') as string,
      observations: formData.get('observations') as string,
      type: formData.get('type') as Exam['type'],
      userObservations: [],
    };
    setExams(prev => [...prev, newExam]);
    setCurrentView('category-list');
    setSelectedCategory(categories.find(c => c.id === newExam.category) || null);
  };

  const handleAddCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const icon = formData.get('icon') as string;

    if (name) {
      const newCat: Category = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        icon: icon || 'PersonStanding'
      };
      setCategories(prev => [...prev, newCat]);
      setCurrentView('home');
    }
  };

  // Components for simplified rendering
  // Animation Variants
  const pageVariants = {
    initial: { opacity: 0, y: 8, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.2, ease: "easeIn" } }
  };

  const Header = () => (
    <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border-main px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          {currentView !== 'home' ? (
            <motion.button 
              key="back-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={goBack} 
              className="p-2 hover:bg-bg-app rounded-lg transition-colors border border-border-main"
            >
              <ArrowLeft size={18} className="text-text-main" />
            </motion.button>
          ) : (
            <motion.div 
              key="logo-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="p-2 bg-primary/10 rounded-lg"
            >
              <Monitor size={18} className="text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="overflow-hidden h-7">
          <AnimatePresence mode="wait">
            <motion.h1 
              key={currentView + (selectedCategory?.id || '')}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-lg font-bold text-text-main tracking-tight"
            >
              {currentView === 'home' ? (
                <span className="flex items-center gap-2">
                  <span className="text-primary font-black">+</span> TRL Radiologia
                </span>
              ) : 
               currentView === 'category-list' ? selectedCategory?.name :
               currentView === 'exam-detail' ? 'Detalhes do Exame' :
               currentView === 'skeleton' ? 'Corpo Anatômico' :
               currentView === 'study' ? 'Modo Estudo' :
               currentView === 'add-category' ? 'Nova Região' :
               currentView === 'tools' ? 'Calculadora Téc.' :
               currentView === 'community' ? 'Comunidade' :
               currentView === 'profile' ? 'Perfil Profissional' :
               currentView === 'favorites' ? 'Meus Favoritos' : 'Novo Registro'}
            </motion.h1>
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {currentView === 'home' && (
          <button onClick={() => setCurrentView('favorites')} className="p-2 hover:bg-bg-app rounded-lg border border-border-main transition-colors">
            <Heart size={18} className={favorites.length > 0 ? "text-danger fill-danger" : "text-text-light"} />
          </button>
        )}
        <button className="p-2 hover:bg-bg-app rounded-lg border border-border-main transition-colors">
          <User size={18} className="text-text-light" />
        </button>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen max-w-md mx-auto bg-bg-app border-x border-border-main relative pb-24 font-sans text-text-main">
      <Header />
      
      <main className="p-4">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div 
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar exames ou anatomia..."
                  className="w-full bg-white border border-border-main rounded-xl py-3 pl-10 pr-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if(searchQuery) setCurrentView('category-list') }}
                />
              </div>

              {/* Skeleton Shortcut */}
              <button 
                onClick={() => setCurrentView('skeleton')}
                className="w-full group relative overflow-hidden h-32 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center"
              >
                <div className="absolute right-0 top-0 h-full opacity-10 group-hover:scale-110 transition-transform">
                  <PersonStanding size={120} className="text-white" />
                </div>
                <div className="p-6 relative z-10 text-left">
                  <h3 className="text-white font-bold text-lg">Corpo Anatômico</h3>
                  <p className="text-white/70 text-sm max-w-[200px]">Toque nas regiões do esqueleto para ver os exames</p>
                </div>
              </button>

              {/* Categories Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-bold text-text-light uppercase tracking-[0.1em]">Regiões</h2>
                  <button onClick={() => setCurrentView('add-category')} className="text-primary hover:text-accent p-1 transition-colors">
                    <PlusCircle size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => {
                    const Icon = ICON_MAP[cat.icon as keyof typeof ICON_MAP] || Accessibility;
                    return (
                      <div key={cat.id} className="relative group">
                         <button 
                          onClick={() => navigateToCategory(cat)}
                          className="w-full card p-5 flex flex-col items-center gap-3 active:scale-[0.98] active:bg-slate-50 transition-all text-center border-border-main"
                        >
                          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                            <Icon size={24} />
                          </div>
                          <span className="font-semibold text-text-main text-sm">{cat.name}</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                          className="absolute -top-1 -right-1 p-1 bg-white border border-border-main text-text-light hover:text-danger rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Study Card */}
              <div className="card p-5 bg-card border-l-4 border-l-primary shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/5 rounded-xl text-primary">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-main">Modo Estudo</h3>
                    <p className="text-sm text-text-light mt-1">Pratique via flashcards e domine as incidências radiológicas.</p>
                    <button 
                      onClick={() => setCurrentView('study')}
                      className="mt-4 text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Começar agora <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'category-list' && (
            <motion.div 
              key="category-list"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] text-text-light font-bold uppercase tracking-wider">{filteredExams.length} exames encontrados</p>
                <button 
                  onClick={() => setCurrentView('add-exam')}
                  className="btn-primary py-1 px-3 text-[11px] uppercase tracking-widest"
                >
                  <Plus size={14} /> Novo Exame
                </button>
              </div>

              {filteredExams.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl border border-border-main">
                  <div className="bg-bg-app w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-text-light border border-dashed border-border-main">
                    <Search size={32} />
                  </div>
                  <h3 className="text-text-main font-bold">Nenhum exame encontrado</h3>
                  <p className="text-text-light text-sm mt-1">Tente ajustar seus termos de busca.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredExams.map((exam) => (
                    <div key={exam.id} className="relative group">
                      <button 
                        onClick={() => navigateToExam(exam)}
                        className="w-full card p-4 flex items-center gap-4 text-left active:bg-slate-50 border-l-4 border-l-transparent hover:border-l-primary transition-all"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-border-main ${
                          exam.type === 'rotina' ? 'bg-primary/5 text-primary' : 
                          exam.type === 'especial' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                          <BookOpen size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-text-main text-sm truncate">{exam.name}</h4>
                          <p className="text-[11px] text-text-light uppercase font-bold tracking-tight truncate">{exam.incidences}</p>
                        </div>
                        <ChevronRight size={16} className="text-border-main" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteExam(exam.id); }}
                        className="absolute -top-1 -right-1 p-1 bg-white shadow-sm border border-border-main text-text-light hover:text-danger rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'exam-detail' && selectedExam && (
            <motion.div 
              key="exam-detail"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6 pb-20"
            >
              {/* Header Info */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-black tracking-[0.15em] px-2 py-0.5 rounded-md ${
                      selectedExam.type === 'rotina' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 
                      selectedExam.type === 'especial' ? 'bg-amber-500 text-white shadow-sm shadow-amber-200' : 'bg-purple-500 text-white shadow-sm shadow-purple-200'
                    }`}>
                      {selectedExam.type}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-bg-app border border-border-main text-text-light">
                      ID: {selectedExam.id}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-text-main leading-none mt-2">{selectedExam.name}</h2>
                  <p className="text-sm text-text-light font-medium tracking-tight mt-1">Região: {categories.find(c => c.id === selectedExam.category)?.name}</p>
                </div>
                <button 
                  onClick={() => toggleFavorite(selectedExam.id)}
                  className={`p-3 rounded-2xl shadow-sm border transition-all ${
                    favorites.includes(selectedExam.id) ? 'bg-danger/5 border-danger/10 text-danger' : 'bg-white border-border-main text-text-light'
                  }`}
                >
                  <Heart size={20} fill={favorites.includes(selectedExam.id) ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Image Space */}
              <div className="space-y-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                />
                <div className="aspect-video bg-bg-app rounded-2xl border-2 border-dashed border-border-main flex items-center justify-center text-text-light overflow-hidden relative group">
                  {selectedExam.imageUrl ? (
                    <img src={selectedExam.imageUrl} alt={selectedExam.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      {isGeneratingImage ? (
                        <div className="flex flex-col items-center space-y-4">
                          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Gerando Imagem com IA...</p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon size={40} className="opacity-20 text-primary" />
                          <p className="text-[11px] font-bold uppercase tracking-widest text-text-light">Sem imagem ilustrativa</p>
                        </>
                      )}
                    </div>
                  )}
                  {!isGeneratingImage && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-primary p-3 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
                      >
                        <Plus size={16} /> Carregar Foto
                      </button>
                      <button 
                        onClick={handleGenerateAIImage}
                        className="bg-primary text-white p-3 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
                      >
                        <Zap size={16} /> Gerar com IA
                      </button>
                    </div>
                  )}
                </div>
                {selectedExam.imageUrl && (
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setExams(prev => prev.map(e => e.id === selectedExam.id ? { ...e, imageUrl: undefined } : e))}
                      className="text-[10px] font-black uppercase tracking-widest text-danger hover:underline"
                    >
                      Remover Imagem
                    </button>
                  </div>
                )}
              </div>

              {/* Technical Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg-app border border-border-main rounded-xl p-3 space-y-1">
                  <p className="text-[10px] text-text-light font-bold uppercase tracking-widest">DFF (Distância)</p>
                  <p className="text-base font-black text-primary leading-none">{selectedExam.ffd}</p>
                </div>
                <div className="bg-bg-app border border-border-main rounded-xl p-3 space-y-1">
                  <p className="text-[10px] text-text-light font-bold uppercase tracking-widest">Angulação</p>
                  <p className="text-base font-black text-primary leading-none">{selectedExam.angulation}</p>
                </div>
                <div className="bg-bg-app border border-border-main rounded-xl p-3 space-y-1">
                  <p className="text-[10px] text-text-light font-bold uppercase tracking-widest">Incidência</p>
                  <p className="text-base font-black text-primary leading-none">{selectedExam.incidences}</p>
                </div>
                <div className="bg-bg-app border border-border-main rounded-xl p-3 flex gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] text-text-light font-bold uppercase tracking-widest">KV</p>
                    <p className="text-base font-black text-primary leading-none">{selectedExam.kv}</p>
                  </div>
                  <div className="flex-1 space-y-1 border-l border-border-main pl-3">
                    <p className="text-[10px] text-text-light font-bold uppercase tracking-widest">mAs</p>
                    <p className="text-base font-black text-primary leading-none">{selectedExam.mas}</p>
                  </div>
                </div>
              </div>

              {/* Detail Sections */}
              <div className="space-y-8">
                <section className="space-y-3">
                  <h5 className="text-[11px] font-black text-primary uppercase tracking-[0.15em] border-b border-border-main pb-2 flex justify-between items-center">
                    Posicionamento do Paciente
                  </h5>
                  <p className="text-sm text-text-main leading-relaxed font-medium">
                    {selectedExam.positioning}
                  </p>
                </section>

                <section className="space-y-3">
                  <h5 className="text-[11px] font-black text-primary uppercase tracking-[0.15em] border-b border-border-main pb-2">
                    Estruturas Demonstradas
                  </h5>
                  <p className="text-sm text-text-main leading-relaxed font-medium">
                    {selectedExam.structures || "Nenhuma estrutura especificada."}
                  </p>
                </section>

                <section className="space-y-3">
                  <h5 className="text-[11px] font-black text-primary uppercase tracking-[0.15em] border-b border-border-main pb-2">
                    Observações Técnicas
                  </h5>
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 italic text-text-main text-sm font-medium">
                    {selectedExam.observations}
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border-main pb-2">
                    <h5 className="text-[11px] font-black text-primary uppercase tracking-[0.15em]">
                      Minhas Notas
                    </h5>
                    <button onClick={() => alert('Add note')} className="text-accent text-[11px] font-black uppercase tracking-widest">+ Adicionar</button>
                  </div>
                  <div className="space-y-2">
                    {selectedExam.userObservations?.length ? (
                      selectedExam.userObservations.map((note, idx) => (
                        <div key={idx} className="bg-white border border-border-main rounded-xl p-3 text-sm text-text-main shadow-sm">
                          {note}
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] italic text-text-light text-center py-4">Nenhuma observação pessoal adicionada ainda.</p>
                    )}
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {currentView === 'skeleton' && (
            <motion.div 
              key="skeleton"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              <div className="bg-card rounded-3xl p-8 shadow-lg border border-border-main relative min-h-[600px] flex flex-col items-center overflow-hidden">
                 <p className="text-center text-text-light text-[10px] font-black uppercase tracking-[0.2em] mb-8 relative z-10">Corpo Anatômico</p>
                 
                 {/* Skeleton Background Integration */}
                 <div className="relative w-full max-w-[300px] aspect-[1/2] rounded-3xl flex flex-col items-center justify-between p-8 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1526662095394-1994625b64f3?q=80&w=800" 
                      alt="Skeleton Background" 
                      className="absolute inset-0 w-full h-full object-contain opacity-20 grayscale pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Head */}
                    <button 
                      onClick={() => navigateToCategory(categories.find(c => c.id === 'cranio')!)}
                      className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm border border-border-main shadow-lg flex items-center justify-center text-text-light hover:text-primary hover:border-primary hover:shadow-primary/20 hover:scale-110 transition-all relative z-10"
                    >
                      <Brain size={24} />
                    </button>

                    {/* Spine/Torax */}
                    <div className="flex gap-4">
                      <button 
                         onClick={() => navigateToCategory(categories.find(c => c.id === 'torax')!)}
                         className="w-16 h-24 rounded-2xl bg-white border border-border-main shadow-sm flex items-center justify-center text-text-light hover:text-primary hover:border-primary transition-all"
                      >
                         <Stethoscope size={24} />
                      </button>
                       <button 
                         onClick={() => navigateToCategory(categories.find(c => c.id === 'coluna')!)}
                         className="w-12 h-32 rounded-full bg-white border border-border-main shadow-sm flex items-center justify-center text-text-light hover:text-primary hover:border-primary transition-all"
                      >
                         <PersonStanding size={24} />
                      </button>
                    </div>

                    {/* Arms */}
                    <div className="absolute top-28 left-0 flex flex-col -ml-12 items-center rotate-[20deg]">
                       <button 
                         onClick={() => navigateToCategory(categories.find(c => c.id === 'membros-superiores')!)}
                         className="w-12 h-32 rounded-full bg-white border border-border-main shadow-sm flex items-center justify-center text-text-light hover:text-primary transition-all"
                      >
                         <Hand size={24} />
                      </button>
                    </div>
                    <div className="absolute top-28 right-0 flex flex-col -mr-12 items-center rotate-[-20deg]">
                       <button 
                         onClick={() => navigateToCategory(categories.find(c => c.id === 'membros-superiores')!)}
                         className="w-12 h-32 rounded-full bg-white border border-border-main shadow-sm flex items-center justify-center text-text-light hover:text-primary transition-all"
                      >
                         <Hand size={24} />
                      </button>
                    </div>

                    {/* Legs */}
                    <div className="flex gap-8 mt-4">
                       <button 
                         onClick={() => navigateToCategory(categories.find(c => c.id === 'membros-inferiores')!)}
                         className="w-12 h-32 rounded-full bg-white border border-border-main shadow-sm flex items-center justify-center text-text-light hover:text-primary transition-all"
                      >
                         <Footprints size={24} />
                      </button>
                       <button 
                         onClick={() => navigateToCategory(categories.find(c => c.id === 'membros-inferiores')!)}
                         className="w-12 h-32 rounded-full bg-white border border-border-main shadow-sm flex items-center justify-center text-text-light hover:text-primary transition-all"
                      >
                         <Footprints size={24} />
                      </button>
                    </div>
                 </div>

                 <div className="mt-12 text-center">
                    <p className="text-text-light text-xs font-bold italic">Toque em uma região para filtrar os exames.</p>
                 </div>
              </div>
            </motion.div>
          )}

          {currentView === 'study' && (
            <motion.div 
              key="study"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
            >
              {/* Flashcard Section */}
              <section className="space-y-4">
                <h2 className="text-[11px] font-bold text-text-light uppercase tracking-[0.1em]">Flashcards</h2>
                <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-6">
                  <div className="w-full bg-primary aspect-square rounded-[2rem] p-10 flex flex-col items-center justify-center text-center relative cursor-pointer active:scale-95 transition-all shadow-xl shadow-primary/20 text-white">
                    <BookOpen size={48} className="mb-8 opacity-20" />
                    <h3 className="text-xl font-black mb-6 leading-tight">Qual a angulação do raio central no exame de Waters?</h3>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] absolute bottom-8">Toque para revelar</p>
                  </div>

                  <div className="flex gap-4 w-full">
                    <button className="flex-1 bg-white border border-border-main py-4 rounded-xl font-black text-[11px] uppercase tracking-widest text-text-light active:bg-bg-app">Não lembro</button>
                    <button className="flex-1 bg-primary text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-widest active:bg-accent transition-colors shadow-lg shadow-primary/10">Eu sabia!</button>
                  </div>

                  <div className="text-center">
                    <p className="text-text-light text-[10px] font-black uppercase tracking-[0.2em]">Sessão: 1 / 20</p>
                    <div className="w-48 h-1 bg-border-main rounded-full mx-auto mt-4 overflow-hidden">
                      <div className="w-1/20 h-full bg-primary"></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Supplementary Materials Section */}
              <section className="space-y-4 pt-6 border-t border-border-main">
                <input 
                  type="file" 
                  ref={studyFileInputRef} 
                  className="hidden" 
                  accept=".pdf, .epub, .doc, .docx"
                  onChange={handleStudyFileUpload}
                />

                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-bold text-text-light uppercase tracking-[0.1em]">Material Complementar</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => studyFileInputRef.current?.click()}
                      className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                      title="Abrir meus arquivos"
                    >
                      <FileText size={18} />
                    </button>
                    <button 
                      onClick={() => setShowVideoModal(true)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Adicionar Vídeo Aula"
                    >
                      <Youtube size={18} />
                    </button>
                  </div>
                </div>

                {/* Video Lesson Modal */}
                <AnimatePresence>
                  {showVideoModal && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                      <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl space-y-6"
                      >
                        <div className="flex items-center gap-3 text-red-600">
                          <Youtube size={24} />
                          <h3 className="text-lg font-black tracking-tight">Nova Vídeo Aula</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Título da Aula</label>
                            <input 
                              type="text"
                              value={videoLinkData.title}
                              onChange={(e) => setVideoLinkData(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium" 
                              placeholder="Ex: Posicionamento de Crânio" 
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Link do Vídeo</label>
                            <input 
                              type="text"
                              value={videoLinkData.url}
                              onChange={(e) => setVideoLinkData(prev => ({ ...prev, url: e.target.value }))}
                              className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium" 
                              placeholder="https://youtube.com/..." 
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button 
                            onClick={() => setShowVideoModal(false)}
                            className="flex-1 py-4 bg-bg-app border border-border-main rounded-xl font-bold text-[11px] uppercase tracking-widest text-text-light"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={handleAddVideoLink}
                            className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-red-200"
                          >
                            Salvar Link
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-3">
                  {studyMaterials.length === 0 && videoLessons.length === 0 && (
                    <p className="text-[11px] italic text-text-light text-center py-8 bg-white rounded-2xl border border-dashed border-border-main">
                      Toque nos ícones acima para arquivar PDFs ou salvar Vídeos.
                    </p>
                  )}
                  
                  {studyMaterials.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-border-main rounded-xl group animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">{item.title}</h4>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          download={item.title}
                          className="text-[10px] text-accent font-bold uppercase tracking-widest hover:underline"
                        >
                          Abrir Material
                        </a>
                      </div>
                      <button 
                        onClick={() => setStudyMaterials(prev => prev.filter(m => m.id !== item.id))}
                        className="p-2 text-text-light hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {videoLessons.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-border-main rounded-xl group animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <Youtube size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">{item.title}</h4>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-red-600 font-bold uppercase tracking-widest hover:underline">Assistir Aula</a>
                      </div>
                      <button 
                        onClick={() => setVideoLessons(prev => prev.filter(v => v.id !== item.id))}
                        className="p-2 text-text-light hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {currentView === 'favorites' && (
            <motion.div 
              key="favorites"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4"
            >
              {favorites.length === 0 ? (
                <div className="text-center py-20">
                   <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-300">
                    <Heart size={32} />
                  </div>
                  <h3 className="text-slate-900 font-bold">Nenhum favorito ainda</h3>
                  <p className="text-slate-500 text-sm mt-1">Clique no coração em um exame para salvá-lo aqui.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exams.filter(e => favorites.includes(e.id)).map((exam) => (
                    <button 
                      key={exam.id}
                      onClick={() => navigateToExam(exam)}
                      className="w-full card p-4 flex items-center gap-4 text-left active:bg-slate-50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <Heart size={20} fill="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{exam.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{exam.incidences}</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'tools' && (
            <motion.div 
              key="tools"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <RadiologicalCalculator />
            </motion.div>
          )}

          {currentView === 'community' && (
            <motion.div 
              key="community"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Community 
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                posts={communityPosts}
                setPosts={setCommunityPosts}
              />
            </motion.div>
          )}

          {currentView === 'add-exam' && (
            <motion.div 
              key="add-exam"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6 pb-24"
            >
              <form onSubmit={handleAddExam} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Nome do Exame</label>
                  <input name="name" required className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium" placeholder="Ex: AP de Crânio" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Região</label>
                    <select name="category" required className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none bg-white text-sm font-medium">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Tipo</label>
                    <select name="type" required className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none bg-white text-sm font-medium">
                      <option value="rotina">Rotina</option>
                      <option value="especial">Especial</option>
                      <option value="odontologico">Odontológico</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Posicionamento</label>
                  <textarea name="positioning" required rows={3} className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium" placeholder="Descreva o posicionamento do paciente..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">DFF (cm)</label>
                    <input name="ffd" required className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-black text-primary" placeholder="100 cm" />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">KV</label>
                    <input name="kv" required className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-black text-primary" placeholder="70" />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">mAs</label>
                    <input name="mas" required className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-black text-primary" placeholder="20" />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Angulação</label>
                    <input name="angulation" required className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-black text-primary" placeholder="0°" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Incidências</label>
                  <input name="incidences" required className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium" placeholder="AP, Perfil..." />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Observações Técnicas</label>
                  <textarea name="observations" rows={2} className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium" placeholder="Notas importantes sobre o exame..." />
                </div>

                <button type="submit" className="w-full bg-primary text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all mt-6 text-xs">
                  Salvar Protocolo
                </button>
              </form>
            </motion.div>
          )}
          {currentView === 'add-category' && (
            <motion.div 
              key="add-category"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6 pb-24"
            >
              <form onSubmit={handleAddCategory} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Nome da Região</label>
                  <input name="name" required className="w-full card p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium" placeholder="Ex: Ombro, Joelho, etc." />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Escolha um Ícone</label>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(ICON_MAP).map(([key, IconComponent]) => (
                      <label key={key} className="cursor-pointer group">
                        <input type="radio" name="icon" value={key} className="hidden peer" defaultChecked={key === 'PersonStanding'} />
                        <div className="w-full aspect-square rounded-xl bg-white border border-border-main flex items-center justify-center text-text-light peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary transition-all group-hover:bg-slate-50">
                          <IconComponent size={24} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setCurrentView('home')}
                    className="flex-1 py-4 bg-white border border-border-main rounded-xl font-bold text-[11px] uppercase tracking-widest text-text-light active:bg-bg-app"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-4 bg-primary text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                  >
                    Criar Região
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[420px] bg-card/95 backdrop-blur-lg border border-border-main shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl p-1 flex items-center justify-between z-50">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentView('home')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all ${
            currentView === 'home' ? 'text-primary bg-primary/5' : 'text-text-light hover:text-text-main'
          }`}
        >
          <Menu size={16} />
          <span className="text-[8px] font-black uppercase tracking-tight">Menu</span>
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentView('skeleton')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all ${
            currentView === 'skeleton' ? 'text-primary bg-primary/5' : 'text-text-light hover:text-text-main'
          }`}
        >
          <PersonStanding size={16} />
          <span className="text-[8px] font-black uppercase tracking-tight">Corpo</span>
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentView('tools')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all ${
            currentView === 'tools' ? 'text-primary bg-primary/5' : 'text-text-light hover:text-text-main'
          }`}
        >
          <Calculator size={16} />
          <span className="text-[8px] font-black uppercase tracking-tight">Módulos</span>
        </motion.button>

        <div className="relative -top-5 px-1">
           <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentView('add-exam')}
            className="w-12 h-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center transition-all border-4 border-card"
          >
            <Plus size={24} strokeWidth={3} />
          </motion.button>
        </div>

        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentView('study')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all ${
            currentView === 'study' ? 'text-primary bg-primary/5' : 'text-text-light hover:text-text-main'
          }`}
        >
          <BookOpen size={16} />
          <span className="text-[8px] font-black uppercase tracking-tight">Estudo</span>
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentView('community')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all ${
            currentView === 'community' ? 'text-primary bg-primary/5' : 'text-text-light hover:text-text-main'
          }`}
        >
          <Users size={16} />
          <span className="text-[8px] font-black uppercase tracking-tight">Social</span>
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentView('favorites')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all ${
            currentView === 'favorites' ? 'text-primary bg-primary/5' : 'text-text-light hover:text-text-main'
          }`}
        >
          <Heart size={16} />
          <span className="text-[8px] font-black uppercase tracking-tight">Favoritos</span>
        </motion.button>
      </nav>
    </div>
  );
}
