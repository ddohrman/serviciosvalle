import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  MessageCircle, 
  Clock, 
  Award, 
  Heart, 
  Check, 
  Share2, 
  Wrench,
  Send,
  Plus,
  Image as ImageIcon,
  MessageSquare,
  Upload,
  Calendar,
  Lock,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  FileCheck,
  Tag,
  ZoomIn,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Professional, CompletedJob, ServiceRequest } from '../types';
import { NEIGHBORHOODS } from '../data/mockData';

interface WorkerDetailModalProps {
  worker: Professional | null;
  onClose: () => void;
  onContactWhatsApp: (worker: Professional, defaultMessage?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onRequestQuote: (worker: Professional, jobDesc: string) => void;
  onAddCompletedJob?: (workerId: string, job: CompletedJob) => void;
  requests?: ServiceRequest[];
  onUploadJobPhotoForRequest?: (serviceRequestId: string, imageUrl: string, comment?: string) => void;
  onSimulateContract?: (worker: Professional) => void;
  onNavigateToSolicitudes?: () => void;
}

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  worker,
  onClose,
  onContactWhatsApp,
  isFavorite,
  onToggleFavorite,
  onRequestQuote,
  onAddCompletedJob,
  requests = [],
  onUploadJobPhotoForRequest,
  onSimulateContract,
  onNavigateToSolicitudes
}) => {
  const [activeTab, setActiveTab] = useState<'servicios' | 'trabajos' | 'opiniones'>('servicios');
  const [quickQuoteText, setQuickQuoteText] = useState('');
  const [quoteSent, setQuoteSent] = useState(false);

  // Filter requests that are contracted or quoted for this worker
  const contractedRequests = requests.filter(
    r => (r.assignedWorkerId === worker?.id || r.quotedBy === worker?.name) &&
         (r.status === 'contratado' || r.status === 'completado' || r.status === 'cotizado')
  );

  // State for adding a new completed job
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [selectedContractRequestId, setSelectedContractRequestId] = useState<string>(
    contractedRequests[0]?.id || ''
  );
  const [newJobComment, setNewJobComment] = useState('');
  const [newJobImageUrl, setNewJobImageUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Lightbox / Zoom modal state for Completed Jobs Gallery
  const [selectedJobIndex, setSelectedJobIndex] = useState<number | null>(null);

  const selectedJobForLightbox = selectedJobIndex !== null && worker?.completedJobs?.[selectedJobIndex]
    ? worker.completedJobs[selectedJobIndex]
    : null;

  const handleOpenLightbox = (index: number) => {
    setSelectedJobIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedJobIndex(null);
  };

  const handleNextJob = () => {
    if (selectedJobIndex === null || !worker?.completedJobs?.length) return;
    setSelectedJobIndex((selectedJobIndex + 1) % worker.completedJobs.length);
  };

  const handlePrevJob = () => {
    if (selectedJobIndex === null || !worker?.completedJobs?.length) return;
    setSelectedJobIndex((selectedJobIndex - 1 + worker.completedJobs.length) % worker.completedJobs.length);
  };

  useEffect(() => {
    if (selectedJobIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowRight') handleNextJob();
      if (e.key === 'ArrowLeft') handlePrevJob();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedJobIndex, worker?.completedJobs?.length]);

  if (!worker) return null;

  // Selected contracted service details
  const selectedContract = contractedRequests.find(r => r.id === selectedContractRequestId) || contractedRequests[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPhoto(true);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setNewJobImageUrl(uploadEvent.target?.result as string);
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    const finalImage = newJobImageUrl.trim() || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80';

    if (onUploadJobPhotoForRequest) {
      onUploadJobPhotoForRequest(selectedContract.id, finalImage, newJobComment.trim() || undefined);
    } else if (onAddCompletedJob) {
      const newJob: CompletedJob = {
        id: `job-${Date.now()}`,
        serviceRequestId: selectedContract.id,
        contractNumber: selectedContract.contractNumber || `ORD-VALLE-2026-${selectedContract.id.replace('req-', '')}`,
        clientName: selectedContract.clientName || 'Vecino del Valle',
        title: selectedContract.title,
        imageUrl: finalImage,
        neighborhood: selectedContract.neighborhood,
        date: 'Hoy',
        comment: newJobComment.trim() || undefined,
        verifiedByApp: true
      };
      onAddCompletedJob(worker.id, newJob);
    }

    // Reset form
    setNewJobComment('');
    setNewJobImageUrl('');
    setIsAddingJob(false);
  };

  const handleSendQuickQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuoteText.trim()) return;
    onRequestQuote(worker, quickQuoteText);
    setQuoteSent(true);
    setTimeout(() => {
      setQuoteSent(false);
      setQuickQuoteText('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Top Bar */}
        <div className="relative h-44 bg-gradient-to-br from-[#001428] via-[#0f2942] to-[#1e3a5f] p-4 flex flex-col justify-between text-white shrink-0">
          {/* Action buttons */}
          <div className="flex items-center justify-between z-10">
            <button
              onClick={() => onToggleFavorite(worker.id)}
              className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-black/30 text-white hover:bg-black/50'
              }`}
              title={isFavorite ? 'Quitar de guardados' : 'Guardar profesional'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-colors cursor-pointer"
              aria-label="Cerrar detalle"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 L50 20 L100 100 Z" fill="white" />
            </svg>
          </div>

          {/* Verification tag */}
          <div className="z-10 flex items-center gap-2">
            {worker.matricula && (
              <span className="inline-flex items-center gap-1 bg-[#ffdbcb] text-[#783100] text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                <Award className="w-3.5 h-3.5" />
                {worker.matricula}
              </span>
            )}
            {worker.availableNow && (
              <span className="inline-flex items-center gap-1 bg-[#a3f69c] text-[#005312] text-xs font-bold px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#005312] animate-ping" />
                Disponible hoy
              </span>
            )}
          </div>
        </div>

        {/* Profile Card Header Info */}
        <div className="px-5 pt-0 pb-3 relative shrink-0">
          <div className="flex justify-between items-end -mt-12 mb-3">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white shrink-0"
            />
            <div className="flex gap-2">
              <a
                href={`tel:${worker.phone}`}
                className="h-10 px-3.5 rounded-xl border border-[#c3c6ce] text-[#001428] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#eff4ff] active:scale-95 transition-all"
              >
                <Phone className="w-4 h-4 text-[#9e4300]" />
                <span>Llamar</span>
              </a>
              <button
                onClick={() => onContactWhatsApp(worker)}
                className="h-10 px-4 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-1.5 shadow hover:bg-[#20bd5a] active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-[#001428] leading-tight">
              {worker.name}
            </h2>
            {worker.isExample && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-black uppercase tracking-wider shadow-xs animate-pulse">
                ⚠️ EJEMPLO
              </span>
            )}
            {worker.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#005312] text-xs font-semibold border border-[#a3f69c]/60">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                Verificado en {worker.neighborhood}
              </span>
            )}
            {worker.matricula && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                Matrícula: {worker.matricula}
              </span>
            )}
          </div>

          {/* CARTEL BIEN LLAMATIVO DE EJEMPLO */}
          {worker.isExample && (
            <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-start justify-between gap-2.5 shadow-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-amber-950 uppercase tracking-wide">
                    ⚠️ ESTA FICHA ES UN EJEMPLO DE DEMOSTRACIÓN
                  </p>
                  <p className="text-[11px] text-amber-900 font-medium leading-relaxed mt-0.5">
                    Este perfil fue creado a modo ilustrativo para que los usuarios conozcan cómo funciona la ficha de un prestador en la aplicación. Los datos mostrados son de muestra.
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-amber-500 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                MUESTRA
              </span>
            </div>
          )}

          <p className="text-sm font-semibold text-[#9e4300] mt-1">
            {worker.trade}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs text-[#43474d] flex-wrap">
            <div className="flex items-center gap-1 text-[#9e4300] font-bold">
              <Star className="w-4 h-4 fill-current" />
              <span>{worker.rating.toFixed(1)}</span>
              <span className="text-[#74777e] font-normal">({worker.reviewCount} opiniones)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#74777e]" />
              <span>{worker.neighborhood}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#74777e]" />
              <span>{worker.experienceYears} años exp.</span>
            </div>
          </div>

          {/* Guarantees bar */}
          <div className="mt-3 py-2 px-3 bg-[#eff4ff] rounded-xl flex items-center justify-between text-xs text-[#0b1c30]">
            <span className="font-semibold text-[#005312] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
              {worker.guaranteeText}
            </span>
            <span className="font-bold text-[#9e4300]">
              {worker.priceTagText}
            </span>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#e2e8f0] px-5 shrink-0 bg-white">
          <button
            onClick={() => setActiveTab('servicios')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'servicios'
                ? 'border-[#9e4300] text-[#9e4300]'
                : 'border-transparent text-[#74777e] hover:text-[#0b1c30]'
            }`}
          >
            Servicios y Precios
          </button>
          <button
            onClick={() => setActiveTab('trabajos')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'trabajos'
                ? 'border-[#9e4300] text-[#9e4300]'
                : 'border-transparent text-[#74777e] hover:text-[#0b1c30]'
            }`}
          >
            Trabajos ({worker.completedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('opiniones')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'opiniones'
                ? 'border-[#9e4300] text-[#9e4300]'
                : 'border-transparent text-[#74777e] hover:text-[#0b1c30]'
            }`}
          >
            Opiniones ({worker.reviews.length})
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Bio statement */}
          <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#e2e8f0]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#43474d] mb-1">
              Sobre la trayectoria en el Valle de Lerma
            </h4>
            <p className="text-xs text-[#0b1c30] leading-relaxed">
              {worker.bio}
            </p>
          </div>

          {activeTab === 'servicios' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#43474d]">
                Principales tareas y valores de referencia
              </h4>
              <div className="divide-y divide-[#eff4ff]">
                {worker.services.map((svc, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#eff4ff] flex items-center justify-center text-[#0f2942] shrink-0">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-[#0b1c30]">
                        {svc.name}
                      </span>
                    </div>
                    {svc.priceEstimate && (
                      <span className="text-xs font-bold text-[#9e4300] shrink-0 bg-[#ffdbcb]/50 px-2 py-0.5 rounded-md">
                        {svc.priceEstimate}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Rubros adicionales y palabras clave configuradas por el prestador */}
              {(((worker.palabrasClave && worker.palabrasClave.length > 0) || (worker.searchKeywords && worker.searchKeywords.length > 0) || worker.searchKeywordsText)) && (
                <div className="mt-3.5 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 mb-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Artículos, insumos y rubros adicionales que comercializa/ofrece:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(worker.palabrasClave && worker.palabrasClave.length > 0
                      ? worker.palabrasClave
                      : worker.searchKeywords && worker.searchKeywords.length > 0
                      ? worker.searchKeywords
                      : (worker.searchKeywordsText || '').split(',').map(s => s.trim()).filter(Boolean)
                    ).map((kw, idx) => (
                      <span 
                        key={idx} 
                        className="text-[11px] bg-white border border-amber-200/90 text-amber-900 font-semibold px-2 py-0.5 rounded-md shadow-2xs inline-flex items-center gap-1"
                      >
                        <span className="w-1 h-1 rounded-full bg-amber-600" />
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick budget quote form */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#eff4ff] to-[#e5eeff] border border-[#d3e4fe]">
                <h5 className="font-bold text-xs text-[#001428] mb-1">
                  ¿Querés pedirle un presupuesto a {worker.name.split(' ')[0]}?
                </h5>
                <p className="text-[11px] text-[#43474d] mb-2.5">
                  Describí tu necesidad y te contactará por teléfono o WhatsApp sin compromiso.
                </p>
                {quoteSent ? (
                  <div className="p-2.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    ¡Solicitud enviada con éxito! Quedó registrada en tu pestaña "Solicitudes".
                  </div>
                ) : (
                  <form onSubmit={handleSendQuickQuote} className="space-y-2">
                    <textarea
                      rows={2}
                      value={quickQuoteText}
                      onChange={(e) => setQuickQuoteText(e.target.value)}
                      placeholder="Ej: Necesito revisar una pérdida en la ducha y cambiar un flexible..."
                      className="w-full text-xs p-2.5 rounded-lg border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                      required
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-[#74777e]">Totalmente sin costo</span>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0f2942] text-white text-xs font-bold rounded-lg hover:bg-[#001428] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Enviar consulta</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'trabajos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#43474d] flex items-center gap-1.5">
                    <span>Fotos y Obras Realizadas ({worker.completedJobs.length})</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-md">
                      Verificadas
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#74777e]">
                    Fotos exclusivas de servicios contratados a través de la aplicación
                  </p>
                </div>
                {(onAddCompletedJob || onUploadJobPhotoForRequest) && (
                  <button
                    onClick={() => setIsAddingJob(!isAddingJob)}
                    className="px-3 py-1.5 bg-[#9e4300] text-white text-xs font-bold rounded-lg hover:bg-[#853900] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingJob ? 'Cerrar' : 'Subir Foto de Trabajo'}</span>
                  </button>
                )}
              </div>

              {/* Form to add a new job with photo and comment (Only for contracted services) */}
              {isAddingJob && (
                contractedRequests.length === 0 ? (
                  /* Blocked state when no contracted service exists for this professional */
                  <div className="p-4 bg-gradient-to-br from-[#eff4ff] to-[#f8f9ff] rounded-2xl border border-[#c7d2fe] space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0f2942] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Lock className="w-5 h-5 text-[#ffdbcb]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs text-[#001428]">
                            Carga bloqueada: Solo para trabajos contratados en la App
                          </h5>
                          <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                            Regla Anti-Fraude
                          </span>
                        </div>
                        <p className="text-[11px] text-[#43474d] mt-1 leading-relaxed">
                          En <strong>Oficios Valle de Lerma</strong> los profesionales <strong>no pueden subir fotos libres ni imágenes descargadas</strong>. Para garantizar la máxima transparencia a los vecinos, únicamente se permite subir fotos de servicios que fueron previamente presupuestados y contratados mediante la plataforma.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-[#e2e8f0] text-xs space-y-1.5">
                      <p className="text-[11px] font-bold text-[#001428] flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-[#9e4300]" />
                        ¿Cómo se habilita la subida de fotos?
                      </p>
                      <ul className="text-[11px] text-[#74777e] space-y-1 list-disc list-inside">
                        <li>Un vecino solicita un servicio en el Valle y acepta tu cotización formal.</li>
                        <li>El sistema genera automáticamente una <strong>Orden de Contratación</strong> a tu nombre.</li>
                        <li>Al finalizar la tarea, se habilita la subida de la foto de la obra realizada.</li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      {onSimulateContract && (
                        <button
                          type="button"
                          onClick={() => {
                            onSimulateContract(worker);
                          }}
                          className="flex-1 py-2 px-3 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Simular Contrato en App (Habilitar carga para probar)</span>
                        </button>
                      )}
                      {onNavigateToSolicitudes && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onNavigateToSolicitudes();
                          }}
                          className="py-2 px-3 bg-white border border-[#c3c6ce] text-[#001428] hover:bg-gray-50 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Ver Solicitudes</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Form when professional HAS contracted requests */
                  <form 
                    onSubmit={handleCreateJobSubmit}
                    className="p-4 bg-gradient-to-br from-[#f8f9ff] to-[#eef2ff] rounded-2xl border border-[#c7d2fe] space-y-3 animate-in fade-in duration-200"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#005312]" />
                        <h5 className="font-bold text-xs text-[#001428]">
                          Subir foto de servicio contratado en la App
                        </h5>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {contractedRequests.length} servicio(s) disponible(s)
                      </span>
                    </div>

                    {/* Service Contract Selector */}
                    <div>
                      <label className="text-[11px] font-bold text-[#001428] block mb-1">
                        1. Seleccionar trabajo contratado por la app *
                      </label>
                      <select
                        value={selectedContractRequestId || (contractedRequests[0]?.id || '')}
                        onChange={(e) => setSelectedContractRequestId(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-[#9e4300] bg-white font-medium focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                        required
                      >
                        {contractedRequests.map(req => (
                          <option key={req.id} value={req.id}>
                            [{req.contractNumber || 'ORD-VALLE-2026'}] {req.title} — {req.neighborhood} ({req.clientName || 'Vecino'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selected contract details badge */}
                    {selectedContract && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-900 flex items-center gap-1 text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            Orden de Servicio Verificada
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[#9e4300] bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                            #{selectedContract.contractNumber || 'ORD-VALLE-2026'}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-950 font-bold">
                          {selectedContract.title}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-emerald-800 pt-0.5">
                          <span>Cliente: <strong>{selectedContract.clientName || 'Vecino del Valle'}</strong></span>
                          <span>•</span>
                          <span>Ubicación: <strong>{selectedContract.neighborhood}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Photo file input */}
                    <div>
                      <label className="text-[11px] font-bold text-[#001428] block mb-1">
                        2. Foto de la obra o trabajo realizado *
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <label className="flex-1 w-full flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#9e4300]/40 rounded-xl bg-white hover:bg-orange-50/40 cursor-pointer transition-colors">
                          <ImageIcon className="w-6 h-6 text-[#9e4300] mb-1" />
                          <span className="text-xs font-semibold text-[#001428]">
                            {isUploadingPhoto ? 'Cargando imagen...' : 'Seleccionar foto desde tu dispositivo'}
                          </span>
                          <span className="text-[10px] text-[#74777e]">
                            JPG, PNG o WebP de la reparación u obra
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>

                        {newJobImageUrl && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#9e4300] shrink-0 relative bg-black">
                            <img 
                              src={newJobImageUrl} 
                              alt="Vista previa" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                      </div>

                      {/* Presets if testing quickly */}
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-[#74777e]">O elegir foto de prueba:</span>
                        <button
                          type="button"
                          onClick={() => setNewJobImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80')}
                          className="text-[10px] bg-white border border-[#c3c6ce] px-2 py-0.5 rounded-md hover:bg-gray-50 text-[#001428]"
                        >
                          Plomería/Cañería
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewJobImageUrl('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80')}
                          className="text-[10px] bg-white border border-[#c3c6ce] px-2 py-0.5 rounded-md hover:bg-gray-50 text-[#001428]"
                        >
                          Parrilla/Albañilería
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewJobImageUrl('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80')}
                          className="text-[10px] bg-white border border-[#c3c6ce] px-2 py-0.5 rounded-md hover:bg-gray-50 text-[#001428]"
                        >
                          Electricidad
                        </button>
                      </div>
                    </div>

                    {/* Comments / description of the work */}
                    <div>
                      <label className="text-[11px] font-bold text-[#001428] block mb-1">
                        3. Comentario técnico del trabajo
                      </label>
                      <textarea
                        rows={2}
                        value={newJobComment}
                        onChange={(e) => setNewJobComment(e.target.value)}
                        placeholder="Contá qué materiales utilizaste, el procedimiento realizado y la garantía entregada al vecino..."
                        className="w-full text-xs p-2 rounded-lg border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingJob(false)}
                        className="px-3 py-1.5 text-xs text-[#74777e] hover:text-[#001428]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#0f2942] text-white text-xs font-bold rounded-xl hover:bg-[#001428] flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                      >
                        <Check className="w-3.5 h-3.5 text-[#a3f69c]" />
                        <span>Publicar Foto Certificada en Perfil</span>
                      </button>
                    </div>
                  </form>
                )
              )}

              {/* List of completed jobs */}
              {worker.completedJobs.length === 0 ? (
                <div className="p-6 bg-white rounded-xl border border-dashed border-[#c3c6ce] text-center space-y-1.5">
                  <ShieldCheck className="w-8 h-8 text-[#74777e] mx-auto opacity-50" />
                  <p className="text-xs font-bold text-[#001428]">Sin trabajos certificados aún</p>
                  <p className="text-[11px] text-[#74777e] max-w-sm mx-auto">
                    Las fotos se publicarán automáticamente a medida que se completen trabajos contratados a través de la aplicación.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/70 text-blue-900 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <ZoomIn className="w-4 h-4 text-blue-600" />
                      Galería interactiva: Tocá cualquier foto para verla en pantalla completa
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                      {worker.completedJobs.length} {worker.completedJobs.length === 1 ? 'obra' : 'obras'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {worker.completedJobs.map((job, idx) => (
                      <div 
                        key={job.id || idx} 
                        onClick={() => handleOpenLightbox(idx)}
                        className="group rounded-2xl border border-[#e2e8f0] hover:border-orange-300 overflow-hidden bg-white shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer"
                        title="Hacé clic para ampliar esta obra terminada"
                      >
                        <div>
                          {/* Image Container with Hover Zoom Overlay */}
                          <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                            <img
                              src={job.imageUrl || job.photoUrl}
                              alt={job.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Gradient Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5">
                              <span className="text-white text-xs font-bold flex items-center gap-1.5 drop-shadow-sm">
                                <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                                <span>Ver en alta resolución</span>
                              </span>
                            </div>

                            {/* Verified App Contract Badge */}
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#001428]/85 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs">
                              <ShieldCheck className="w-3 h-3 text-[#a3f69c]" />
                              <span>Contratado vía App</span>
                            </div>

                            {/* Zoom In Badge Top Right */}
                            <div className="absolute top-2 right-2 bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-lg shadow-sm backdrop-blur-xs group-hover:scale-110 transition-transform flex items-center gap-1 text-[10px] font-bold">
                              <ZoomIn className="w-3.5 h-3.5 text-[#9e4300]" />
                              <span className="hidden group-hover:inline">Ampliar</span>
                            </div>

                            {/* Contract number badge */}
                            {job.contractNumber && (
                              <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white font-mono px-1.5 py-0.5 rounded text-[9px]">
                                #{job.contractNumber}
                              </div>
                            )}

                            {/* Index pill bottom left */}
                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-slate-200 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                              Foto {idx + 1} de {worker.completedJobs.length}
                            </div>
                          </div>

                          <div className="p-3 space-y-2">
                            <div>
                              <p className="font-bold text-xs text-[#0b1c30] group-hover:text-[#9e4300] transition-colors leading-snug">
                                {job.title}
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-[#74777e] mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-[#9e4300]" />
                                  {job.neighborhood}
                                </span>
                                {job.date && <span>{job.date}</span>}
                              </div>
                            </div>

                            {job.clientName && (
                              <div className="text-[10px] text-[#005312] font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                <Check className="w-3 h-3 text-[#2E7D32]" />
                                <span>Cliente: {job.clientName}</span>
                              </div>
                            )}

                            {/* Job technical comment preview */}
                            {job.comment && (
                              <div className="p-2 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] text-[11px] text-[#43474d] leading-relaxed flex items-start gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-[#9e4300] shrink-0 mt-0.5" />
                                <div className="line-clamp-2">
                                  <span className="text-[#001428] font-bold text-[10px] uppercase tracking-wider block">
                                    Detalle técnico:
                                  </span>
                                  {job.comment}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card bottom click prompt */}
                        <div className="px-3 pb-3 pt-1 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#9e4300] font-bold group-hover:text-[#783100]">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Tocar para ampliar foto</span>
                          </span>
                          <Maximize2 className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'opiniones' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#43474d]">
                  Comentarios de vecinos del Valle de Lerma
                </h4>
                <div className="flex items-center gap-1 text-xs font-bold text-[#9e4300]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{worker.rating.toFixed(1)} / 5</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {worker.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-xl bg-white border border-[#e2e8f0] shadow-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#001428]">{rev.author}</span>
                      <div className="flex text-[#9e4300]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#43474d] italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-[#74777e] mt-1.5 pt-1 border-t border-[#f1f5f9]">
                      <span>{rev.neighborhood}</span>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom CTA */}
        <div className="p-4 bg-[#f8f9ff] border-t border-[#e2e8f0] flex items-center gap-2 shrink-0">
          <button
            onClick={() => onContactWhatsApp(worker)}
            className="flex-1 h-12 rounded-xl bg-[#25D366] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#20bd5a] active:scale-[0.98] transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Consultar por WhatsApp</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LIGHTBOX MODAL EN ALTA DEFINICIÓN PARA FOTOS DE OBRAS TERMINADAS           */}
      {/* ========================================================================= */}
      {selectedJobForLightbox && selectedJobIndex !== null && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/92 backdrop-blur-md animate-fade-in"
          onClick={handleCloseLightbox}
        >
          <div 
            className="relative w-full max-w-4xl bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar de la Galería Ampliada */}
            <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <ZoomIn className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                    {selectedJobForLightbox.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{selectedJobForLightbox.neighborhood}</span>
                    {selectedJobForLightbox.contractNumber && (
                      <span className="font-mono text-amber-300">#{selectedJobForLightbox.contractNumber}</span>
                    )}
                    <span>• Foto {selectedJobIndex + 1} de {worker.completedJobs.length}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseLightbox}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Cerrar ampliación (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Zona Principal de Visualización de Foto en HD con Flechas */}
            <div className="relative flex-1 flex items-center justify-center bg-black min-h-[260px] max-h-[58vh] sm:max-h-[64vh] p-2 overflow-hidden select-none">
              <img
                src={selectedJobForLightbox.imageUrl || selectedJobForLightbox.photoUrl}
                alt={selectedJobForLightbox.title}
                className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl transition-all duration-200"
              />

              {/* Botón Foto Anterior */}
              {worker.completedJobs.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevJob}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer backdrop-blur-xs"
                  title="Foto anterior (Flecha izquierda)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Botón Foto Siguiente */}
              {worker.completedJobs.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextJob}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer backdrop-blur-xs"
                  title="Foto siguiente (Flecha derecha)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Tira de Miniaturas (si hay más de 1 foto) */}
            {worker.completedJobs.length > 1 && (
              <div className="px-3 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
                {worker.completedJobs.map((thumbJob, tIdx) => (
                  <button
                    key={thumbJob.id || tIdx}
                    type="button"
                    onClick={() => setSelectedJobIndex(tIdx)}
                    className={`relative w-14 h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      tIdx === selectedJobIndex 
                        ? 'border-orange-500 scale-105 shadow-md shadow-orange-500/20 ring-1 ring-orange-400' 
                        : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                    title={thumbJob.title}
                  >
                    <img
                      src={thumbJob.imageUrl || thumbJob.photoUrl}
                      alt={thumbJob.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Detalle Técnico y Botón de Contacto Rápido */}
            <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {selectedJobForLightbox.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Obra Certificada en Valle de Lerma
                    </span>
                    {selectedJobForLightbox.clientName && (
                      <span className="text-[10px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                        Cliente: {selectedJobForLightbox.clientName}
                      </span>
                    )}
                  </div>
                  {selectedJobForLightbox.comment && (
                    <div className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-orange-400 font-bold block text-[10px] uppercase tracking-wider mb-0.5">
                        Detalle técnico de la obra:
                      </span>
                      <p>{selectedJobForLightbox.comment}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `Hola ${worker.name}, estuve viendo la foto de tu trabajo "${selectedJobForLightbox.title}" en ${selectedJobForLightbox.neighborhood} y me gustaría pedirte un presupuesto similar para mi domicilio.`;
                      onContactWhatsApp(worker, msg);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Pedir presupuesto similar por WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
