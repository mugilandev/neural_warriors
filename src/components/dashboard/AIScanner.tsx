import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, Loader2, Leaf, AlertTriangle, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp, useTranslation } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

// Fallback healthy images for comparison
const healthyImages: Record<string, string> = {
  rice: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
  wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
  tomato: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400',
  cotton: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82ber72a?w=400',
  maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400',
  sugarcane: 'https://images.unsplash.com/photo-1555012155-1f0b9e29a29c?w=400',
  other: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
};

interface AnalysisResult {
  diagnosis: string;
  cause: string;
  organic: string;
  chemical: string;
  confidence: number;
  healthyImage: string;
  isHealthy: boolean;
  preventionTips?: string;
}

export function AIScanner() {
  const { user, addScan, setCurrentScan } = useApp();
  const t = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
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
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-crop', {
        body: {
          imageBase64: uploadedImage,
          cropType: selectedCrop,
        },
      });

      if (error) {
        console.error('Analysis error:', error);
        throw new Error(error.message || 'Failed to analyze image');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const result: AnalysisResult = {
        diagnosis: data.diagnosis || 'Unknown Condition',
        cause: data.cause || 'Unable to determine cause',
        organic: data.organicCure || 'Consult a local agricultural expert',
        chemical: data.chemicalCure || 'Professional diagnosis recommended',
        confidence: data.confidence || 75,
        healthyImage: healthyImages[selectedCrop] || healthyImages.other,
        isHealthy: data.isHealthy || false,
        preventionTips: data.preventionTips,
      };

      setAnalysisResult(result);
      
      if (result.isHealthy) {
        toast.success('Great news! Your plant appears healthy!');
      } else {
        toast.success('Analysis complete! Review the diagnosis below.');
      }

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
    } catch (err) {
      console.error('Analysis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
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
          
          {isAnalyzing && (
            <p className="text-center text-sm text-muted-foreground">
              🌿 AI is analyzing your plant image...
            </p>
          )}
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
            {/* Healthy Plant Notice */}
            {analysisResult.isHealthy && (
              <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Plant is Healthy!</p>
                  <p className="text-sm text-muted-foreground">No diseases detected in your crop.</p>
                </div>
              </div>
            )}

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
                    alt="Your crop"
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
                  Your Image
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full">
                  Healthy Reference
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
            <div className={`p-4 rounded-xl border ${
              analysisResult.isHealthy 
                ? 'bg-primary/10 border-primary/20' 
                : 'bg-destructive/10 border-destructive/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {analysisResult.isHealthy ? (
                  <ShieldCheck className="w-5 h-5 text-primary" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                )}
                <h4 className="font-semibold text-foreground">{t('diagnosis')}</h4>
              </div>
              <p className="text-foreground">{analysisResult.diagnosis}</p>
            </div>

            {/* Cause */}
            <div className="p-4 bg-secondary rounded-xl">
              <h4 className="font-semibold text-foreground mb-2">{t('cause')}</h4>
              <p className="text-muted-foreground text-sm">{analysisResult.cause}</p>
            </div>

            {/* Prevention Tips (if available) */}
            {analysisResult.preventionTips && (
              <div className="p-4 bg-muted rounded-xl">
                <h4 className="font-semibold text-foreground mb-2">Prevention Tips</h4>
                <p className="text-muted-foreground text-sm">{analysisResult.preventionTips}</p>
              </div>
            )}

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

            {/* New Scan Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetScanner}
              className="w-full btn-forest py-4 flex items-center justify-center gap-2 touch-target"
            >
              <Camera className="w-5 h-5" />
              Scan Another Plant
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
