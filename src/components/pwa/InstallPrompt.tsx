// src/components/pwa/InstallPrompt.tsx
import { useEffect, useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, DevicePhoneMobileIcon, BoltIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if prompt should be shown based on dismissed state
  const shouldShowPrompt = (): boolean => {
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
    if (!dismissedTime) {
      return true; // Never dismissed, can show
    }
    
    const dismissed = new Date(dismissedTime).getTime();
    const now = new Date().getTime();
    const hoursSinceDismissed = (now - dismissed) / (1000 * 60 * 60);
    
    // Show again after 24 hours (reduced from 7 days for better UX)
    return hoursSinceDismissed >= 24;
  };

  useEffect(() => {
    // Check if app is currently installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone) {
      setIsInstalled(true);
      // Keep the installed flag in localStorage
      localStorage.setItem('pwa-installed', 'true');
      return;
    } else {
      // Not in standalone mode - clear the installed flag if it exists
      // This handles the case where user uninstalled the app
      const wasInstalled = localStorage.getItem('pwa-installed');
      if (wasInstalled === 'true') {
        // App was uninstalled, aggressively clear all related state
        localStorage.removeItem('pwa-installed');
        localStorage.removeItem('pwa-prompt-dismissed');
        localStorage.removeItem('pwa-deferred-prompt-available');
      }
      setIsInstalled(false);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Store reference in case component unmounts/remounts
      localStorage.setItem('pwa-deferred-prompt-available', 'true');
      
      // Check if we should show the prompt
      if (shouldShowPrompt()) {
        // Show prompt after a short delay to allow page to load
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []); // Run only once on mount

  // Separate effect to check if we should show prompt when deferredPrompt becomes available
  useEffect(() => {
    if (deferredPrompt && shouldShowPrompt() && !isInstalled && !showPrompt) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }
  }, [deferredPrompt, isInstalled, showPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        localStorage.removeItem('pwa-prompt-dismissed');
        localStorage.removeItem('pwa-deferred-prompt-available');
        setIsInstalled(true);
      } else {
        // User dismissed, set dismissed time
        localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      // If prompt fails, still mark as dismissed to avoid repeated attempts
      localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Set dismissed time - will show again after 24 hours
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
    // Clear the availability flag so it can be set again when event fires
    localStorage.removeItem('pwa-deferred-prompt-available');
    // Don't clear deferredPrompt - keep it for potential future use within this session
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.9 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-50"
      >
        <div className="relative bg-gradient-to-br from-[#FDFBF7] via-white to-primary-50/30 rounded-[2.5rem] shadow-2xl shadow-primary-900/20 border-2 border-primary-100/50 overflow-hidden backdrop-blur-sm">
          {/* Decorative gradient accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-accent via-primary-500 to-accent" />
          
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent rounded-full blur-2xl" />
          </div>
          
          <div className="relative p-6 md:p-8">
            <div className="flex items-start gap-5">
              {/* App Icon with brand styling */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl shadow-primary-900/30">
                    <img src="/logo.png" alt="VitaNips" className="w-12 h-12 object-contain" />
                  </div>
                  {/* Download indicator */}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <ArrowDownTrayIcon className="w-4 h-4 text-primary-900 font-bold" />
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-primary-700 tracking-widest uppercase border-b-2 border-accent pb-0.5">
                        Download App
                      </span>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-primary-900 mb-2 tracking-tight leading-tight">
                      Get the VitaNips App
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      Download our app for a faster, smoother experience. Access doctors, prescriptions, and health records on the go—no browser needed.
                    </p>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-all"
                    aria-label="Dismiss"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Benefits with brand colors */}
                <div className="mb-5 space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BoltIcon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-gray-700 font-medium">Lightning fast—no loading delays</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <DevicePhoneMobileIcon className="w-5 h-5 text-primary-700" />
                    </div>
                    <span className="text-gray-700 font-medium">Works offline—access anytime, anywhere</span>
                  </div>
                </div>
                
                {/* Install button with brand styling */}
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-primary-900 hover:bg-primary-800 text-white px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary-900/30 hover:shadow-2xl hover:shadow-primary-900/40 hover:-translate-y-1 active:translate-y-0 group"
                >
                  <ArrowDownTrayIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span>Download App Now</span>
                </button>
                
                {/* Trust indicator */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  Free • No sign-up required • Secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;

