import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, ChevronRight, Leaf, AlertTriangle } from 'lucide-react';
import { useApp, useTranslation, Scan } from '@/contexts/AppContext';
import { format } from 'date-fns';

export function ScanHistory() {
  const { scans, currentScan, setCurrentScan, user } = useApp();
  const t = useTranslation();

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <History className="w-6 h-6 text-accent" />
          <h3 className="text-xl font-semibold text-foreground">{t('history')}</h3>
        </div>
        <div className="text-center py-8">
          <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Sign in to view your scan history</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-6 h-6 text-accent" />
          <h3 className="text-xl font-semibold text-foreground">{t('history')}</h3>
        </div>
        <span className="text-sm text-muted-foreground">{scans.length} scans</span>
      </div>

      {scans.length === 0 ? (
        <div className="text-center py-8">
          <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">{t('noScans')}</p>
          <p className="text-muted-foreground text-sm">{t('startScanning')}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {scans.map((scan, index) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setCurrentScan(currentScan?.id === scan.id ? null : scan)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  currentScan?.id === scan.id
                    ? 'bg-primary/5 border-primary'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  {scan.image_url && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={scan.image_url}
                        alt={scan.crop_type}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground capitalize">
                        {t(scan.crop_type) || scan.crop_type}
                      </span>
                      {scan.confidence && (
                        <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">
                          {scan.confidence}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {scan.diagnosis || 'Analysis pending'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(scan.created_at), 'MMM d, yyyy • HH:mm')}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      currentScan?.id === scan.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>

                {/* Expanded Details */}
                {currentScan?.id === scan.id && scan.diagnosis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-border space-y-3"
                  >
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium text-foreground">{t('cause')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{scan.cause}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Leaf className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium text-foreground">{t('organicCure')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">{scan.organic_cure}</p>
                      </div>
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <AlertTriangle className="w-4 h-4 text-accent" />
                          <span className="text-xs font-medium text-foreground">{t('chemicalCure')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3">{scan.chemical_cure}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
