import React, { useState } from 'react';
import { 
  BookOpen, 
  User, 
  ShieldCheck, 
  Briefcase, 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  AlertTriangle, 
  MessageSquare, 
  Camera, 
  Search, 
  MapPin, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Award, 
  ChevronRight,
  PhoneCall,
  Smartphone,
  Eye,
  FileText
} from 'lucide-react';

interface ManualesYGuionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'guion_prestador' | 'guion_admin' | 'manual_vecino' | 'manual_prestador' | 'manual_admin';
}

export const ManualesYGuionesModal: React.FC<ManualesYGuionesModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'guion_prestador'
}) => {
  const [activeTab, setActiveTab] = useState<'guion_prestador' | 'guion_admin' | 'manual_vecino' | 'manual_prestador' | 'manual_admin'>(defaultTab);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#001428] via-[#0b2540] to-[#122e4d] text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9e4300] to-amber-500 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>Guiones y Manuales Ilustrados Oficiales</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                  Valle de Lerma
                </span>
              </h2>
              <p className="text-xs text-blue-200">
                Material completo de capacitación, presentación institucional y manuales de usuario
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-semibold"
              title="Imprimir documento actual"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto no-scrollbar px-3 pt-2 gap-1.5 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('guion_prestador')}
            className={`px-3 py-2 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'guion_prestador'
                ? 'bg-white text-[#9e4300] border-[#9e4300] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Guión para Prestadores</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guion_admin')}
            className={`px-3 py-2 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'guion_admin'
                ? 'bg-white text-blue-900 border-blue-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Guión para el Administrador</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual_vecino')}
            className={`px-3 py-2 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'manual_vecino'
                ? 'bg-white text-emerald-800 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Manual del Vecino</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual_prestador')}
            className={`px-3 py-2 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'manual_prestador'
                ? 'bg-white text-amber-800 border-amber-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Manual del Prestador</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual_admin')}
            className={`px-3 py-2 rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
              activeTab === 'manual_admin'
                ? 'bg-white text-purple-900 border-purple-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Manual del Administrador</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800 leading-relaxed text-sm">
          
          {/* ========================================================================= */}
          {/* 1. GUIÓN PARA PRESTADORES */}
          {/* ========================================================================= */}
          {activeTab === 'guion_prestador' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-orange-50 border border-orange-200 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#9e4300] bg-orange-200/80 px-2 py-0.5 rounded">
                    Pitch de Capacitación y Adhesión
                  </span>
                  <h3 className="text-base font-black text-[#001428] mt-1">
                    Guión para Hablar y Presentar la App al Prestador de Oficios
                  </h3>
                  <p className="text-xs text-[#5a5f67]">
                    Orientado a albañiles, plomeros, electricistas, gasistas, herreros y técnicos del Valle de Lerma
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(guionPrestadorTexto, 'guion_prestador')}
                  className="px-3.5 py-2 rounded-xl bg-[#9e4300] hover:bg-[#783100] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                >
                  {copiedSection === 'guion_prestador' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSection === 'guion_prestador' ? '¡Copiado!' : 'Copiar Guión Completo'}</span>
                </button>
              </div>

              {/* Guión estructurado en bloques de conversación */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-700 uppercase">
                    <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">1</span>
                    <span>Apertura y Empatía (Romper el Hielo)</span>
                  </div>
                  <blockquote className="italic text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-amber-500 text-xs sm:text-sm">
                    "Hola maestro, ¿cómo le va? Sé que en este momento conseguir trabajos constantes en el Valle de Lerma depende mucho del boca en boca, de poner carteles que se rompen o de pelear en grupos de Facebook donde cualquiera regala precios o no sabe trabajar bien. Queremos presentarte <strong>Oficios y Servicios Valle de Lerma</strong>, la primera herramienta oficial creada específicamente para que los buenos trabajadores de acá consigan clientes directos, cobren lo justo y hagan valer su experiencia."
                  </blockquote>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-700 uppercase">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">2</span>
                    <span>El Beneficio Concreto: Prueba Gratuita y Clientes Reales</span>
                  </div>
                  <blockquote className="italic text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-emerald-500 text-xs sm:text-sm">
                    "Al registrarte hoy, tenés <strong>30 días de prueba completamente gratis</strong>. Sin poner tarjeta, sin trampas. Vas a aparecer visible para todos los vecinos de Cerrillos, La Merced, Rosario de Lerma, El Carril, Campo Quijano y San Agustín que entran a buscar servicios todos los días. Los pedidos te llegan directo a tu bandeja: podés presupuestar en pesos desde el celular en 10 segundos."
                  </blockquote>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-blue-700 uppercase">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">3</span>
                    <span>Verificación de Identidad con DNI: Tu Mejor Carta de Presentación</span>
                  </div>
                  <blockquote className="italic text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-blue-500 text-xs sm:text-sm">
                    "Para proteger a los trabajadores de verdad, el sistema valida tu foto en vivo y la foto de tu DNI con un sensor inteligente de nitidez. Cuando el administrador aprueba tu cuenta, ganás la insignia oficial de <strong>'Identidad Verificada Oficialmente'</strong>. Un vecino entre alguien desconocido y alguien con identidad respaldada, siempre te va a elegir a vos."
                  </blockquote>
                  <div className="flex items-center gap-3 pt-2">
                    <img 
                      src="/assets/aistudio/image_a01dbbb1.png" 
                      alt="Verificación DNI" 
                      className="w-full max-w-xs rounded-xl border border-slate-200 shadow-2xs object-cover"
                    />
                    <p className="text-xs text-slate-500">
                      Insignia oficial otorgada por Jorge Lopez tras validar la nitidez e iluminación del documento.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-indigo-700 uppercase">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">4</span>
                    <span>Por Qué Usar el Chat Privado Seguro y NO WhatsApp Externo</span>
                  </div>
                  <blockquote className="italic text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-indigo-500 text-xs sm:text-sm">
                    "Muchos nos preguntan: '¿por qué no me pasás el WhatsApp directo y listo?'. La respuesta es seguridad para vos: <strong>en WhatsApp los mensajes se borran, se editan y nadie puede certificar lo pactado si un cliente después no te quiere pagar</strong>. En cambio, nuestro Chat Oficial guarda todas las conversaciones y fotos de presupuesto de manera inalterable durante toda la obra y por 30 días posteriores. Si surge cualquier duda o reclamo, la administración audita el chat y protege tu cobro y tu reputación."
                  </blockquote>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-orange-700 uppercase">
                    <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs">5</span>
                    <span>Fotos de Avance de Obra en Vivo y Cobro Garantizado</span>
                  </div>
                  <blockquote className="italic text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-orange-500 text-xs sm:text-sm">
                    "Cuando el vecino te contrata, subís una foto de avance con la cámara de tu celular. El sistema certifica que es una foto real tomada en el momento, impidiendo fotos viejas. Si una obra pasa más de 15 días, el sistema te recuerda subir una foto para mantener todo al día. Al terminar, marcás 'Cobro Recibido' y ese trabajo se suma automáticamente como foto de obra a tu currículum digital. ¡Te esperamos en la red de prestadores del Valle!"
                  </blockquote>
                  <div className="pt-2">
                    <img 
                      src="/assets/aistudio/image_7d1e7d05.png" 
                      alt="Trabajos asignados y avances" 
                      className="w-full max-w-sm rounded-xl border border-slate-200 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. GUIÓN PARA EL ADMINISTRADOR */}
          {/* ========================================================================= */}
          {activeTab === 'guion_admin' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-200/80 px-2 py-0.5 rounded">
                    Pitch Institucional y Gubernamental
                  </span>
                  <h3 className="text-base font-black text-[#001428] mt-1">
                    Guión para Presentación del Panel de Control y Auditoría
                  </h3>
                  <p className="text-xs text-[#5a5f67]">
                    Para exponer ante municipios, cámaras de comercio, cooperativas, inversores y vecinos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(guionAdminTexto, 'guion_admin')}
                  className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                >
                  {copiedSection === 'guion_admin' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSection === 'guion_admin' ? '¡Copiado!' : 'Copiar Guión Completo'}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-blue-900 uppercase">
                    <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">1</span>
                    <span>El Propósito Social e Institucional</span>
                  </div>
                  <blockquote className="italic text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-blue-600 text-xs sm:text-sm">
                    "Buenas tardes a todos. Durante años, la contratación de oficios en el Valle de Lerma estuvo signada por la informalidad, la incertidumbre en los presupuestos y la indefensión ante obras abandonadas o estafas. Hoy presentamos <strong>Oficios y Servicios Valle de Lerma</strong>, un ecosistema digital que dignifica el trabajo de nuestros artesanos y técnicos, brindando al mismo tiempo una garantía de seguridad sin precedentes para nuestras familias."
                  </blockquote>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-indigo-900 uppercase">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs">2</span>
                    <span>Auditoría Pericial e Identificación Forense</span>
                  </div>
                  <blockquote className="italic text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-indigo-600 text-xs sm:text-sm">
                    "A diferencia de las redes sociales abiertas, cada dispositivo que accede a nuestra plataforma queda registrado con una huella forense inalterable: su identificador de dispositivo único, dirección de acceso y fecha de visita. Esto nos permite generar un <strong>Informe Pericial Oficial en PDF</strong> con un solo clic en caso de litigios o controversias, desincentivando cualquier intento de fraude desde el primer instante."
                  </blockquote>
                  <div className="pt-2">
                    <img 
                      src="/assets/aistudio/image_dacf010e.png" 
                      alt="Identificador de dispositivo y footer de versión" 
                      className="w-full max-w-sm rounded-xl border border-slate-200 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-900 uppercase">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">3</span>
                    <span>Monitoreo de Trabajos Estancados y Alertas Preventivas (+7 y +15 días)</span>
                  </div>
                  <blockquote className="italic text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-emerald-600 text-xs sm:text-sm">
                    "No esperamos a que el vecino tenga que quejarse. Nuestro motor de analítica supervisa en segundo plano el estado de cada contratación. A los 7 días sin movimiento emite una alerta de <strong>'Atención Necesaria'</strong> para priorizar el servicio. Y si una obra contratada supera los <strong>15 días sin reporte</strong>, el sistema bloquea fotos de archivo y le exige al profesional subir una foto certificada tomada en tiempo real con su cámara. De esta manera prevenimos el estancamiento antes de que se transforme en conflicto."
                  </blockquote>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black text-purple-900 uppercase">
                    <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs">4</span>
                    <span>Analítica Visual con Recharts: Medición del Impacto Económico Local</span>
                  </div>
                  <blockquote className="italic text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-purple-600 text-xs sm:text-sm">
                    "Desde nuestro Panel de Administrador, visualizamos en tiempo real con curvas interactivas Recharts la evolución mensual de solicitudes creadas versus contrataciones concretadas. Sabemos qué localidad demanda más plomería, qué rubro necesita más capacitación y cuál es la tasa de retención de nuestros prestadores tras sus 30 días de prueba. Con Oficios y Servicios Valle de Lerma, transformamos la informalidad en confianza y cuidamos a nuestra comunidad. Muchas gracias."
                  </blockquote>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. MANUAL PARA EL VECINO */}
          {/* ========================================================================= */}
          {activeTab === 'manual_vecino' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded">
                    Guía Práctica Ilustrada
                  </span>
                  <h3 className="text-base font-black text-[#001428] mt-1">
                    Manual de Uso para el Vecino del Valle de Lerma
                  </h3>
                  <p className="text-xs text-[#5a5f67]">
                    Aprendé a buscar profesionales confiables, cotizar sin cargo y seguir tu obra de punta a punta
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(manualVecinoTexto, 'manual_vecino')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                >
                  {copiedSection === 'manual_vecino' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSection === 'manual_vecino' ? '¡Copiado!' : 'Copiar Manual'}</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Paso 1 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                      1
                    </span>
                    <h4 className="font-black text-sm text-[#001428]">
                      Búsqueda Inteligente (Texto o Dictado por Voz)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Ingresá a la pantalla de <strong>Explorar</strong>. Podés escribir el oficio en la barra de búsqueda o tocar el ícono del micrófono rojo para dictar por voz sin tener que tipear: por ejemplo <em>"Gasista matriculado en Cerrillos"</em>.
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-800">Plomero en Cerrillos</span>
                    <span className="ml-auto px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                      Micrófono activo
                    </span>
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                      2
                    </span>
                    <h4 className="font-black text-sm text-[#001428]">
                      Elegí tu Localidad y Compará Prestadores Verificados
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Filtrá por tu barrio o municipio (Cerrillos, Rosario de Lerma, La Merced, El Carril, Campo Quijano, Chicoana, Vaqueros, etc.). Buscá siempre los perfiles con la insignia verde <strong>"Identidad Verificada Oficialmente"</strong> y <strong>"Matriculado"</strong>.
                  </p>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Insignia Oficial de Confianza: DNI revisado por el Administrador</span>
                  </div>
                </div>

                {/* Paso 3 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                      3
                    </span>
                    <h4 className="font-black text-sm text-[#001428]">
                      Pedí Presupuesto Sin Cargo y Usá el Chat Privado Seguro
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tocá en <strong>"Pedir Presupuesto"</strong> en la ficha del prestador o creá una nueva solicitud abierta. Los prestadores te enviarán sus cotizaciones con el monto estimado en pesos ($ ARS).
                  </p>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ¿Por qué hablar por el Chat de la App y no por WhatsApp?
                    </p>
                    <p className="text-[11px] text-amber-900/90 leading-normal">
                      El Chat Privado de la app conserva todas las conversaciones y fotos durante la obra y hasta 30 días posteriores. Si el profesional no cumple o hay desacuerdos en el precio, el administrador audita el chat oficial para darte una solución justa y respaldada.
                    </p>
                  </div>
                </div>

                {/* Paso 4 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
                      4
                    </span>
                    <h4 className="font-black text-sm text-[#001428]">
                      Aprobá el Presupuesto y Seguí la Obra con Fotos Certificadas
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Al aceptar la cotización, se genera tu Contrato Digital (ej: <code>#ORD-VALLE-2026-03</code>). Podrás ver las fotos reales de avance que el trabajador toma con su cámara. Al concluir, calificá su atención con estrellas para premiar a los buenos trabajadores del Valle.
                  </p>
                  <img 
                    src="/assets/aistudio/image_7d1e7d05.png" 
                    alt="Contrato y fotos de avance" 
                    className="w-full max-w-sm rounded-xl border border-slate-200 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. MANUAL PARA EL PRESTADOR */}
          {/* ========================================================================= */}
          {activeTab === 'manual_prestador' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                    Guía Operativa del Trabajador
                  </span>
                  <h3 className="text-base font-black text-[#001428] mt-1">
                    Manual de Uso para el Prestador de Oficios
                  </h3>
                  <p className="text-xs text-[#5a5f67]">
                    Paso a paso para registrarte, verificar tu identidad, cotizar y certificar tus trabajos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(manualPrestadorTexto, 'manual_prestador')}
                  className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                >
                  {copiedSection === 'manual_prestador' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSection === 'manual_prestador' ? '¡Copiado!' : 'Copiar Manual'}</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Paso 1 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black flex items-center justify-center text-xs">
                      1
                    </span>
                    <h4 className="font-black text-sm text-[#001428]">
                      Registro en Vivo con Validación de Cámara y Ubicación
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Al crear tu perfil de prestador, el sistema te solicitará permiso de ubicación para sugerir tu localidad dentro del Valle de Lerma y te pedirá tomar una <strong>foto facial en vivo</strong>. El sistema valida que sea tomada en tiempo real impidiendo la carga de archivos viejos de galería.
                  </p>
                </div>

                {/* Paso 2 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black flex items-center justify-center text-xs">
                      2
                    </span>
                    <h4 className="font-black text-sm text-[#001428]">
                      Subida de DNI con Verificación de Nitidez e Iluminación
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Para obtener la insignia de identidad verificada, subí una foto de tu DNI. El detector visual automático analizará si la foto es legible o si tiene poca luz o movimiento antes de enviarla a la aprobación del administrador Jorge Lopez.
                  </p>
                  <img 
                    src="/assets/aistudio/image_a01dbbb1.png" 
                    alt="Verificación DNI y nitidez" 
                    className="w-full max-w-sm rounded-xl border border-slate-200 shadow-2xs"
                  />
                </div>

                {/* Paso 3 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black flex items-center justify-center text-xs">
                      3
                    </span>
                    <h4 className="font-black text-sm text-[#001428]">
                      Bandeja de Trabajos y Alertas de "Atención Necesaria" (+7 días)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    En la pestaña <strong>Solicitudes</strong> verás los pedidos de vecinos correspondientes a tu oficio. Cada solicitud incluye el detalle y barrio del vecino.
                  </p>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Indicador de Atención Necesaria (+7 días)
                    </p>
                    <p className="text-[11px] text-amber-900/90">
                      Si un trabajo no cambia de estado en más de 7 días, se resalta en ámbar para avisarte que debes responder, enviar presupuesto o consultar dudas por chat seguro antes de que el vecino busque otro profesional.
                    </p>
                  </div>
                  <img 
                    src="/assets/aistudio/image_bfabaf73.png" 
                    alt="Bandeja de trabajos" 
                    className="w-full max-w-sm rounded-xl border border-slate-200 shadow-2xs"
                  />
                </div>

                {/* Paso 4 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-black flex items-center justify-center text-xs">
                      4
                    </span>
                    <h4 className="font-black text-sm text-[#001428]">
                      Obras Asignadas: Fotos con Cámara Obligatoria y Cobro Recibido
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    En la sección <strong>"Asignados"</strong> verás los trabajos donde el vecino aceptó tu presupuesto:
                  </p>
                  <ul className="text-xs text-slate-700 space-y-2 list-disc pl-5">
                    <li>
                      <strong>Subir Foto Certificada:</strong> Sacá una foto del trabajo terminado o en progreso con la cámara. Esto alimenta tu reputación pública y te protege contra falsos reclamos.
                    </li>
                    <li>
                      <strong>Alerta de 15 días:</strong> Si una obra supera los 15 días en curso, el sistema exige obligatoriamente sacar la foto en vivo con la cámara, bloqueando fotos de galería.
                    </li>
                    <li>
                      <strong>Marcar Pago Recibido:</strong> Al cobrar el monto pactado, presioná <em>"Marcar Pago Recibido"</em> para cerrar el ciclo del contrato de manera formal.
                    </li>
                  </ul>
                  <img 
                    src="/assets/aistudio/image_7d1e7d05.png" 
                    alt="Trabajos asignados" 
                    className="w-full max-w-sm rounded-xl border border-slate-200 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. MANUAL PARA EL ADMINISTRADOR */}
          {/* ========================================================================= */}
          {activeTab === 'manual_admin' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50 border border-purple-200 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 bg-purple-200 px-2 py-0.5 rounded">
                    Manual de Gestión, Auditoría y Mediación
                  </span>
                  <h3 className="text-base font-black text-[#001428] mt-1">
                    Manual del Panel de Administrador (Jorge Lopez / Daniel Dohrman)
                  </h3>
                  <p className="text-xs text-[#5a5f67]">
                    Procedimientos de auditoría pericial, monitoreo de inactividad, analítica Recharts y mediación
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(manualAdminTexto, 'manual_admin')}
                  className="px-3.5 py-2 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                >
                  {copiedSection === 'manual_admin' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSection === 'manual_admin' ? '¡Copiado!' : 'Copiar Manual'}</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Paso 1 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-700 text-white font-black flex items-center justify-center text-xs">
                      1
                    </span>
                    <h4 className="font-black text-sm text-[#001428]">
                      Acceso Secreto al Panel Administrador (5 Clics en el Logo)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Para preservar la sobriedad visual y la seguridad, el botón de acceso administrador no está expuesto a la vista de los usuarios comunes. Para ingresar:
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
                    <span>Hacé 5 clics rápidos consecutivos sobre el logo del escudo en el encabezado o en el pie de página para abrir el acceso de Jorge Lopez / Daniel Dohrman.</span>
                  </div>
                </div>

                {/* Paso 2 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-700 text-white font-black flex items-center justify-center text-xs">
                      2
                    </span>
                    <h4 className="font-black text-sm text-[#001428]">
                      Interpretación del Gráfico Recharts y Métricas de Demanda
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    En la sección <strong>Estadísticas Generales</strong>, revisá la tarjeta de <strong>Evolución Mensual: Solicitudes y Contrataciones</strong> impulsada por Recharts:
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-5">
                    <li><strong>Curva Azul:</strong> Nuevas solicitudes y pedidos de cotización emitidos por los vecinos del Valle de Lerma.</li>
                    <li><strong>Curva Verde:</strong> Contrataciones efectivas donde el vecino confirmó al trabajador.</li>
                    <li><strong>Filtro de métricas:</strong> Podés aislar solo solicitudes, solo contrataciones o ver ambas comparadas.</li>
                    <li><strong>Efectividad (%):</strong> Muestra la tasa de conversión global del sistema en el período analizado.</li>
                  </ul>
                </div>

                {/* Paso 3 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-700 text-white font-black flex items-center justify-center text-xs">
                      3
                    </span>
                    <h4 className="font-black text-sm text-[#001428]">
                      Aprobación de Prestadores y Control de Legibilidad de DNI
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    En la pestaña de <strong>Prestadores</strong>, filtrá por <em>"Pendientes de Aprobación"</em>:
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-5">
                    <li>Revisá la foto del DNI con el indicador automático de nitidez y brillo. Si la imagen es borrosa, el sistema te lo notifica para solicitar reenvío.</li>
                    <li>Verificá la matrícula o certificado profesional si el rubro lo requiere (ej: electricistas, gasistas).</li>
                    <li>Presioná <strong>"Aprobar Prestador"</strong> para otorgar la insignia verde o rechazá indicando el motivo por chat.</li>
                  </ul>
                  <img 
                    src="/assets/aistudio/image_a01dbbb1.png" 
                    alt="Aprobación de DNI" 
                    className="w-full max-w-sm rounded-xl border border-slate-200 shadow-2xs"
                  />
                </div>

                {/* Paso 4 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-700 text-white font-black flex items-center justify-center text-xs">
                      4
                    </span>
                    <h4 className="font-black text-sm text-[#001428]">
                      Auditoría Pericial por Dispositivo y Resguardo de Chats (30 Días)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    En caso de un reclamo o desacuerdo:
                  </p>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-5">
                    <li>Ingresá en <strong>"Auditoría Pericial por Dispositivo"</strong> para ver el historial inalterable de aperturas, IP y solicitudes vinculadas a ese teléfono.</li>
                    <li>Consultá el <strong>Registro Inalterable de Chats de Seguridad</strong>: los mensajes se preservan durante toda la obra y hasta 30 días posteriores, garantizando evidencia pericial fehaciente.</li>
                    <li>Descargá el <strong>Reporte de Auditoría en PDF</strong> o el <strong>Reporte Mensual de Contrataciones</strong> con los botones de acción rápida de la cabecera.</li>
                  </ul>
                  <img 
                    src="/assets/aistudio/image_dacf010e.png" 
                    alt="Auditoría pericial por dispositivo" 
                    className="w-full max-w-sm rounded-xl border border-slate-200 shadow-2xs"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="font-semibold">Oficios y Servicios Valle de Lerma • Material Oficial para Toda la Comunidad</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#001428] hover:bg-[#09223a] text-white font-bold rounded-lg cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};

// =========================================================================
// TEXTOS COMPLETOS PARA COPIAR CON 1 CLIC
// =========================================================================

const guionPrestadorTexto = `🎤 GUIÓN OFICIAL PARA PRESENTAR LA APLICACIÓN AL PRESTADOR DE OFICIOS
Valle de Lerma (Cerrillos, Rosario de Lerma, La Merced, El Carril, Campo Quijano, San Agustín, Chicoana)

1. APERTURA Y ROMPER EL HIELO:
"Hola maestro, ¿cómo le va? Sé que en este momento conseguir trabajos constantes en el Valle de Lerma depende mucho del boca en boca, de poner carteles que se rompen o de pelear en grupos de Facebook donde cualquiera regala precios o no sabe trabajar bien. Queremos presentarte Oficios y Servicios Valle de Lerma, la primera herramienta oficial creada específicamente para que los buenos trabajadores de acá consigan clientes directos, cobren lo justo y hagan valer su experiencia."

2. EL BENEFICIO CONCRETO:
"Al registrarte hoy, tenés 30 días de prueba completamente gratis. Sin poner tarjeta, sin trampas. Vas a aparecer visible para todos los vecinos de Cerrillos, La Merced, Rosario de Lerma, El Carril, Campo Quijano y San Agustín que entran a buscar servicios todos los días. Los pedidos te llegan directo a tu bandeja: podés presupuestar en pesos desde el celular en 10 segundos."

3. IDENTIDAD VERIFICADA OFICIALMENTE:
"Para proteger a los trabajadores de verdad, el sistema valida tu foto en vivo y la foto de tu DNI con un sensor inteligente de nitidez. Cuando el administrador aprueba tu cuenta, ganás la insignia oficial de 'Identidad Verificada Oficialmente'. Un vecino entre alguien desconocido y alguien con identidad respaldada, siempre te va a elegir a vos."

4. POR QUÉ USAR EL CHAT PRIVADO SEGURO Y NO WHATSAPP:
"Muchos nos preguntan: '¿por qué no me pasás el WhatsApp directo y listo?'. La respuesta es seguridad para vos: en WhatsApp los mensajes se borran, se editan y nadie puede certificar lo pactado si un cliente después no te quiere pagar. En cambio, nuestro Chat Oficial guarda todas las conversaciones y fotos de presupuesto de manera inalterable durante toda la obra y por 30 días posteriores. Si surge cualquier duda o reclamo, la administración audita el chat y protege tu cobro y tu reputación."

5. FOTOS DE AVANCE EN VIVO Y COBRO:
"Cuando el vecino te contrata, subís una foto de avance con la cámara de tu celular. El sistema certifica que es una foto real tomada en el momento, impidiendo fotos viejas. Si una obra pasa más de 15 días, el sistema te recuerda subir una foto para mantener todo al día. Al terminar, marcás 'Cobro Recibido' y ese trabajo se suma automáticamente como foto de obra a tu currículum digital. ¡Te esperamos en la red de prestadores del Valle!"`;

const guionAdminTexto = `🏛️ GUIÓN OFICIAL PARA EL ADMINISTRADOR (PRESENTACIÓN INSTITUCIONAL)
Oficios y Servicios Valle de Lerma

1. PROPÓSITO SOCIAL:
"Buenas tardes a todos. Durante años, la contratación de oficios en el Valle de Lerma estuvo signada por la informalidad, la incertidumbre en los presupuestos y la indefensión ante obras abandonadas o estafas. Hoy presentamos Oficios y Servicios Valle de Lerma, un ecosistema digital que dignifica el trabajo de nuestros artesanos y técnicos, brindando al mismo tiempo una garantía de seguridad sin precedentes para nuestras familias."

2. AUDITORÍA PERICIAL E IDENTIFICACIÓN FORENSE:
"A diferencia de las redes sociales abiertas, cada dispositivo que accede a nuestra plataforma queda registrado con una huella forense inalterable: su identificador de dispositivo único, dirección de acceso y fecha de visita. Esto nos permite generar un Informe Pericial Oficial en PDF con un solo clic en caso de litigios o controversias, desincentivando cualquier intento de fraude desde el primer instante."

3. MONITOREO PREVENTIVO DE TRABAJOS ESTANCADOS (+7 Y +15 DÍAS):
"No esperamos a que el vecino tenga que quejarse. Nuestro motor de analítica supervisa en segundo plano el estado de cada contratación. A los 7 días sin movimiento emite una alerta de 'Atención Necesaria' para priorizar el servicio. Y si una obra contratada supera los 15 días sin reporte, el sistema bloquea fotos de archivo y le exige al profesional subir una foto certificada tomada en tiempo real con su cámara. De esta manera prevenimos el estancamiento antes de que se transforme en conflicto."

4. ANALÍTICA VISUAL CON RECHARTS Y MEDIACIÓN:
"Desde nuestro Panel de Administrador, visualizamos en tiempo real con curvas interactivas Recharts la evolución mensual de solicitudes creadas versus contrataciones concretadas. Sabemos qué localidad demanda más plomería, qué rubro necesita más capacitación y cuál es la tasa de retención de nuestros prestadores tras sus 30 días de prueba. Ante cualquier reporte, auditamos el historial inalterable del chat (preservado 30 días) y resolvemos con justicia. Con Oficios y Servicios Valle de Lerma, transformamos la informalidad en confianza y cuidamos a nuestra comunidad. Muchas gracias."`;

const manualVecinoTexto = `📖 MANUAL DE USO PARA EL VECINO DEL VALLE DE LERMA

PASO 1: BÚSQUEDA INTELIGENTE
- Ingresá en "Explorar".
- Escribí el oficio o tocá el micrófono rojo para dictar por voz (ej: "Gasista matriculado en Cerrillos").

PASO 2: ELEGÍ TU LOCALIDAD Y VERIFICACIÓN
- Filtrá por tu municipio: Cerrillos, Rosario de Lerma, La Merced, El Carril, Campo Quijano, San Agustín, etc.
- Buscá siempre prestadores con la insignia verde de "Identidad Verificada Oficialmente".

PASO 3: PEDÍ PRESUPUESTO Y HABLA POR EL CHAT SEGURO
- Tocá "Pedir Presupuesto".
- Recibirás cotizaciones en pesos ($ ARS).
- Hablá únicamente por el Chat Oficial de la app: los mensajes se guardan de forma inalterable durante la obra y por 30 días posteriores como garantía pericial para protegerte.

PASO 4: SEGUIMIENTO DE OBRA Y CALIFICACIÓN
- Tras confirmar la contratación se genera tu Contrato Digital (#ORD-VALLE-2026-XX).
- Verás las fotos de avance certificadas tomadas con la cámara por el trabajador.
- Al finalizar, calificá el servicio con estrellas para guiar a otros vecinos.`;

const manualPrestadorTexto = `👷 MANUAL DE USO PARA EL PRESTADOR DE OFICIOS

PASO 1: REGISTRO EN VIVO Y UBICACIÓN
- Otorgá permiso de ubicación para situarte en tu localidad del Valle de Lerma.
- Tomate una foto en vivo con la cámara (no se permiten fotos viejas de galería).

PASO 2: VERIFICACIÓN DE DNI Y NITIDEZ
- Subí foto de tu DNI. El detector visual analiza nitidez e iluminación.
- El administrador Jorge Lopez revisará y aprobará tu insignia oficial de confianza.

PASO 3: BANDEJA DE TRABAJOS Y ALERTAS DE 7 DÍAS
- Revisá las solicitudes de vecinos de tu rubro en la pestaña "Solicitudes".
- Cotizá rápido en Pesos Argentinos ($ ARS).
- Si un pedido tiene más de 7 días sin respuesta, el sistema te lo destaca como "Atención Necesaria" para que no pierdas la oportunidad.

PASO 4: OBRAS ASIGNADAS Y COBRO
- En "Asignados", subí fotos de avance tomadas en vivo con tu cámara.
- Si una obra supera los 15 días, el sistema exige foto obligatoria en vivo con la cámara para mantener la confianza del cliente.
- Al cobrar, presioná "Marcar Pago Recibido" para registrar el cierre exitoso del contrato.`;

const manualAdminTexto = `⚙️ MANUAL PARA EL ADMINISTRADOR (PANEL DE CONTROL Y AUDITORÍA)

PASO 1: ACCESO SEGURO
- Hacé 5 clics consecutivos en el escudo/logo del encabezado o pie de página para abrir el panel de control.

PASO 2: TABLERO ESTADÍSTICO RECHARTS
- En "Estadísticas", analizá la evolución mensual de solicitudes vs contrataciones.
- Alterná entre "Ambas", "Solicitudes" o "Contrataciones" para medir la efectividad en el Valle de Lerma.

PASO 3: APROBACIÓN DE PRESTADORES
- En "Prestadores", filtrá los pendientes.
- Verificá la legibilidad del DNI, fotos faciales y certificados de matrícula.
- Aprobá o rechazá con feedback inmediato.

PASO 4: AUDITORÍA PERICIAL Y REPORTES PDF
- Consultá el registro forense por identificador de dispositivo.
- Auditá chats inalterables guardados por 30 días para resolver reclamos.
- Descargá el "Reporte Pericial en PDF" o "Reporte Mensual de Contrataciones" con 1 clic.`;
