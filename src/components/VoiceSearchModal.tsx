import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  AlertCircle, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  Volume2, 
  CheckCircle2, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySearch: (query: string) => void;
  currentQuery?: string;
}

const POPULAR_SEARCH_SUGGESTIONS = [
  { label: 'Plomero', icon: '🔧', desc: 'Destapes, pérdidas y cañerías' },
  { label: 'Electricista', icon: '⚡', desc: 'Instalaciones y cortocircuitos' },
  { label: 'Albañil', icon: '🧱', desc: 'Reformas, pisos y revoques' },
  { label: 'Gasista', icon: '🔥', desc: 'Calefones y termotanques' },
  { label: 'Pintor', icon: '🎨', desc: 'Interior, exterior y rejas' },
  { label: 'Cerrajero', icon: '🔑', desc: 'Aperturas y cambio de llaves' },
  { label: 'Flete', icon: '🚛', desc: 'Mudanzas y traslados' },
  { label: 'Jardinería', icon: '🌿', desc: 'Poda, césped y desmalezado' },
  { label: 'Aire Acondicionado', icon: '❄️', desc: 'Instalación y carga de gas' }
];

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onApplySearch,
  currentQuery = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('Iniciando micrófono...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHttpInsecure, setIsHttpInsecure] = useState(false);
  const [manualText, setManualText] = useState(currentQuery);

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  // Check secure context and browser capability
  useEffect(() => {
    if (!isOpen) return;

    // Reset states
    setTranscript('');
    setErrorMessage(null);
    setManualText(currentQuery);

    // In Chrome & mobile browsers, microphone access is blocked on insecure HTTP (except localhost)
    const isLocalhost = 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    const isSecure = window.isSecureContext || isLocalhost;

    if (!isSecure) {
      setIsHttpInsecure(true);
      setIsListening(false);
      setStatusMessage('Búsqueda rápida por texto o comando');
      return;
    } else {
      setIsHttpInsecure(false);
    }

    startListening();

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const stopListening = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    setIsListening(false);
  };

  const startListening = () => {
    stopListening();
    setErrorMessage(null);
    setTranscript('');

    const SpeechRecognitionClass = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setErrorMessage(
        'El reconocimiento de voz no está disponible en este navegador móvil. Podés elegir uno de los oficios sugeridos abajo.'
      );
      setStatusMessage('Buscador por selección rápida');
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.lang = 'es-AR';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('Te estamos escuchando... Decí el oficio o servicio');
        // Safety timeout: auto stop after 9 seconds if silence
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch {
              // ignore
            }
          }
        }, 9000);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }

        const clean = currentText.trim();
        if (clean) {
          setTranscript(clean);
          setStatusMessage(`Escuchado: "${clean}"`);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition warning:', event.error);
        setIsListening(false);

        if (event.error === 'not-allowed') {
          setErrorMessage(
            'Permiso de micrófono bloqueado. Tocá el icono del candado o configuración de tu navegador y habilitá el Micrófono para este sitio.'
          );
        } else if (event.error === 'no-speech') {
          setErrorMessage('No escuchamos ninguna palabra. Tocá "Reintentar hablar" para probar de nuevo.');
        } else if (event.error === 'network') {
          setErrorMessage(
            'El servicio de voz de Google no pudo conectar. Si estás navegando sin HTTPS, usá los botones de oficios de abajo.'
          );
        } else if (event.error !== 'aborted') {
          setErrorMessage('No pudimos procesar el audio. Podés reintentar o elegir una sugerencia.');
        }
        setStatusMessage('Búsqueda detenida');
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };

      recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition exception caught:', err);
      setIsListening(false);
      setErrorMessage(
        'No se pudo inicializar el micrófono en este dispositivo. Podés usar las opciones rápidas de abajo.'
      );
      setStatusMessage('Búsqueda manual');
    }
  };

  const handleConfirmTranscript = (textToUse?: string) => {
    const finalQuery = (textToUse || transcript || manualText).trim();
    if (finalQuery) {
      stopListening();
      onApplySearch(finalQuery);
      onClose();
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    stopListening();
    onApplySearch(suggestion);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div className="bg-gradient-to-r from-[#001428] via-[#0f2942] to-[#1c3a5e] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-xs ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-400 text-[#001428]'
            }`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Búsqueda por Voz</h3>
              <p className="text-[11px] text-[#d3e4fe]">
                Oficios y Servicios Valle de Lerma
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar búsqueda por voz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo principal del modal */}
        <div className="p-5 flex flex-col items-center text-center space-y-4">
          {/* Advertencia informativa si el sitio está en HTTP no seguro */}
          {isHttpInsecure && (
            <div className="w-full p-3 rounded-2xl bg-amber-50 border border-amber-300 text-left text-xs text-amber-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Navegación sobre HTTP (Sin Certificado SSL)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900">
                Por seguridad, los navegadores (Google Chrome en Android) restringen el micrófono en direcciones HTTP directas. Podés tocar cualquiera de los oficios de abajo para buscar al instante.
              </p>
            </div>
          )}

          {/* Animación del Micrófono y Ondas de Sonido */}
          <div className="relative my-2 flex items-center justify-center">
            {isListening && (
              <>
                <span className="absolute w-28 h-28 rounded-full bg-red-400/20 animate-ping" />
                <span className="absolute w-24 h-24 rounded-full bg-red-400/30 animate-pulse" />
              </>
            )}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white scale-105 ring-4 ring-red-200'
                  : 'bg-gradient-to-tr from-[#9e4300] to-amber-500 hover:from-[#853900] hover:to-amber-400 text-white hover:scale-105 active:scale-95'
              }`}
              title={isListening ? 'Tocá para detener' : 'Tocá para hablar'}
            >
              {isListening ? (
                <Mic className="w-8 h-8 animate-pulse" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Mensaje de estado principal */}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#001428]">
              {statusMessage}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs">
              {isListening 
                ? 'Hablá claro cerca del teléfono. Por ejemplo: "Plomero", "Gasista", "Electricista"'
                : 'Tocá el botón del micrófono para hablar o elegí un oficio de la lista:'}
            </p>
          </div>

          {/* Transcripción en vivo si se escuchó algo */}
          {transcript && (
            <div className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-300 text-emerald-950 text-left space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Voz detectada:
                </span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Listo para buscar
                </span>
              </div>
              <p className="text-base font-extrabold text-emerald-950">
                "{transcript}"
              </p>
              <button
                type="button"
                onClick={() => handleConfirmTranscript(transcript)}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Buscar "{transcript}"</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mensaje de error amigable con botón de reintento */}
          {errorMessage && (
            <div className="w-full p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs text-left space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed flex-1">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={startListening}
                className="w-full py-1.5 px-3 bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reintentar hablar</span>
              </button>
            </div>
          )}

          {/* Buscador manual rápido dentro del modal */}
          <div className="w-full pt-1">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmTranscript(manualText);
              }}
              className="relative w-full"
            >
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="O escribí el oficio o servicio..."
                className="w-full text-xs pl-9 pr-20 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#9e4300] bg-slate-50 text-slate-900 font-semibold"
              />
              <button
                type="submit"
                disabled={!manualText.trim()}
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-[#001428] hover:bg-[#0f2942] disabled:opacity-40 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Sugerencias rápidas de 1 toque */}
          <div className="w-full space-y-2 pt-2 border-t border-slate-100 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Oficios más buscados en el Valle de Lerma:
            </span>

            <div className="grid grid-cols-3 gap-1.5">
              {POPULAR_SEARCH_SUGGESTIONS.map((sug) => (
                <button
                  key={sug.label}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug.label)}
                  className="p-2 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/70 active:scale-95 transition-all text-left flex flex-col justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{sug.icon}</span>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-[#9e4300] truncate">
                      {sug.label}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                    {sug.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] text-slate-500">
            Cerrillos • La Merced • El Carril • Rosario de Lerma
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-300 cursor-pointer text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
