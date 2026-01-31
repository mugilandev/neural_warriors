import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, Loader2, Leaf, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { useApp, useTranslation } from '@/contexts/AppContext';
import { toast } from 'sonner';

const cropTypes = [
  { id: 'rice', emoji: '🌾' },
  { id: 'wheat', emoji: '🌾' },
  { id: 'cotton', emoji: '🌿' },
  { id: 'tomato', emoji: '🍅' },
  { id: 'potato', emoji: '🥔' },
  { id: 'maize', emoji: '🌽' },
  { id: 'sugarcane', emoji: '🌿' },
  { id: 'other', emoji: '🌱' },
];

// Simulated disease database
const diseaseDatabase: Record<string, { diagnosis: string; cause: string; organic: string; chemical: string; healthyImage: string }> = {
  rice: {
    diagnosis: 'Rice Blast (Pyricularia oryzae)',
    cause: 'Fungal infection caused by high humidity, nitrogen-rich soil, and warm temperatures. Spreads through wind-borne spores.',
    organic: 'Apply Trichoderma viride (5g/L water). Use neem oil spray (3ml/L). Improve drainage and reduce nitrogen fertilizer. Plant resistant varieties.',
    chemical: 'Apply Tricyclazole 75% WP (0.6g/L) or Carbendazim 50% WP (1g/L). Spray Propiconazole 25% EC at first signs. Repeat after 10-15 days if needed.',
    healthyImage: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
  },
  wheat: {
    diagnosis: 'Wheat Rust (Puccinia triticina)',
    cause: 'Fungal disease favored by cool, moist conditions. Orange-brown pustules on leaves reduce photosynthesis and yield.',
    organic: 'Use bio-fungicides containing Bacillus subtilis. Spray sulfur-based fungicides. Remove infected plant debris. Practice crop rotation.',
    chemical: 'Apply Propiconazole 25% EC (0.1%) or Tebuconazole 250 EC (0.1%). Early detection is crucial. Spray at tillering and booting stages.',
    healthyImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
  },
  tomato: {
    diagnosis: 'Early Blight (Alternaria solani)',
    cause: 'Fungal infection from soil-borne spores. Thrives in warm, humid conditions. Affects older leaves first, spreading upward.',
    organic: 'Apply Trichoderma harzianum. Use copper-based organic fungicides. Mulch to prevent soil splash. Ensure proper plant spacing.',
    chemical: 'Spray Mancozeb 75% WP (2.5g/L) or Chlorothalonil 75% WP (2g/L). Apply preventively every 7-10 days during humid weather.',
    healthyImage: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400',
  },
  cotton: {
    diagnosis: 'Cotton Leaf Curl Virus (CLCuV)',
    cause: 'Viral disease transmitted by whiteflies. Causes upward curling of leaves, stunted growth, and reduced fiber quality.',
    organic: 'Control whitefly population with neem oil (5ml/L). Use yellow sticky traps. Introduce natural predators like ladybugs. Remove infected plants.',
    chemical: 'Apply Imidacloprid 17.8% SL (0.3ml/L) for whitefly control. Use Thiamethoxam 25% WG as soil drench. No direct cure for virus.',
    healthyImage: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400',
  },
  potato: {
    diagnosis: 'Late Blight (Phytophthora infestans)',
    cause: 'Destructive fungal-like disease. Thrives in cool, wet conditions. Can destroy entire crop within days if untreated.',
    organic: 'Apply copper hydroxide fungicide. Use Bordeaux mixture (1%). Remove infected plant parts immediately. Improve air circulation.',
    chemical: 'Spray Metalaxyl + Mancozeb (0.25%) or Cymoxanil + Mancozeb. Apply preventively during rainy season. Repeat every 5-7 days.',
    healthyImage: 'https://images.unsplash.com/photo-1518977676601-b53f82ber72a?w=400',
  },
  maize: {
    diagnosis: 'Northern Corn Leaf Blight (Exserohilum turcicum)',
    cause: 'Fungal infection causing cigar-shaped lesions. Favored by moderate temperatures and high humidity. Reduces grain fill.',
    organic: 'Apply Trichoderma-based bio-fungicides. Practice crop rotation with non-host crops. Use resistant hybrids. Remove crop residue.',
    chemical: 'Spray Propiconazole 25% EC (0.1%) or Azoxystrobin 23% SC (1ml/L) at first sign. Two applications 10-14 days apart recommended.',
    healthyImage: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
  },
  sugarcane: {
    diagnosis: 'Red Rot (Colletotrichum falcatum)',
    cause: 'Major fungal disease affecting stalks. Enters through bore holes and wounds. Causes internal red discoloration and hollow stalks.',
    organic: 'Use disease-free seed cane. Hot water treatment (50°C for 2 hours). Apply Trichoderma viride to planting material. Avoid waterlogging.',
    chemical: 'Dip setts in Carbendazim 50% WP (0.1%) for 15 minutes before planting. Apply systemic fungicides to ratoon crops.',
    healthyImage: 'https://images.unsplash.com/photo-1555012155-1f0b9e29a29c?w=400',
  },
  other: {
    diagnosis: 'General Leaf Spot Disease',
    cause: 'Various fungal pathogens causing circular or irregular spots. Often triggered by excess moisture and poor air circulation.',
    organic: 'Remove affected leaves. Improve air circulation. Apply neem oil or sulfur-based fungicides. Avoid overhead watering.',
    chemical: 'Use broad-spectrum fungicide like Mancozeb 75% WP (2g/L) or Copper Oxychloride 50% WP (3g/L). Consult local extension officer.',
    healthyImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
  },
};

