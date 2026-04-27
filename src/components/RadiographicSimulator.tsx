import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  XOctagon, 
  Info,
  Maximize,
  ArrowRight,
  Target
} from 'lucide-react';

interface ExamParams {
  id: string;
  name: string;
  idealAngle: number;
  idealRotation: number;
  idealDFF: number;
  idealBeamCenter: { x: number; y: number };
  description: string;
  steps: string[];
}

const EXAMS: ExamParams[] = [
  {
    id: 'torax-pa',
    name: 'Tórax (PA)',
    idealAngle: 0,
    idealRotation: 0,
    idealDFF: 180,
    idealBeamCenter: { x: 50, y: 40 },
    description: 'Paciente em pé, tórax encostado no bucky, mãos na cintura e ombros para frente.',
    steps: [
      'Posicione o paciente em PA (tórax no bucky)',
      'Ajuste o ângulo do tubo para 0°',
      'Defina a DFF para 180cm',
      'Centralize o feixe em T7 (nível dos ângulos inferiores das escápulas)'
    ]
  },
  {
    id: 'torax-perfil',
    name: 'Tórax (Perfil Esquerdo)',
    idealAngle: 0,
    idealRotation: 90,
    idealDFF: 180,
    idealBeamCenter: { x: 50, y: 40 },
    description: 'Paciente em perfil esquerdo encostado no bucky, braços elevados acima da cabeça.',
    steps: [
      'Posicione o paciente em perfil esquerdo',
      'Ajuste o ângulo do tubo para 0°',
      'Defina a DFF para 180cm',
      'Centralize o feixe na linha axilar média'
    ]
  },
  {
    id: 'mao-ap',
    name: 'Mão (AP/Dorsopalmar)',
    idealAngle: 0,
    idealRotation: 0,
    idealDFF: 100,
    idealBeamCenter: { x: 50, y: 50 },
    description: 'Mão apoiada no chassi com a palma para baixo, dedos levemente afastados.',
    steps: [
      'Posicione a mão sobre o chassi (palma para baixo)',
      'Ajuste o ângulo do tubo para 0°',
      'Defina a DFF para 100cm',
      'Centralize o feixe na 3ª articulação metacarpofalângica'
    ]
  },
  {
    id: 'cervical-ap',
    name: 'Coluna Cervical (AP)',
    idealAngle: 15,
    idealRotation: 0,
    idealDFF: 100,
    idealBeamCenter: { x: 50, y: 45 },
    description: 'Paciente em pé ou decúbito dorsal, queixo levemente elevado.',
    steps: [
      'Posicione o paciente em AP',
      'Ajuste o ângulo do tubo para 15-20° cefálico',
      'Defina a DFF para 100cm',
      'Centralize o feixe na proeminência laríngea (C4)'
    ]
  }
];

