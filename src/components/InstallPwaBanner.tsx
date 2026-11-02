import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, MoreVertical } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already standalone / installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for custom open requests from anywhere in the app
    const handleOpenRequest = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt().then(() => {
          deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
              setIsInstalled(true);
              setShowBanner(false);
            }
          });
        });
      } else {
        setShowInstructionsModal(true);
      }
    };
    window.addEventListener('open-pwa-install', handleOpenRequest);

    // Show banner after 1.5s if not installed and not dismissed in this session
    const sessionDismissed = sessionStorage.getItem('oficios_pwa_banner_dismissed');
    if (!sessionDismissed && !isStandalone) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1200);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('open-pwa-install', handleOpenRequest);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('open-pwa-install', handleOpenRequest);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setShowBanner(false);
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Install prompt error, showing modal guide:', err);
        setShowInstructionsModal(true);
      }
    } else {
      // Show instructional modal (iOS, in-app browser or Chrome manual add)
      setShowInstructionsModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('oficios_pwa_banner_dismissed', 'true');
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Floating Install Banner removed as requested by user */}

      {/* Instructions Modal (only shown if manually triggered) */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-[#0b1c30] relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-3 border border-amber-200">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-[#002b49] mb-1">
              Instalar en tu Pantalla de Inicio
            </h3>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Seguí estos 2 simples pasos para tener el ícono oficial en tu teléfono sin ocupar espacio:
            </p>

            {isIOS ? (
              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#002b49] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Tocá el botón <strong>Compartir</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-blue-600" /> en la barra inferior de Safari.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#002b49] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Buscá y tocá <strong>"Agregar a la pantalla principal"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-gray-700" />.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#002b49] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Tocá <strong>"Agregar"</strong> arriba a la derecha. ¡Listo!</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#002b49] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Tocá los <strong>tres puntos</strong> <MoreVertical className="w-3.5 h-3.5 inline mx-0.5 text-gray-800" /> en la esquina superior de tu navegador (Chrome).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#002b49] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Elegí <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#002b49] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Confirmá tocando <strong>Instalar</strong>. Verás el ícono oficial en tu teléfono.</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowInstructionsModal(false)}
              className="w-full mt-5 bg-[#002b49] text-white py-3 rounded-xl font-bold text-xs hover:bg-[#003b66] active:scale-98 transition-all cursor-pointer shadow-md"
            >
              ¡Entendido, gracias!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
