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
    <div className="flex flex-col items-center justify-center p-6">
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-semibold text-foreground mb-6"
      >
        {t('voiceAssistant')}
      </motion.h3>

      {/* Voice Button */}
      <div className="relative">
        {/* Pulse rings */}
        <AnimatePresence>
          {isListening && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  className="absolute inset-0 rounded-full bg-accent"
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleListening}
          className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all touch-target ${
            isListening
              ? 'bg-accent shadow-gold-lg'
              : 'bg-gradient-gold shadow-gold hover:shadow-gold-lg'
          }`}
        >
          {isListening ? (
            <MicOff className="w-10 h-10 md:w-12 md:h-12 text-accent-foreground" />
          ) : (
            <Mic className="w-10 h-10 md:w-12 md:h-12 text-accent-foreground" />
          )}
        </motion.button>
      </div>

      {/* Voice Wave Visualization */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-1 mt-6 h-12"
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [8, 32, 8],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: 'easeInOut',
                }}
                className="w-1.5 md:w-2 bg-accent rounded-full"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 text-muted-foreground text-center"
      >
        {isListening ? (
          <span className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 animate-pulse" />
            {t('listening')}
          </span>
        ) : (
          t('tapToSpeak')
        )}
      </motion.p>

      {/* Transcript */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 bg-secondary/50 rounded-xl max-w-xs text-center"
          >
            <p className="text-foreground text-sm italic">"{transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSupported && (
        <p className="mt-4 text-destructive text-sm text-center">
          Speech recognition is not supported in this browser
        </p>
      )}
    </div>
  );
}
