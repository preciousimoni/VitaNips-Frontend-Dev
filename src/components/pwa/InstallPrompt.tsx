// src/components/pwa/InstallPrompt.tsx
import { useEffect, useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

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
        // App was uninstalled, clear the flag
        localStorage.removeItem('pwa-installed');
        // Also clear dismissed state so prompt can show again
        localStorage.removeItem('pwa-prompt-dismissed');
      }
      setIsInstalled(false);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if install prompt was dismissed recently
      const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
      if (dismissedTime) {
        const dismissed = new Date(dismissedTime).getTime();
        const now = new Date().getTime();
        const daysSinceDismissed = (now - dismissed) / (1000 * 60 * 60 * 24);
        
        // Show again after 7 days (or immediately if app was uninstalled)
        if (daysSinceDismissed < 7) {
          // Still within cooldown period, don't show yet
          return;
        } else {
          // Cooldown expired, clear dismissed state
          localStorage.removeItem('pwa-prompt-dismissed');
        }
      }
      
      // Show prompt after a short delay to allow page to load
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true');
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
  };

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50"
      >
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-primary-900/10 border-2 border-gray-100 overflow-hidden backdrop-blur-sm">
          {/* Decorative accent bar */}
          <div className="h-1 bg-gradient-to-r from-accent via-primary to-accent" />
          
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Icon with brand styling */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-accent/20 rounded-2xl flex items-center justify-center border-2 border-primary-100">
                  <ArrowDownTrayIcon className="w-8 h-8 text-primary-700" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-display font-bold text-primary-900 mb-1 tracking-tight">
                      Install VitaNips
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Add to your home screen for quick access. Skip the browser, get the app experience.
                    </p>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                    aria-label="Dismiss"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Benefits */}
                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <SparklesIcon className="w-4 h-4 text-accent" />
                    <span>Faster access</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <SparklesIcon className="w-4 h-4 text-accent" />
                    <span>Offline ready</span>
                  </div>
                </div>
                
                {/* Install button */}
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-primary-900 hover:bg-primary-800 text-white px-6 py-3.5 rounded-full text-base font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary-900/20 hover:shadow-2xl hover:shadow-primary-900/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>Install App</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;

