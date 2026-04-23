export interface Exam {
  id: string;
  name: string;
  category: string;
  positioning: string;
  incidences: string;
  angulation: string;
  ffd: string; // Distância Foco-Filme
  kv: string;
  mas: string;
  observations: string;
  structures?: string;
  type: 'rotina' | 'especial' | 'odontologico';
  imageUrl?: string;
  userObservations?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}
