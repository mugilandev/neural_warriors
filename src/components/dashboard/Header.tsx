import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Sun, Moon, Globe, User, LogOut, Menu, X } from 'lucide-react';
import { useApp, useTranslation, Language } from '@/contexts/AppContext';
import { AuthModal } from '@/components/auth/AuthModal';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
];

export function Header() {
  const { user, signOut, language, setLanguage, fieldMode, toggleFieldMode } = useApp();
  const t = useTranslation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-forest flex items-center justify-center shadow-lg">
                <Leaf className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  Agri-Solve <span className="text-gradient-gold">Pro</span>
                </h1>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {/* Field Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleFieldMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all touch-target ${
                  fieldMode
                    ? 'bg-accent text-accent-foreground shadow-gold'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {fieldMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{t('fieldMode')}</span>
              </motion.button>

              {/* Language Selector */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all touch-target"
                >
                  <Globe className="w-5 h-5" />
                  <span>{languages.find(l => l.code === language)?.flag}</span>
                </motion.button>

                {showLanguageMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-2 bg-card rounded-xl shadow-xl border border-border overflow-hidden min-w-[160px]"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors ${
                          language === lang.code ? 'bg-primary/10' : ''
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Auth Button */}
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={signOut}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all touch-target"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t('signOut')}</span>
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(true)}
                  className="btn-forest touch-target"
                >
                  {t('signIn')}
                </motion.button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-xl bg-secondary touch-target"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden pb-4 space-y-3"
            >
              <button
                onClick={toggleFieldMode}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all touch-target ${
                  fieldMode
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {fieldMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{t('fieldMode')}</span>
              </button>

              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all touch-target ${
                      language === lang.code
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>

              {user ? (
                <button
                  onClick={signOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 text-destructive touch-target"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('signOut')}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full btn-forest touch-target"
                >
                  {t('signIn')}
                </button>
              )}
            </motion.div>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
