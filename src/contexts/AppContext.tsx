import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Types
export interface Scan {
  id: string;
  user_id: string;
  crop_type: string;
  diagnosis: string | null;
  cause: string | null;
  organic_cure: string | null;
  chemical_cure: string | null;
  confidence: number | null;
  image_url: string | null;
  healthy_comparison_url: string | null;
  created_at: string;
}

export interface Shop {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  pesticide_stock_list: string[] | null;
  organic_products: string[] | null;
  rating: number | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  preferred_language: string;
  field_mode_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type Language = 'en' | 'hi' | 'ta' | 'te';

interface AppContextType {
  // Auth
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Field Mode
  fieldMode: boolean;
  toggleFieldMode: () => void;

  // Location
  userLocation: { latitude: number; longitude: number } | null;
  locationError: string | null;
  requestLocation: () => void;

  // Scans
  scans: Scan[];
  currentScan: Scan | null;
  setCurrentScan: (scan: Scan | null) => void;
  addScan: (scan: Omit<Scan, 'id' | 'user_id' | 'created_at'>) => Promise<Scan | null>;
  refreshScans: () => Promise<void>;

  // Shops
  shops: Shop[];
  nearbyShops: Shop[];
  refreshShops: () => Promise<void>;

  // Voice
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  en: {
    welcome: 'Welcome to Agri-Solve Pro',
    scanLeaf: 'Scan Leaf',
    uploadImage: 'Upload or capture a leaf image',
    dragDrop: 'Drag & drop or click to upload',
    analyzing: 'Analyzing your crop...',
    diagnosis: 'Diagnosis',
    cause: 'Cause of Infection',
    organicCure: 'Organic Cure',
    chemicalCure: 'Chemical Cure',
    nearbyShops: 'Nearby Shops',
    findStores: 'Find fertilizer stores near you',
    weather: 'Weather',
    voiceAssistant: 'Voice Assistant',
    tapToSpeak: 'Tap to speak',
    listening: 'Listening...',
    fieldMode: 'Field Mode',
    history: 'Scan History',
    settings: 'Settings',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    healthy: 'Healthy',
    infected: 'Infected',
    confidence: 'Confidence',
    distance: 'Distance',
    call: 'Call',
    directions: 'Directions',
    noScans: 'No scans yet',
    startScanning: 'Start scanning your crops!',
    cropType: 'Crop Type',
    selectCrop: 'Select crop type',
    rice: 'Rice',
    wheat: 'Wheat',
    cotton: 'Cotton',
    tomato: 'Tomato',
    potato: 'Potato',
    maize: 'Maize',
    sugarcane: 'Sugarcane',
    other: 'Other',
  },
  hi: {
    welcome: 'एग्री-सॉल्व प्रो में आपका स्वागत है',
    scanLeaf: 'पत्ती स्कैन करें',
    uploadImage: 'पत्ती की छवि अपलोड या कैप्चर करें',
    dragDrop: 'खींचें और छोड़ें या अपलोड करने के लिए क्लिक करें',
    analyzing: 'आपकी फसल का विश्लेषण हो रहा है...',
    diagnosis: 'निदान',
    cause: 'संक्रमण का कारण',
    organicCure: 'जैविक उपचार',
    chemicalCure: 'रासायनिक उपचार',
    nearbyShops: 'नजदीकी दुकानें',
    findStores: 'अपने पास उर्वरक स्टोर खोजें',
    weather: 'मौसम',
    voiceAssistant: 'वॉयस असिस्टेंट',
    tapToSpeak: 'बोलने के लिए टैप करें',
    listening: 'सुन रहा हूं...',
    fieldMode: 'फील्ड मोड',
    history: 'स्कैन इतिहास',
    settings: 'सेटिंग्स',
    signIn: 'साइन इन करें',
    signUp: 'साइन अप करें',
    signOut: 'साइन आउट',
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'पूरा नाम',
    healthy: 'स्वस्थ',
    infected: 'संक्रमित',
    confidence: 'विश्वास',
    distance: 'दूरी',
    call: 'कॉल',
    directions: 'दिशा-निर्देश',
    noScans: 'अभी तक कोई स्कैन नहीं',
    startScanning: 'अपनी फसलों को स्कैन करना शुरू करें!',
    cropType: 'फसल प्रकार',
    selectCrop: 'फसल प्रकार चुनें',
    rice: 'चावल',
    wheat: 'गेहूं',
    cotton: 'कपास',
    tomato: 'टमाटर',
    potato: 'आलू',
    maize: 'मक्का',
    sugarcane: 'गन्ना',
    other: 'अन्य',
  },
  ta: {
    welcome: 'அக்ரி-சால்வ் புரோவுக்கு வரவேற்கிறோம்',
    scanLeaf: 'இலையை ஸ்கேன் செய்',
    uploadImage: 'இலை படத்தை பதிவேற்றவும் அல்லது படம் எடுக்கவும்',
    dragDrop: 'இழுத்து விடவும் அல்லது பதிவேற்ற கிளிக் செய்யவும்',
    analyzing: 'உங்கள் பயிரை பகுப்பாய்வு செய்கிறது...',
    diagnosis: 'நோய் கண்டறிதல்',
    cause: 'தொற்றின் காரணம்',
    organicCure: 'இயற்கை தீர்வு',
    chemicalCure: 'இரசாயன தீர்வு',
    nearbyShops: 'அருகிலுள்ள கடைகள்',
    findStores: 'அருகிலுள்ள உர கடைகளைக் கண்டறியவும்',
    weather: 'வானிலை',
    voiceAssistant: 'குரல் உதவியாளர்',
    tapToSpeak: 'பேச தட்டவும்',
    listening: 'கேட்கிறேன்...',
    fieldMode: 'வயல் பயன்முறை',
    history: 'ஸ்கேன் வரலாறு',
    settings: 'அமைப்புகள்',
    signIn: 'உள்நுழைக',
    signUp: 'பதிவு செய்க',
    signOut: 'வெளியேறு',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    name: 'முழு பெயர்',
    healthy: 'ஆரோக்கியமான',
    infected: 'பாதிக்கப்பட்ட',
    confidence: 'நம்பிக்கை',
    distance: 'தூரம்',
    call: 'அழைப்பு',
    directions: 'வழிகள்',
    noScans: 'இன்னும் ஸ்கேன்கள் இல்லை',
    startScanning: 'உங்கள் பயிர்களை ஸ்கேன் செய்யத் தொடங்குங்கள்!',
    cropType: 'பயிர் வகை',
    selectCrop: 'பயிர் வகையைத் தேர்ந்தெடுக்கவும்',
    rice: 'அரிசி',
    wheat: 'கோதுமை',
    cotton: 'பருத்தி',
    tomato: 'தக்காளி',
    potato: 'உருளைக்கிழங்கு',
    maize: 'சோளம்',
    sugarcane: 'கரும்பு',
    other: 'மற்றவை',
  },
  te: {
    welcome: 'అగ్రి-సాల్వ్ ప్రోకి స్వాగతం',
    scanLeaf: 'ఆకును స్కాన్ చేయండి',
    uploadImage: 'ఆకు చిత్రాన్ని అప్‌లోడ్ చేయండి లేదా క్యాప్చర్ చేయండి',
    dragDrop: 'డ్రాగ్ & డ్రాప్ చేయండి లేదా అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి',
    analyzing: 'మీ పంటను విశ్లేషిస్తోంది...',
    diagnosis: 'వ్యాధి నిర్ధారణ',
    cause: 'సంక్రమణ కారణం',
    organicCure: 'సేంద్రీయ చికిత్స',
    chemicalCure: 'రసాయన చికిత్స',
    nearbyShops: 'సమీపంలోని దుకాణాలు',
    findStores: 'మీ సమీపంలో ఎరువుల దుకాణాలను కనుగొనండి',
    weather: 'వాతావరణం',
    voiceAssistant: 'వాయిస్ అసిస్టెంట్',
    tapToSpeak: 'మాట్లాడటానికి నొక్కండి',
    listening: 'వింటున్నాను...',
    fieldMode: 'ఫీల్డ్ మోడ్',
    history: 'స్కాన్ చరిత్ర',
    settings: 'సెట్టింగ్‌లు',
    signIn: 'సైన్ ఇన్',
    signUp: 'సైన్ అప్',
    signOut: 'సైన్ అవుట్',
    email: 'ఇమెయిల్',
    password: 'పాస్‌వర్డ్',
    name: 'పూర్తి పేరు',
    healthy: 'ఆరోగ్యకరమైన',
    infected: 'సంక్రమించిన',
    confidence: 'నమ్మకం',
    distance: 'దూరం',
    call: 'కాల్',
    directions: 'దిశలు',
    noScans: 'ఇంకా స్కాన్‌లు లేవు',
    startScanning: 'మీ పంటలను స్కాన్ చేయడం ప్రారంభించండి!',
    cropType: 'పంట రకం',
    selectCrop: 'పంట రకాన్ని ఎంచుకోండి',
    rice: 'బియ్యం',
    wheat: 'గోధుమ',
    cotton: 'పత్తి',
    tomato: 'టమాటో',
    potato: 'బంగాళాదుంప',
    maize: 'మొక్కజొన్న',
    sugarcane: 'చెరకు',
    other: 'ఇతర',
  },
};

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // App state
  const [language, setLanguage] = useState<Language>('en');
  const [fieldMode, setFieldMode] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [currentScan, setCurrentScan] = useState<Scan | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Initialize auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch scans when user changes
  useEffect(() => {
    if (user) {
      refreshScans();
    } else {
      setScans([]);
    }
  }, [user]);