export default function RadiographicSimulator() {
  const [selectedExam, setSelectedExam] = useState<ExamParams | null>(null);
  const [mode, setMode] = useState<'study' | 'challenge'>('study');
  const [currentStep, setCurrentStep] = useState(0);
  
  // Controls
  const [angle, setAngle] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [dff, setDff] = useState(100);
  const [beamX, setBeamX] = useState(50);
  const [beamY, setBeamY] = useState(50);
  
  const [showResults, setShowResults] = useState(false);
  const [accuracy, setAccuracy] = useState(0);

  const resetSimulator = () => {
    setAngle(0);
    setRotation(0);
    setDff(100);
    setBeamX(50);
    setBeamY(50);
    setCurrentStep(0);
    setShowResults(false);
  };

  const calculateAccuracy = () => {
    if (!selectedExam) return 0;
    
    const angleDiff = Math.abs(angle - selectedExam.idealAngle);
    const rotationDiff = Math.abs(rotation - selectedExam.idealRotation);
    const dffDiff = Math.abs(dff - selectedExam.idealDFF);
    const beamDist = Math.sqrt(Math.pow(beamX - selectedExam.idealBeamCenter.x, 2) + Math.pow(beamY - selectedExam.idealBeamCenter.y, 2));
    
    // Penalties
    let score = 100;
    score -= Math.min(30, angleDiff * 2);
    score -= Math.min(30, rotationDiff * 1.5);
    score -= Math.min(20, dffDiff * 0.5);
    score -= Math.min(20, beamDist * 2);
    
    return Math.max(0, Math.round(score));
  };

  const handleFinish = () => {
    setAccuracy(calculateAccuracy());
    setShowResults(true);
  };

  const getStepStatus = (stepIndex: number) => {
    if (!selectedExam) return 'inactive';
    if (currentStep > stepIndex) return 'completed';
    if (currentStep === stepIndex) return 'active';
    return 'inactive';
  };

  const validateParam = (param: string) => {
    if (!selectedExam || mode === 'challenge') return null;
    
    switch(param) {
      case 'angle':
        return Math.abs(angle - selectedExam.idealAngle) <= 5;
      case 'rotation':
        return Math.abs(rotation - selectedExam.idealRotation) <= 10;
      case 'dff':
        return Math.abs(dff - selectedExam.idealDFF) <= 10;
      case 'beam':
        const dist = Math.sqrt(Math.pow(beamX - selectedExam.idealBeamCenter.x, 2) + Math.pow(beamY - selectedExam.idealBeamCenter.y, 2));
        return dist <= 8;
      default:
        return null;
    }
  };

  if (!selectedExam) {
    return (
      <div className="space-y-6">
        <div className="bg-primary/10 border border-primary/20 p-6 rounded-[2.5rem] flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <Target size={32} />
          </div>
          <h2 className="text-xl font-black text-primary uppercase tracking-tight">Simulador de Posicionamento</h2>
          <p className="text-sm text-text-light font-medium leading-relaxed">
            Escolha um exame abaixo para começar a prática virtual. Treine seu olhar clínico e precisão técnica.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {EXAMS.map(exam => (
            <button 
              key={exam.id}
              onClick={() => { setSelectedExam(exam); resetSimulator(); }}
              className="w-full bg-white border border-border-main p-5 rounded-[2rem] flex items-center justify-between hover:bg-bg-app active:scale-[0.98] transition-all group"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-main">{exam.name}</h3>
                  <p className="text-[10px] font-bold text-text-light uppercase tracking-widest">{exam.description.split(',')[0]}...</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-text-light" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Simulation HUD */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setSelectedExam(null)}
          className="text-[10px] font-black uppercase tracking-widest text-text-light flex items-center gap-1 hover:text-primary transition-colors"
        >
          <Target size={14} /> Mudar Exame
        </button>
        <div className="flex bg-white rounded-full p-1 border border-border-main shadow-sm">
          <button 
            onClick={() => { setMode('study'); resetSimulator(); }}
            className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'study' ? 'bg-primary text-white' : 'text-text-light'}`}
          >
            Estudo
          </button>
          <button 
            onClick={() => { setMode('challenge'); resetSimulator(); }}
            className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'challenge' ? 'bg-primary text-white' : 'text-text-light'}`}
          >
            Desafio
          </button>
        </div>
      </div>

      {/* Visual Simulation Area */}
      <div className="relative aspect-square w-full bg-slate-100 rounded-[3rem] border-4 border-white shadow-xl overflow-hidden group">
        {/* Patient Representation (Simplified SVG) */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
          style={{ transform: `rotateY(${rotation}deg)` }}
        >
           {/* Placeholder for anatomy based on exam */}
           <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 opacity-40">
             <path d="M50 10 L60 20 L60 80 L40 80 L40 20 Z" fill="#64748b" />
             <circle cx="50" cy="15" r="8" fill="#64748b" />
             {selectedExam.id.includes('torax') && (
               <g opacity="0.6">
                 <path d="M35 30 Q50 25 65 30 V60 Q50 65 35 60 Z" fill="white" />
                 <path d="M50 25 V65" stroke="white" strokeWidth="1" />
               </g>
             )}
             {selectedExam.id.includes('mao') && (
                <path d="M40 80 L45 50 L50 55 L55 50 L60 80" fill="white" stroke="#64748b" />
             )}
           </svg>
        </div>

        {/* Central Beam Simulation */}
        <div 
          className={`absolute pointer-events-none transition-all duration-300 ${validateParam('beam') === false ? 'text-red-500' : validateParam('beam') === true ? 'text-green-500' : 'text-primary'}`}
          style={{ left: `${beamX}%`, top: `${beamY}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
             <Target size={32} className="opacity-80" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-1 bg-current opacity-20 rotate-0"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-48 bg-current opacity-20 rotate-0"></div>
             <div className="absolute -top-12 -left-12 w-24 h-24 border-2 border-current rounded-full opacity-10 animate-pulse"></div>
          </div>
        </div>

        {/* Info Overlays */}
        <div className="absolute bottom-6 left-6 space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${validateParam('angle') ? 'bg-green-500' : 'bg-red-500 opacity-50'}`}></div>
            <span className="text-[10px] font-black text-text-main uppercase tracking-widest">Ângulo: {angle}°</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${validateParam('rotation') ? 'bg-green-500' : 'bg-red-500 opacity-50'}`}></div>
            <span className="text-[10px] font-black text-text-main uppercase tracking-widest">Rotação Pac.: {rotation}°</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${validateParam('dff') ? 'bg-green-500' : 'bg-red-500 opacity-50'}`}></div>
            <span className="text-[10px] font-black text-text-main uppercase tracking-widest">DFF: {dff}cm</span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white border border-border-main p-6 rounded-[2.5rem] shadow-sm space-y-6">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div 
              key="controls"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Step Navigation (Guided Mode Only) */}
              {mode === 'study' && (
                <div className="flex gap-2 pb-4 border-b border-slate-50 overflow-x-auto scrollbar-hide">
                  {selectedExam.steps.map((step, idx) => (
                    <div 
                      key={idx}
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all ${
                        getStepStatus(idx) === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                        getStepStatus(idx) === 'active' ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20' :
                        'bg-white border-slate-200 text-slate-300'
                      }`}
                    >
                      {getStepStatus(idx) === 'completed' ? <CheckCircle2 size={14} /> : idx + 1}
                    </div>
                  ))}
                </div>
              )}

              {/* Sliders */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-text-light uppercase tracking-widest">Ângulo do Tubo (°)</label>
                    <span className="text-sm font-black text-primary">{angle}°</span>
                  </div>
                  <input 
                    type="range" min="-45" max="45" step="5"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-text-light uppercase tracking-widest">Rotação Paciente (°)</label>
                    <span className="text-sm font-black text-primary">{rotation}°</span>
                  </div>
                  <input 
                    type="range" min="0" max="90" step="15"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-text-light uppercase tracking-widest">Distância DFF (cm)</label>
                    <span className="text-sm font-black text-primary">{dff}cm</span>
                  </div>
                  <input 
                    type="range" min="80" max="200" step="10"
                    value={dff}
                    onChange={(e) => setDff(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              {/* Beam Cross Controls */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-text-light uppercase tracking-widest block">Centralização do Feixe</label>
                <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
                  <div></div>
                  <button 
                    onClick={() => setBeamY(prev => Math.max(0, prev - 5))}
                    className="w-10 h-10 bg-slate-50 border border-border-main rounded-xl flex items-center justify-center text-text-main shadow-sm active:bg-primary/10 active:text-primary transition-all"
                  >
                    <ChevronRight className="-rotate-90" size={20} />
                  </button>
                  <div></div>
                  <button 
                    onClick={() => setBeamX(prev => Math.max(0, prev - 5))}
                    className="w-10 h-10 bg-slate-50 border border-border-main rounded-xl flex items-center justify-center text-text-main shadow-sm active:bg-primary/10 active:text-primary transition-all"
                  >
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div className="w-10 h-10 flex items-center justify-center text-primary/20">
                    <Target size={20} />
                  </div>
                  <button 
                    onClick={() => setBeamX(prev => Math.min(100, prev + 5))}
                    className="w-10 h-10 bg-slate-50 border border-border-main rounded-xl flex items-center justify-center text-text-main shadow-sm active:bg-primary/10 active:text-primary transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div></div>
                  <button 
                    onClick={() => setBeamY(prev => Math.min(100, prev + 5))}
                    className="w-10 h-10 bg-slate-50 border border-border-main rounded-xl flex items-center justify-center text-text-main shadow-sm active:bg-primary/10 active:text-primary transition-all"
                  >
                    <ChevronRight className="rotate-90" size={20} />
                  </button>
                  <div></div>
                </div>
              </div>

              {/* Guided Info */}
              {mode === 'study' && (
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex gap-3">
                    <div className="p-2 h-fit bg-primary/10 rounded-lg text-primary">
                      <Info size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Passo atual</p>
                      <p className="text-sm text-text-main font-semibold leading-snug">{selectedExam.steps[currentStep]}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={resetSimulator}
                  className="flex-1 py-4 bg-bg-app border border-border-main rounded-2xl font-black text-[11px] uppercase tracking-widest text-text-light flex items-center justify-center gap-2 active:bg-slate-50 transition-all"
                >
                  <RotateCcw size={16} /> Reiniciar
                </button>
                {mode === 'study' && currentStep < selectedExam.steps.length - 1 ? (
                  <button 
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    Próximo <ArrowRight size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={handleFinish}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    Concluir <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="relative inline-block">
                <svg className="w-32 h-32">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                  <circle 
                    cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    className={accuracy > 80 ? 'text-green-500' : accuracy > 50 ? 'text-amber-500' : 'text-red-500'}
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * accuracy) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="text-3xl font-black">{accuracy}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-text-main">
                  {accuracy === 100 ? 'Posicionamento Perfeito!' : 
                   accuracy > 80 ? 'Excelente Trabalho!' :
                   accuracy > 50 ? 'Bom, mas pode melhorar' : 'Atenção aos Detalhes'}
                </h3>
                <p className="text-sm text-text-light font-medium">Sua precisão técnica baseada nos parâmetros ideais.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl text-left space-y-3">
                <p className="text-[10px] font-black text-text-light uppercase tracking-widest border-b border-slate-200 pb-2">Feedbacks:</p>
                <div className="space-y-2">
                  {Math.abs(angle - selectedExam.idealAngle) > 5 && (
                    <div className="flex gap-2 text-xs text-red-600 font-bold items-center">
                      <AlertCircle size={14} /> Ângulo inadequado para este exame.
                    </div>
                  )}
                  {Math.abs(rotation - selectedExam.idealRotation) > 10 && (
                    <div className="flex gap-2 text-xs text-red-600 font-bold items-center">
                      <AlertCircle size={14} /> Rotação do paciente incorreta.
                    </div>
                  )}
                  {Math.sqrt(Math.pow(beamX - selectedExam.idealBeamCenter.x, 2) + Math.pow(beamY - selectedExam.idealBeamCenter.y, 2)) > 8 && (
                    <div className="flex gap-2 text-xs text-red-600 font-bold items-center">
                      <AlertCircle size={14} /> Centralização do feixe desalinhada.
                    </div>
                  )}
                  {accuracy > 90 && (
                    <div className="flex gap-2 text-xs text-green-600 font-bold items-center">
                      <CheckCircle2 size={14} /> Todos os parâmetros dentro da tolerância técnica.
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={resetSimulator}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Praticar Novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Safety Disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
        <XOctagon className="text-amber-500 shrink-0" size={20} />
        <p className="text-[10px] text-amber-700 font-black leading-relaxed uppercase tracking-widest">
          USO EDUCACIONAL: Este simulador é uma ferramenta de treinamento acadêmico. Nunca utilize para diagnóstico clínico.
        </p>
      </div>
    </div>
  );
}
