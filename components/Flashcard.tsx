import React from 'react';
import { VocabularyCard } from '../types';
import { Volume2 } from 'lucide-react';

interface FlashcardProps {
  card: VocabularyCard;
  isFlipped: boolean;
  onFlip: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped, onFlip }) => {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(card.word);
    utterance.lang = 'en-US';
    // Slightly slower rate for beginners is often helpful
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div 
      className="group perspective-1000 w-full max-w-md h-96 cursor-pointer hover:scale-[1.02] transition-transform duration-300"
      onClick={onFlip}
    >
      <div 
        className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of Card */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-xl border-b-4 border-indigo-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-50 rounded-full -translate-x-12 -translate-y-12 opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-50 rounded-full translate-x-12 translate-y-12 opacity-50"></div>

          <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6 bg-indigo-50 px-3 py-1 rounded-full">
            Word
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-slate-800 mb-4 text-center tracking-tight">
            {card.word}
          </h2>
          <div className="flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl mt-2">
            <span className="italic font-serif font-medium text-indigo-500">{card.partOfSpeech}</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-sm text-slate-400">{card.pronunciation}</span>
          </div>
          
          <button 
            onClick={handleSpeak}
            className="mt-8 p-4 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-110 transition-all z-10 shadow-sm"
            title="Listen to pronunciation"
          >
            <Volume2 size={28} />
          </button>
        </div>

        {/* Back of Card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl border-b-4 border-indigo-700 text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
           {/* Decorative pattern */}
           <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>

           <div className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-6 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
            Definition
          </div>
          <p className="text-2xl md:text-3xl font-bold leading-snug mb-8 drop-shadow-md">
            {card.definition}
          </p>
          
          <div className="bg-white/15 rounded-2xl p-6 w-full backdrop-blur-md border border-white/10 shadow-inner">
            <p className="text-xs font-bold text-indigo-200 mb-2 uppercase tracking-wide">Example</p>
            <p className="italic text-lg text-white font-medium leading-relaxed">"{card.example}"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;