  // Fetch shops on mount
  useEffect(() => {
    refreshShops();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setScans([]);
    setCurrentScan(null);
  };

  const toggleFieldMode = () => {
    setFieldMode(!fieldMode);
    if (!fieldMode) {
      document.documentElement.classList.add('field-mode');
    } else {
      document.documentElement.classList.remove('field-mode');
    }
  };

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError(error.message);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser');
    }
  };

  const refreshScans = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setScans(data as Scan[]);
    }
  };

  const addScan = async (scanData: Omit<Scan, 'id' | 'user_id' | 'created_at'>): Promise<Scan | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('scans')
      .insert([{ ...scanData, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      const newScan = data as Scan;
      setScans([newScan, ...scans]);
      setCurrentScan(newScan);
      return newScan;
    }
    return null;
  };

  const refreshShops = async () => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('rating', { ascending: false });

    if (!error && data) {
      setShops(data as Shop[]);
    }
  };

  // Calculate nearby shops based on user location
  const nearbyShops = userLocation
    ? shops
        .map((shop) => ({
          ...shop,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            Number(shop.latitude),
            Number(shop.longitude)
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
    : shops;

  const value: AppContextType = {
    user,
    session,
    loading,
    signOut,
    language,
    setLanguage,
    fieldMode,
    toggleFieldMode,
    userLocation,
    locationError,
    requestLocation,
    scans,
    currentScan,
    setCurrentScan,
    addScan,
    refreshScans,
    shops,
    nearbyShops,
    refreshShops,
    isListening,
    setIsListening,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function useTranslation() {
  const { language } = useApp();
  return (key: string) => translations[language][key] || key;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
