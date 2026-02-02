import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useApp, useTranslation, Language, translations } from '@/contexts/AppContext';
import { toast } from 'sonner';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const languageMap: Record<Language, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
};

export function VoiceButton() {
  const { isListening, setIsListening, language } = useApp();
  const t = useTranslation();
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = languageMap[language];

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      setTranscript(text);

      if (result.isFinal) {
        processVoiceCommand(text);
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable it in your browser settings.');
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = languageMap[language];
    }
  }, [language]);

  const processVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Simple command responses
    const responses: Record<string, string> = {
      en: `You said: "${text}". I can help you scan crops, find nearby stores, or check the weather. Try saying "scan my crop" or "find fertilizer shop".`,
      hi: `आपने कहा: "${text}"। मैं आपकी फसलों को स्कैन करने, नजदीकी दुकानों को खोजने या मौसम की जांच करने में मदद कर सकता हूं।`,
      ta: `நீங்கள் சொன்னீர்கள்: "${text}". நான் பயிர்களை ஸ்கேன் செய்யவும், அருகிலுள்ள கடைகளைக் கண்டறியவும், வானிலையைச் சரிபார்க்கவும் உதவ முடியும்.`,
      te: `మీరు చెప్పారు: "${text}". నేను పంటలను స్కాన్ చేయడానికి, సమీపంలోని దుకాణాలను కనుగొనడానికి లేదా వాతావరణాన్ని తనిఖీ చేయడానికి సహాయం చేయగలను.`,
    };

    speak(responses[language] || responses.en);
    toast.success(`Voice command received: "${text}"`);
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageMap[language];
      synthRef.current.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!isSupported) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
      toast.success(translations[language].listening || 'Listening...');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-6">
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-semibold text-foreground mb-8 text-premium-wide uppercase tracking-wider"
      >
        {t('voiceAssistant')}
      </motion.h3>

      {/* Glowing Orb Voice Button */}
      <div className="relative flex items-center justify-center">
        {/* Outer halo rings */}
        <div className="absolute w-40 h-40 md:w-52 md:h-52 rounded-full bg-accent/20 halo-pulse" />
        <div className="absolute w-48 h-48 md:w-60 md:h-60 rounded-full bg-accent/10 halo-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full bg-accent/5 halo-pulse" style={{ animationDelay: '1s' }} />

        {/* Pulse rings when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.6,
                  }}
                  className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-accent"
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main Orb Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleListening}
          className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center touch-target z-10 ${
            isListening
              ? 'bg-accent orb-glow'
              : 'bg-gradient-to-br from-accent via-accent to-accent/80 orb-glow'
          }`}
          style={{
            background: 'linear-gradient(135deg, hsl(42 87% 62%) 0%, hsl(42 87% 52%) 50%, hsl(42 87% 45%) 100%)',
          }}
        >
          <motion.div
            animate={isListening ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {isListening ? (
              <MicOff className="w-12 h-12 md:w-14 md:h-14 text-accent-foreground drop-shadow-lg" />
            ) : (
              <Mic className="w-12 h-12 md:w-14 md:h-14 text-accent-foreground drop-shadow-lg" />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* Voice Wave Visualization */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-1 mt-8 h-12"
          >
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [8, 40, 8],
                }}
                transition={{
                  duration: 0.4,
                  repeat: Infinity,
                  delay: i * 0.04,
                  ease: 'easeInOut',
                }}
                className="w-1.5 md:w-2 bg-accent rounded-full shadow-gold"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 text-foreground/80 text-center text-premium font-medium"
      >
        {isListening ? (
          <span className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 animate-pulse text-accent" />
            <span className="text-accent font-semibold">{t('listening')}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">{t('tapToSpeak')}</span>
        )}
      </motion.p>

      {/* Transcript */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mt-6 p-4 card-glass-dark max-w-sm text-center"
          >
            <p className="text-foreground/90 text-sm italic">"{transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSupported && (
        <p className="mt-4 text-destructive text-sm text-center font-medium">
          Speech recognition is not supported in this browser
        </p>
      )}
    </div>
  );
}
