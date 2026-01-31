import { motion } from 'framer-motion';
import { Header } from '@/components/dashboard/Header';
import { VoiceButton } from '@/components/dashboard/VoiceButton';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { AIScanner } from '@/components/dashboard/AIScanner';
import { Marketplace } from '@/components/dashboard/Marketplace';
import { ScanHistory } from '@/components/dashboard/ScanHistory';
import { useTranslation } from '@/contexts/AppContext';

export default function Dashboard() {
  const t = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-cream">
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
            {t('welcome')}
          </h2>
          <p className="text-muted-foreground">
            AI-powered crop diagnostics at your fingertips
          </p>
        </motion.div>

        {/* Voice Assistant - Centered and Prominent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card-premium mb-8"
        >
          <VoiceButton />
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6 md:space-y-8">
            {/* AI Scanner */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AIScanner />
            </motion.div>

            {/* Scan History */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ScanHistory />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:space-y-8">
            {/* Weather Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <WeatherWidget />
            </motion.div>

            {/* Marketplace */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Marketplace />
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 py-6 text-center border-t border-border"
        >
          <p className="text-muted-foreground text-sm">
            © 2024 Agri-Solve Pro. Empowering farmers with AI technology.
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