export function AIScanner() {
  const { user, addScan, setCurrentScan } = useApp();
  const t = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    diagnosis: string;
    cause: string;
    organic: string;
    chemical: string;
    confidence: number;
    healthyImage: string;
  } | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const analyzeImage = async () => {
    if (!selectedCrop) {
      toast.error('Please select a crop type first');
      return;
    }
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2500));

    const diseaseInfo = diseaseDatabase[selectedCrop] || diseaseDatabase.other;
    const confidence = 85 + Math.random() * 12;

    const result = {
      diagnosis: diseaseInfo.diagnosis,
      cause: diseaseInfo.cause,
      organic: diseaseInfo.organic,
      chemical: diseaseInfo.chemical,
      confidence: Math.round(confidence * 10) / 10,
      healthyImage: diseaseInfo.healthyImage,
    };

    setAnalysisResult(result);
    setIsAnalyzing(false);
    toast.success('Analysis complete!');

    // Save to database if user is logged in
    if (user) {
      const scan = await addScan({
        crop_type: selectedCrop,
        diagnosis: result.diagnosis,
        cause: result.cause,
        organic_cure: result.organic,
        chemical_cure: result.chemical,
        confidence: result.confidence,
        image_url: uploadedImage,
        healthy_comparison_url: result.healthyImage,
      });
      if (scan) {
        setCurrentScan(scan);
      }
    }
  };

  const resetScanner = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setSelectedCrop('');
    setSliderPosition(50);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" />
          {t('scanLeaf')}
        </h3>
        {(uploadedImage || analysisResult) && (
          <button
            onClick={resetScanner}
            className="p-2 rounded-full hover:bg-secondary transition-colors touch-target"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Crop Type Selection */}
      {!analysisResult && (
        <div className="mb-6">
          <label className="text-sm font-medium text-muted-foreground mb-3 block">
            {t('selectCrop')}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {cropTypes.map((crop) => (
              <motion.button
                key={crop.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCrop(crop.id)}
                className={`p-3 rounded-xl text-center transition-all touch-target ${
                  selectedCrop === crop.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                <span className="text-2xl block mb-1">{crop.emoji}</span>
                <span className="text-xs font-medium">{t(crop.id)}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {!uploadedImage && !analysisResult && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="upload-zone p-8 flex flex-col items-center justify-center min-h-[200px] cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-primary/50 mb-4" />
          <p className="text-foreground font-medium mb-2">{t('uploadImage')}</p>
          <p className="text-muted-foreground text-sm text-center">{t('dragDrop')}</p>
          
          <div className="flex gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium touch-target"
            >
              <Camera className="w-5 h-5" />
              Capture
            </motion.button>
          </div>
        </div>
      )}

      {/* Uploaded Image Preview & Analysis */}
      {uploadedImage && !analysisResult && (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={uploadedImage}
              alt="Uploaded leaf"
              className="w-full h-64 object-cover"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={analyzeImage}
            disabled={isAnalyzing || !selectedCrop}
            className="w-full btn-gold py-4 flex items-center justify-center gap-2 disabled:opacity-50 touch-target"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze with AI
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Analysis Result */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Comparison Slider */}
            <div className="relative">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Diagnostic Comparison</h4>
              
              <div
                className="comparison-slider relative h-64 cursor-ew-resize select-none"
                onMouseMove={handleSliderMove}
                onTouchMove={handleSliderMove}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
              >
                {/* Healthy Image (Background) */}
                <img
                  src={analysisResult.healthyImage}
                  alt="Healthy crop"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Infected Image (Foreground with clip) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={uploadedImage || ''}
                    alt="Infected crop"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                
                {/* Slider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-4 bg-primary rounded-full" />
                      <div className="w-0.5 h-4 bg-primary rounded-full" />
                    </div>
                  </div>
                </div>
                
                {/* Labels */}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-destructive/90 text-destructive-foreground text-xs font-medium rounded-full">
                  {t('infected')}
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full">
                  {t('healthy')}
                </div>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">{t('confidence')}</p>
                <p className="text-2xl font-bold text-accent">{analysisResult.confidence}%</p>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h4 className="font-semibold text-foreground">{t('diagnosis')}</h4>
              </div>
              <p className="text-foreground">{analysisResult.diagnosis}</p>
            </div>

            {/* Cause */}
            <div className="p-4 bg-secondary rounded-xl">
              <h4 className="font-semibold text-foreground mb-2">{t('cause')}</h4>
              <p className="text-muted-foreground text-sm">{analysisResult.cause}</p>
            </div>

            {/* Cures */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">{t('organicCure')}</h4>
                </div>
                <p className="text-muted-foreground text-sm">{analysisResult.organic}</p>
              </div>

              <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-accent" />
                  <h4 className="font-semibold text-foreground">{t('chemicalCure')}</h4>
                </div>
                <p className="text-muted-foreground text-sm">{analysisResult.chemical}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
