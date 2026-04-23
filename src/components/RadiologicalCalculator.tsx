import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  ArrowRightLeft, 
  Zap, 
  AlertCircle, 
  Activity,
  ChevronRight
} from 'lucide-react';

export default function RadiologicalCalculator() {
  const [activeTab, setActiveTab] = useState<'dose' | 'factors' | 'conversions'>('dose');

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-white p-1 rounded-2xl border border-border-main shadow-sm">
        {(['dose', 'factors', 'conversions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-text-light hover:bg-slate-50'
            }`}
          >
            {tab === 'dose' && 'Dose'}
            {tab === 'factors' && 'Fatores'}
            {tab === 'conversions' && 'Conversão'}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {activeTab === 'dose' && <DoseCalculator />}
        {activeTab === 'factors' && <FactorsCalculator />}
        {activeTab === 'conversions' && <UnitConverter />}
      </motion.div>
    </div>
  );
}

function DoseCalculator() {
  const [kvp, setKvp] = useState<string>('');
  const [mas, setMas] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [dose, setDose] = useState<number | null>(null);

  useEffect(() => {
    const k = parseFloat(kvp);
    const m = parseFloat(mas);
    const d = parseFloat(distance);

    if (k > 0 && m > 0 && d > 0) {
      // Basic radiological dose estimation formula (simplified for educational purposes)
      // Reference: Dose ∝ (kVp² * mAs) / d²
      const result = (Math.pow(k, 2) * m) / Math.pow(d, 2) * 0.01; 
      setDose(parseFloat(result.toFixed(4)));
    } else {
      setDose(null);
    }
  }, [kvp, mas, distance]);

  const isDoseHigh = dose && dose > 0.5; // Arbitrary threshold for warning

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white p-6 rounded-[2rem] border border-border-main shadow-sm space-y-6">
        <div className="flex items-center gap-3 text-primary mb-2">
          <Activity size={20} />
          <h3 className="text-sm font-black uppercase tracking-tight">Estimativa de Dose</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">kVp (Quilovoltagem)</label>
            <input 
              type="number" 
              value={kvp}
              onChange={(e) => setKvp(e.target.value)}
              className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-black text-primary" 
              placeholder="Ex: 80" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">mAs (Miliampere-segundo)</label>
            <input 
              type="number" 
              value={mas}
              onChange={(e) => setMas(e.target.value)}
              className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-black text-primary" 
              placeholder="Ex: 20" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">Distância (cm)</label>
            <input 
              type="number" 
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-black text-primary" 
              placeholder="Ex: 100" 
            />
          </div>
        </div>

        {dose !== null && (
          <div className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 transition-colors ${isDoseHigh ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Dose Estimada</span>
            <div className="text-3xl font-black">{dose} <span className="text-sm">mGy</span></div>
            {isDoseHigh && (
              <div className="flex items-center gap-1 mt-2 font-bold text-[10px] uppercase">
                <AlertCircle size={14} /> Atenção: Dose elevada
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-border-main">
        <p className="text-[10px] text-text-light font-medium italic">
          * Nota: Os cálculos de dose são estimativas teóricas para fins educacionais e podem variar conforme o equipamento.
        </p>
      </div>
    </div>
  );
}

function FactorsCalculator() {
  const [baseKvp, setBaseKvp] = useState<string>('80');
  const [baseMas, setBaseMas] = useState<string>('20');
  
  const kvpPlus = (parseFloat(baseKvp) * 1.15).toFixed(1);
  const kvpMinus = (parseFloat(baseKvp) * 0.85).toFixed(1);
  const masHalf = (parseFloat(baseMas) / 2).toFixed(1);
  const masDouble = (parseFloat(baseMas) * 2).toFixed(1);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white p-6 rounded-[2rem] border border-border-main shadow-sm space-y-6">
        <div className="flex items-center gap-3 text-primary mb-2">
          <Zap size={20} />
          <h3 className="text-sm font-black uppercase tracking-tight">Regra dos 15%</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">kVp Base</label>
            <input 
              type="number" 
              value={baseKvp}
              onChange={(e) => setBaseKvp(e.target.value)}
              className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-black text-primary" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-light uppercase tracking-widest pl-1">mAs Base</label>
            <input 
              type="number" 
              value={baseMas}
              onChange={(e) => setBaseMas(e.target.value)}
              className="w-full card p-3 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-black text-primary" 
            />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div>
              <div className="text-[10px] font-black uppercase text-primary tracking-widest">Aumentar Penetrabilidade</div>
              <div className="text-sm font-bold text-text-main mt-1">kVp +15% <span className="text-primary">({kvpPlus})</span></div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase text-text-light tracking-widest">Compensar mAs</div>
              <div className="text-sm font-bold text-text-main mt-1">mAs / 2 <span className="text-primary">({masHalf})</span></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-border-main">
            <div>
              <div className="text-[10px] font-black uppercase text-text-light tracking-widest">Diminuir contraste</div>
              <div className="text-sm font-bold text-text-main mt-1">kVp -15% <span className="text-primary">({kvpMinus})</span></div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black uppercase text-text-light tracking-widest">Compensar mAs</div>
              <div className="text-sm font-bold text-text-main mt-1">mAs x 2 <span className="text-primary">({masDouble})</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnitConverter() {
  const [val, setVal] = useState<string>('1');
  const [type, setType] = useState<'mgy-gy' | 'cm-mm'>('mgy-gy');

  const result = type === 'mgy-gy' ? (parseFloat(val) / 1000) : (parseFloat(val) * 10);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white p-6 rounded-[2rem] border border-border-main shadow-sm space-y-6">
        <div className="flex items-center gap-3 text-primary mb-2">
          <ArrowRightLeft size={20} />
          <h3 className="text-sm font-black uppercase tracking-tight">Conversão de Unidades</h3>
        </div>

        <div className="flex gap-2 bg-bg-app p-1 rounded-xl">
          <button 
            onClick={() => setType('mgy-gy')}
            className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${type === 'mgy-gy' ? 'bg-white shadow-sm text-primary' : 'text-text-light'}`}
          >
            mGy ↔ Gy
          </button>
          <button 
            onClick={() => setType('cm-mm')}
            className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${type === 'cm-mm' ? 'bg-white shadow-sm text-primary' : 'text-text-light'}`}
          >
            cm ↔ mm
          </button>
        </div>

        <div className="flex flex-col items-center gap-4 py-4">
          <input 
            type="number" 
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full text-center text-4xl font-black text-primary bg-transparent outline-none"
            placeholder="0"
          />
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-light">Equivale a</div>
          <div className="text-4xl font-black text-text-main">
            {isNaN(result) ? '0' : result.toLocaleString()} 
            <span className="text-lg ml-2 font-bold text-text-light">
              {type === 'mgy-gy' ? 'Gray (Gy)' : 'Milímetros (mm)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
