import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Plus, 
  Image as ImageIcon,
  ShieldAlert,
  Search,
  Filter,
  Send,
  User,
  Award,
  ChevronRight,
  Clock
} from 'lucide-react';

interface Post {
  id: string;
  author: string;
  role: string;
  avatar?: string;
  category: string;
  description: string;
  image?: string;
  likes: number;
  comments: number;
  time: string;
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: 'Dra. Helena Silva',
    role: 'Radiologista',
    category: 'Tórax',
    description: 'Achado incidental de nódulo solitário em lobo superior direito. Paciente assintomático. Sugiro acompanhamento Tomográfico.',
    likes: 24,
    comments: 5,
    time: '2h atrás'
  },
  {
    id: '2',
    author: 'Marcos Oliveira',
    role: 'Técnico em Radiologia',
    category: 'Ortopedia',
    description: 'Fratura de Colles em paciente idosa. Note o desvio dorsal do fragmento distal do rádio.',
    likes: 18,
    comments: 3,
    time: '5h atrás'
  }
];

export default function Community({ 
  userProfile, 
  setUserProfile, 
  posts, 
  setPosts 
}: { 
  userProfile: any, 
  setUserProfile: any, 
  posts: Post[], 
  setPosts: any 
}) {
  const [showNewPost, setShowNewPost] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');

  const categories = ['Todos', 'Tórax', 'Ortopedia', 'Emergência', 'Neuro', 'Pediátrico'];
  
  const displayPosts = [...posts, ...MOCK_POSTS].filter(p => activeCategory === 'Todos' || p.category === activeCategory);

  if (!userProfile) {
    return <ProfileSetup onComplete={(profile: any) => setUserProfile(profile)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden">
            {userProfile.photo ? <img src={userProfile.photo} className="w-full h-full object-cover" /> : <User size={20} />}
          </div>
          <div>
            <h3 className="text-sm font-black text-text-main line-clamp-1">{userProfile.name}</h3>
            <p className="text-[10px] font-bold text-text-light uppercase tracking-wider">{userProfile.area} • {userProfile.experience}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowNewPost(true)}
          className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeCategory === cat ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-text-light border-border-main'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {displayPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <NewPostModal 
            onClose={() => setShowNewPost(false)} 
            onSave={(post: Post) => {
              setPosts([post, ...posts]);
              setShowNewPost(false);
            }}
            userProfile={userProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface PostCardProps {
  post: Post;
  key?: React.Key;
}

function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] border border-border-main p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <User size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black text-text-main">{post.author}</h4>
            <p className="text-[9px] font-bold text-text-light uppercase tracking-wider">{post.role}</p>
          </div>
        </div>
        <div className="text-[9px] font-bold text-text-light flex items-center gap-1">
          <Clock size={10} /> {post.time}
        </div>
      </div>

      <div className="space-y-3">
        <div className="inline-block px-2 py-1 rounded bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest">
          #{post.category}
        </div>
        <p className="text-sm text-text-main font-medium leading-relaxed">
          {post.description}
        </p>
        
        {post.image && (
          <div className="rounded-2xl overflow-hidden border border-border-main aspect-video bg-slate-50 flex items-center justify-center text-slate-300">
            <img src={post.image} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 pt-2 border-t border-slate-50">
        <button 
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-red-500' : 'text-text-light'}`}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
          <span className="text-[10px] font-black">{liked ? post.likes + 1 : post.likes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-text-light">
          <MessageSquare size={18} />
          <span className="text-[10px] font-black">{post.comments}</span>
        </button>
        <button className="flex items-center gap-1.5 text-text-light ml-auto">
          <Share2 size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function ProfileSetup({ onComplete }: { onComplete: any }) {
  const [formData, setFormData] = useState({
    name: '',
    area: 'Técnico',
    experience: 'Iniciante'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[2.5rem] border border-border-main p-8 shadow-xl space-y-8 text-center"
    >
      <div className="space-y-3">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto shadow-inner">
          <Award size={40} />
        </div>
        <h2 className="text-xl font-black tracking-tight">Perfil Profissional</h2>
        <p className="text-sm text-text-light">Crie sua identidade na maior comunidade de radiologia móvel.</p>
      </div>

      <div className="space-y-4 text-left">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Nome Completo</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium" 
            placeholder="Como quer ser chamado" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Área de Atuação</label>
          <select 
            value={formData.area}
            onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
            className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium bg-white"
          >
            <option>Técnico</option>
            <option>Tecnólogo</option>
            <option>Radiologista</option>
            <option>Estudante</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Tempo de Experiência</label>
          <select 
            value={formData.experience}
            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
            className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium bg-white"
          >
            <option>Iniciante</option>
            <option>1-3 anos</option>
            <option>3-5 anos</option>
            <option>5+ anos</option>
          </select>
        </div>
      </div>

      <button 
        onClick={() => formData.name && onComplete(formData)}
        className="w-full bg-primary text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all text-xs"
      >
        Entrar na Comunidade
      </button>
    </motion.div>
  );
}

function NewPostModal({ onClose, onSave, userProfile }: any) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tórax');
  const [image, setImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

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
        className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6"
      >
        <div className="flex items-center gap-3 text-primary">
          <Share2 size={24} />
          <h3 className="text-lg font-black tracking-tight">Compartilhar Caso</h3>
        </div>

        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3">
          <ShieldAlert className="text-red-500 shrink-0" size={20} />
          <p className="text-[10px] text-red-700 font-bold leading-relaxed uppercase tracking-wider">
            ANONIMIZAÇÃO OBRIGATÓRIA: Remova todos os dados pessoais do paciente antes de postar imagens.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Categoria</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full card p-3 outline-none text-sm font-medium bg-white"
            >
              <option>Tórax</option>
              <option>Ortopedia</option>
              <option>Emergência</option>
              <option>Neuro</option>
              <option>Pediátrico</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Relato do Caso</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-medium" 
              placeholder="Descreva os achados e técnica utilizada..." 
            />
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Imagem Técnica</label>
             <div className="relative aspect-video rounded-2xl border-2 border-dashed border-border-main flex items-center justify-center hover:border-primary transition-colors overflow-hidden bg-slate-50">
               {image ? (
                 <img src={image} className="w-full h-full object-cover" />
               ) : (
                 <div className="text-center space-y-2">
                    <ImageIcon className="mx-auto text-text-light" size={24} />
                    <span className="text-[10px] font-bold text-text-light uppercase">Clique para carregar</span>
                 </div>
               )}
               <input 
                 type="file" 
                 accept="image/*" 
                 onChange={handleImageChange}
                 className="absolute inset-0 opacity-0 cursor-pointer"
                />
             </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-bg-app border border-border-main rounded-xl font-bold text-[11px] uppercase tracking-widest text-text-light"
          >
            Cancelar
          </button>
          <button 
            onClick={() => onSave({
              id: Math.random().toString(),
              author: userProfile.name,
              role: userProfile.area,
              category,
              description,
              image,
              likes: 0,
              comments: 0,
              time: 'Agora'
            })}
            disabled={!description}
            className="flex-1 py-4 bg-primary text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            Publicar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
