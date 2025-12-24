import React, { useState, useCallback, useEffect } from 'react';
import { Sparkles, Brain, Check, X, RotateCw, BookOpen, GraduationCap, Trophy, Star, Heart, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateVocabulary } from './services/gemini';
import Flashcard from './components/Flashcard';
import { AppState, GameStats, VocabularyCard } from './types';

const INITIAL_STATS: GameStats = {
  total: 0,
  correct: 0,
  incorrect: 0,
  seenWords: [],
  incorrectWords: []
};

const TOPICS = [
  "Daily Conversation",
  "Travel & Adventure",
  "Food & Dining",
  "Hobbies & Fun",
  "Feelings & Emotions",
  "Business & Professional",
  "Idioms & Slang"
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"];

const POSITIVE_MESSAGES = [
  "Spectacular! 🌟",
  "Way to go! 🚀",
  "You're a star! ⭐",
  "Brilliant! 💡",
  "Nailed it! 🔨",
  "Awesome! 🎉",
  "Superb! 🏆",
  "On fire! 🔥"
];

const ENCOURAGING_MESSAGES = [
  "Nice try! 🌱",
  "Keep growing! 🌿",
  "Learning takes time! 🕰️",
  "You'll get it! 🌈",
  "Practice makes perfect! 📚",
  "Don't give up! 💖",
  "Almost there! 🎯",
  "Stay curious! 🦉"
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.START);
  // Default to easier settings for a friendlier start
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [difficulty, setDifficulty] = useState<string>(DIFFICULTIES[0]);
  
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Feedback overlay state
  const [feedback, setFeedback] = useState<{ text: string, type: 'success' | 'missed' } | null>(null);

  const handleStart = async () => {
    setAppState(AppState.LOADING);
    setErrorMsg('');
    try {
      const generatedCards = await generateVocabulary(topic, difficulty, 10);
      setCards(generatedCards);
      setStats({ ...INITIAL_STATS, total: generatedCards.length });
      setCurrentIndex(0);
      setIsFlipped(false);
      setFeedback(null);
      setAppState(AppState.PLAYING);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate flashcards. Please try again or check your API key.");
      setAppState(AppState.ERROR);
    }
  };

  const handleCardResult = (known: boolean) => {
    // Prevent double clicking while feedback is showing
    if (feedback) return;

    const currentCard = cards[currentIndex];
    
    // Update stats
    setStats(prev => ({
      ...prev,
      correct: known ? prev.correct + 1 : prev.correct,
      incorrect: known ? prev.incorrect : prev.incorrect + 1,
      seenWords: [...prev.seenWords, currentCard],
      incorrectWords: known ? prev.incorrectWords : [...prev.incorrectWords, currentCard]
    }));

    // Trigger confetti if correct
    if (known) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#8b5cf6', '#d946ef'],
        disableForReducedMotion: true
      });
    }

    // Show feedback message
    const messages = known ? POSITIVE_MESSAGES : ENCOURAGING_MESSAGES;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setFeedback({ text: randomMsg, type: known ? 'success' : 'missed' });

    // Move to next card or finish after a delay for the feedback
    setTimeout(() => {
      setFeedback(null);
      
      if (currentIndex < cards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
      } else {
        setAppState(AppState.SUMMARY);
        // Big celebration for finishing
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
      }
    }, 1200); 
  };

  const handleRestart = () => {
    setAppState(AppState.START);
    setStats(INITIAL_STATS);
    setCards([]);
    setFeedback(null);
  };

  // --- RENDER FUNCTIONS ---

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto px-4">
      <div className="bg-gradient-to-tr from-indigo-100 to-purple-100 p-6 rounded-full mb-6 animate-bounce shadow-sm">
        <Sparkles className="w-12 h-12 text-indigo-600" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
        Fun with Flashcards
      </h1>
      <p className="text-lg text-slate-600 mb-10 max-w-lg">
        Learn new words in a fun, stress-free way! Pick a topic you love and let our AI create the perfect deck for you.
      </p>

      <div className="w-full bg-white p-8 rounded-3xl shadow-xl border border-indigo-50 mb-8 transform hover:scale-[1.01] transition-transform duration-300">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-left">
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Pick a Topic</label>
            <select 
              className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 text-slate-700 font-medium transition-colors cursor-pointer"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="text-left">
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Your Level</label>
            <select 
              className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 text-slate-700 font-medium transition-colors cursor-pointer"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <button 
        onClick={handleStart}
        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-500 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-200 w-full sm:w-auto shadow-xl"
      >
        <span className="text-lg">Let's Play!</span>
        <Brain className="w-6 h-6 ml-2 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-200 blur-2xl rounded-full opacity-60 animate-pulse"></div>
        <Loader2 className="w-20 h-20 text-indigo-600 animate-spin relative z-10" />
      </div>
      <h3 className="mt-8 text-2xl font-bold text-slate-800">Cooking up some magic...</h3>
      <p className="text-slate-500 mt-2 text-lg">Finding fun words for {topic}!</p>
    </div>
  );

  const renderPlaying = () => {
    const progress = ((currentIndex) / cards.length) * 100;

    return (
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 relative">
        {/* Progress Bar */}
        <div className="w-full max-w-md mb-8 flex items-center gap-4">
          <span className="text-sm font-bold text-indigo-400 w-12 text-right">{currentIndex + 1}/{cards.length}</span>
          <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Card Area */}
        <div className="mb-10 w-full flex justify-center perspective-1000 relative">
           <Flashcard 
             card={cards[currentIndex]} 
             isFlipped={isFlipped} 
             onFlip={() => !feedback && setIsFlipped(!isFlipped)} 
           />
           
           {/* Feedback Overlay */}
           {feedback && (
             <div className="absolute inset-0 z-20 flex items-center justify-center animate-in zoom-in-95 duration-200">
                <div className={`p-8 rounded-3xl shadow-2xl transform scale-110 ${
                  feedback.type === 'success' ? 'bg-white text-indigo-600 rotate-2' : 'bg-white text-orange-500 -rotate-2'
                }`}>
                  <div className="text-4xl md:text-5xl font-black text-center whitespace-nowrap drop-shadow-sm">
                    {feedback.text}
                  </div>
                </div>
             </div>
           )}
        </div>

        {/* Controls */}
        <div className={`transition-all duration-500 transform ${isFlipped && !feedback ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleCardResult(false)}
              className="flex flex-col items-center justify-center w-32 h-24 rounded-2xl bg-white border-b-4 border-orange-200 text-orange-500 hover:bg-orange-50 hover:border-orange-300 hover:translate-y-1 hover:border-b-0 transition-all shadow-sm group active:border-b-0 active:translate-y-1"
            >
              <Heart size={28} className="mb-1 group-hover:scale-110 transition-transform fill-current" />
              <span className="text-xs font-bold uppercase tracking-wide">Still Learning</span>
            </button>
            
            <button 
              onClick={() => handleCardResult(true)}
              className="flex flex-col items-center justify-center w-32 h-24 rounded-2xl bg-white border-b-4 border-emerald-200 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-300 hover:translate-y-1 hover:border-b-0 transition-all shadow-sm group active:border-b-0 active:translate-y-1"
            >
              <Star size={28} className="mb-1 group-hover:scale-110 transition-transform fill-current" />
              <span className="text-xs font-bold uppercase tracking-wide">I Know It!</span>
            </button>
          </div>
        </div>
        
        {!isFlipped && !feedback && (
          <p className="text-indigo-400 text-sm mt-8 font-medium animate-pulse flex items-center gap-2">
            <RotateCw size={14} /> Tap card to reveal
          </p>
        )}
      </div>
    );
  };

  const renderSummary = () => {
    const percentage = Math.round((stats.correct / stats.total) * 100);
    const isGreatScore = percentage >= 70;
    
    return (
      <div className="w-full max-w-3xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center p-6 rounded-full mb-4 shadow-lg ${isGreatScore ? 'bg-yellow-100' : 'bg-indigo-100'}`}>
            {isGreatScore ? <Trophy className="w-12 h-12 text-yellow-600" /> : <GraduationCap className="w-12 h-12 text-indigo-600" />}
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">{isGreatScore ? "Amazing Job!" : "Session Complete!"}</h2>
          <p className="text-xl text-slate-600">You mastered <span className="font-bold text-indigo-600">{stats.correct}</span> new words today!</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-emerald-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Check size={60} />
            </div>
            <div className="text-5xl font-black text-emerald-500 mb-1">{stats.correct}</div>
            <div className="text-xs font-bold text-emerald-600/60 uppercase tracking-wider">Super Stars</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-orange-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <RotateCw size={60} />
            </div>
            <div className="text-5xl font-black text-orange-500 mb-1">{stats.incorrect}</div>
            <div className="text-xs font-bold text-orange-600/60 uppercase tracking-wider">Keep Practicing</div>
          </div>
        </div>

        {stats.incorrectWords.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border-2 border-orange-50 overflow-hidden mb-8">
            <div className="p-5 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
              <BookOpen size={20} className="text-orange-600" />
              <h3 className="font-bold text-orange-900 text-lg">Let's Review These</h3>
            </div>
            <div className="divide-y divide-orange-50/50">
              {stats.incorrectWords.map((word, idx) => (
                <div key={idx} className="p-5 hover:bg-orange-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-xl text-slate-800">{word.word}</span>
                      <span className="text-slate-400 font-mono text-sm">/{word.pronunciation}/</span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">{word.definition}</p>
                    <p className="text-sm text-indigo-500 mt-1 italic">"{word.example}"</p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full whitespace-nowrap self-start sm:self-center">
                    {word.partOfSpeech}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button 
            onClick={handleRestart}
            className="group flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl hover:shadow-indigo-300 hover:-translate-y-1"
          >
            <RotateCw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
            Play Again
          </button>
        </div>
      </div>
    );
  };

  const renderError = () => (
     <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <X className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Whoops!</h3>
      <p className="text-slate-600 mb-8 max-w-md">{errorMsg}</p>
      <button 
        onClick={handleRestart}
        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-500 transition-colors shadow-lg"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-200 selection:text-purple-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={handleRestart}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition-transform">
              L
            </div>
            <span className="font-black text-xl text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">LingoFlash</span>
          </div>
          {appState === AppState.PLAYING && (
            <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full">
               <span className="text-indigo-500">{topic}</span>
               <span className="text-slate-300">•</span>
               <span>{difficulty}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {appState === AppState.START && renderStartScreen()}
        {appState === AppState.LOADING && renderLoading()}
        {appState === AppState.PLAYING && renderPlaying()}
        {appState === AppState.SUMMARY && renderSummary()}
        {appState === AppState.ERROR && renderError()}
      </main>
    </div>
  );
};

export default App;