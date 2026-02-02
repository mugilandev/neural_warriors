import { motion } from 'framer-motion';
import { Header } from '@/components/dashboard/Header';
import { VoiceButton } from '@/components/dashboard/VoiceButton';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { AIScanner } from '@/components/dashboard/AIScanner';
import { Marketplace } from '@/components/dashboard/Marketplace';
import { ScanHistory } from '@/components/dashboard/ScanHistory';
import { ParticleOverlay } from '@/components/dashboard/ParticleOverlay';
import { useTranslation } from '@/contexts/AppContext';
import wheatFieldBg from '@/assets/wheat-field-bg.jpg';

export default function Dashboard() {
  const t = useTranslation();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Immersive Background with Ken Burns Effect */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 ken-burns"
          style={{
            backgroundImage: `url(${wheatFieldBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transformOrigin: 'center center',
          }}
        />
        {/* Vignette Overlay for readability */}
        <div className="absolute inset-0 vignette" />
        {/* Top gradient for header readability */}
        <div 
          className="absolute inset-x-0 top-0 h-48"
          style={{
            background: 'linear-gradient(to bottom, hsl(109 40% 8% / 0.5) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Floating Particles */}
      <ParticleOverlay />

      {/* Content Layer */}
      <div className="relative z-20">
        <Header />

        <main className="container mx-auto px-4 py-6 md:py-10">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg text-premium-wide">
              {t('welcome')}
            </h2>
            <p className="text-white/80 text-premium drop-shadow-md">
              AI-powered crop diagnostics at your fingertips
            </p>
          </motion.div>

          {/* Voice Assistant - Centered and Prominent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card-premium mb-8 shadow-2xl"
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
                className="shadow-2xl"
              >
                <AIScanner />
              </motion.div>

              {/* Scan History */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="shadow-2xl"
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
                className="shadow-2xl"
              >
                <WeatherWidget />
              </motion.div>

              {/* Marketplace */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="shadow-2xl"
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
            className="mt-12 py-6 text-center"
          >
            <div className="card-glass-dark inline-block px-8 py-4 rounded-full">
              <p className="text-white/70 text-sm text-premium">
                © 2024 Agri-Solve Pro. Empowering farmers with AI technology.
              </p>
            </div>
          </motion.footer>
        </main>
      </div>
    </div>
  );
}
