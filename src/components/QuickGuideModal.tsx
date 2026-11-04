import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mic, 
  MapPin, 
  SlidersHorizontal, 
  Trophy, 
  ShieldCheck, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Star,
  Check,
  MessageSquare,
  Lock
} from 'lucide-react';

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuideSlide {
  id: string;
  stepNumber: number;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  previewComponent: React.ReactNode;
  tip: string;
}

export const QuickGuideModal: React.FC<QuickGuideModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const slides: GuideSlide[] = [
    {
      id: 'buscar',
      stepNumber: 1,
      badge: 'Paso 1 • Búsqueda Inteligente',
      badgeColor: 'bg-orange-100 text-[#9e4300] border-orange-200',
      title: 'Buscá por texto o comando de voz',
      description: 'Escribí el oficio que necesitás o tocá el botón del micrófono para dictar con tu voz sin necesidad de tipear.',
      icon: <Search className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-tr from-[#9e4300] to-amber-500',
      tip: 'Podés decir "Plomero en Cerrillos" y la aplicación filtrará automáticamente.',
      previewComponent: (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-300 shadow-2xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-800 flex-1 truncate">
              Plomero urgente
            </span>
            <span className="p-1 rounded-md bg-red-500 text-white animate-pulse flex items-center justify-center">
              <Mic className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Micrófono activo: dictado por voz habilitado</span>
          </div>
        </div>
      )
    },
    {
      id: 'filtrar',
      stepNumber: 2,
      badge: 'Paso 2 • Filtros Rápidos',
      badgeColor: 'bg-blue-100 text-[#001428] border-blue-200',
      title: 'Filtrá por Departamento y Oficio',
      description: 'Elegí tu localidad y el servicio en los selectores desplegables para encontrar prestadores cercanos a tu domicilio.',
      icon: <MapPin className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-tr from-[#001428] to-[#1a3856]',
      tip: 'Tocá "Borrar filtros" cuando quieras restablecer todos los selectores a la vez.',
      previewComponent: (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded-lg border border-amber-300 font-bold text-[#001428] shadow-2xs">
              <span className="text-[9px] text-[#9e4300] block uppercase">Localidad</span>
              📍 Cerrillos
            </div>
            <div className="bg-white p-2 rounded-lg border border-amber-300 font-bold text-[#001428] shadow-2xs">
              <span className="text-[9px] text-[#9e4300] block uppercase">Oficio</span>
              🛠️ Plomería
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
            <span>Resultados precisos</span>
            <span className="text-[#9e4300] font-bold">12 disponibles</span>
          </div>
        </div>
      )
    },
    {
      id: 'destacados',
      stepNumber: 3,
      badge: 'Paso 3 • Confianza Comunitaria',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      title: 'Mirá valoraciones y obras certificadas',
      description: 'Consultá el podio de "Destacados del Mes", calificaciones de vecinos y la galería con fotos de trabajos verificados.',
      icon: <Trophy className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-tr from-amber-600 to-amber-400',
      tip: 'Tocá "Ver Perfil" en cualquier profesional para inspeccionar fotos de obras reales.',
      previewComponent: (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="bg-white rounded-lg p-2.5 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-amber-400 text-[#001428] px-1.5 py-0.5 rounded">
                #1 Oro
              </span>
              <div>
                <span className="text-xs font-bold text-[#001428] block">Roberto Gómez</span>
                <span className="text-[10px] text-slate-500">Albañil y Constructor</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-0.5 text-xs font-bold text-[#9e4300]">
                <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>4.9</span>
              </div>
              <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> 8 certificadas
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contactar',
      stepNumber: 4,
      badge: 'Paso 4 • Chat Privado y Seguro',
      badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      title: 'Comunicación por Chat Privado de la Aplicación',
      description: 'Tu seguridad y tranquilidad son lo más importante: la comunicación se realiza mediante el chat privado directo de la aplicación. Es un canal seguro que guarda todas las conversaciones, acuerdos, presupuestos y detalles de la obra desde el inicio hasta la finalización del trabajo, el pago y la conformidad del cliente, manteniéndose guardado por un período de 30 días posteriores. Chatear por la app garantiza el respaldo de la operación tanto para el vecino como para el trabajador.',
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-tr from-[#001428] via-[#0b2844] to-emerald-600',
      tip: '¿Por qué conviene usar el chat de la app y no WhatsApp? Porque en la app queda constancia certificada de lo pactado, protegiéndote ante cualquier duda o reclamo.',
      previewComponent: (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="bg-white rounded-lg p-2.5 border border-emerald-300 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-[11px] font-bold text-[#001428] flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Chat Privado Directo
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-900 font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Canal Seguro
              </span>
            </div>
            <div className="bg-emerald-50/80 p-2 rounded-lg text-[10px] text-emerald-950 space-y-0.5 border border-emerald-100">
              <span className="font-bold flex items-center gap-1 text-emerald-900">
                <Lock className="w-3 h-3 text-emerald-700" /> Conversaciones y presupuestos respaldados:
              </span>
              <p className="text-[10px] text-emerald-800 leading-snug">
                Se guardan durante todo el trabajo y permanecen archivados 30 días posteriores al pago y conformidad.
              </p>
            </div>
            <div className="w-full py-2 px-3 rounded-lg bg-[#001428] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Chatear por el Canal Seguro</span>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-600 leading-tight">
            Trato directo con el trabajador con garantía y respaldo de tu operación.
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem('oficios_guia_vista', 'true');
    }
    onClose();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) {
      // Swiped left -> next
      handleNext();
    } else if (diff < -50) {
      // Swiped right -> prev
      handlePrev();
    }
    setTouchStartX(null);
  };

  const activeSlide = slides[currentSlide];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={handleFinish}
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-slate-200 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Cabecera del modal */}
        <div className="bg-gradient-to-r from-[#001428] via-[#09223a] to-[#123354] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-400 text-[#001428] flex items-center justify-center font-black text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Guía Rápida de Uso</h3>
              <p className="text-[10px] text-[#d3e4fe]">Oficios y Servicios Valle de Lerma</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Cerrar guía"
            aria-label="Cerrar guía"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido de la diapositiva activa */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {/* Badge del paso */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${activeSlide.badgeColor}`}>
              {activeSlide.badge}
            </span>
            <span className="text-xs font-bold text-slate-400">
              {currentSlide + 1} de {slides.length}
            </span>
          </div>

          {/* Icono y Título */}
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${activeSlide.iconBg}`}>
              {activeSlide.icon}
            </div>
            <div>
              <h4 className="text-base font-extrabold text-[#001428] leading-tight">
                {activeSlide.title}
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {activeSlide.description}
              </p>
            </div>
          </div>

          {/* Componente ilustrativo / Preview */}
          <div className="my-2">
            {activeSlide.previewComponent}
          </div>

          {/* Consejo práctico */}
          <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#9e4300] shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-tight">
              <strong className="font-bold">Consejo:</strong> {activeSlide.tip}
            </p>
          </div>
        </div>

        {/* Indicadores de diapositiva (dots) */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx 
                  ? 'w-6 bg-[#9e4300]' 
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              title={`Ir al paso ${idx + 1}`}
              aria-label={`Paso ${idx + 1}`}
            />
          ))}
        </div>

        {/* Barra inferior de acciones */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                currentSlide === 0 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'text-slate-700 hover:bg-slate-200 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-xl bg-[#001428] hover:bg-[#09223a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span>{currentSlide === slides.length - 1 ? '¡Comenzar!' : 'Siguiente'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Opción de no volver a mostrar */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-200/80">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#9e4300] focus:ring-[#9e4300] accent-[#9e4300] cursor-pointer"
              />
              <span>No volver a mostrar al iniciar</span>
            </label>

            <button
              type="button"
              onClick={handleFinish}
              className="text-[#9e4300] font-bold hover:underline cursor-pointer"
            >
              Saltar guía
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
