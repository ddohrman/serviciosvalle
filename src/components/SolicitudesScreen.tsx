import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Clock, 
  CheckCircle2, 
  MessageCircle, 
  MapPin, 
  Send, 
  X, 
  FileText, 
  ShieldCheck, 
  Image as ImageIcon, 
  Camera, 
  Check, 
  DollarSign, 
  Briefcase, 
  UserCheck, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Phone
} from 'lucide-react';
import { ServiceRequest, ServiceCategory, Neighborhood, Professional, UserProfile } from '../types';
import { RequestChatModal } from './RequestChatModal';
import { getOrCreateDeviceId } from '../utils/deviceTracker';

interface SolicitudesScreenProps {
  requests: ServiceRequest[];
  categories: ServiceCategory[];
  neighborhoods: Neighborhood[];
  onCreateRequest: (req: Omit<ServiceRequest, 'id' | 'createdAt'>) => void;
  onAcceptQuote: (reqId: string) => void;
  onOpenWhatsAppQuote: (req: ServiceRequest) => void;
  onUploadJobPhoto?: (reqId: string, photoUrl: string, comment?: string) => void;
  loggedInPro?: Professional | null;
  userProfile?: UserProfile;
  onSendQuote?: (reqId: string, quoteAmount: number, quoteNote?: string) => void;
  onContactClientWhatsApp?: (phone: string, clientName: string, requestTitle: string) => void;
  onNavigateToSerPro?: () => void;
  onOpenReport?: (req?: ServiceRequest | null) => void;
}

export const SolicitudesScreen: React.FC<SolicitudesScreenProps> = ({
  requests,
  categories,
  neighborhoods,
  onCreateRequest,
  onAcceptQuote,
  onOpenWhatsAppQuote,
  onUploadJobPhoto,
  loggedInPro,
  userProfile,
  onSendQuote,
  onContactClientWhatsApp,
  onNavigateToSerPro,
  onOpenReport
}) => {
  // Mode selection: 'prestador' (Bandeja de pedidos) or 'vecino' (Mis solicitudes como cliente)
  const [activeMode, setActiveMode] = useState<'prestador' | 'vecino'>(() => {
    return loggedInPro ? 'prestador' : 'vecino';
  });

  // Keep in sync when pro logs in/out
  useEffect(() => {
    if (loggedInPro) {
      setActiveMode('prestador');
    } else {
      setActiveMode('vecino');
    }
  }, [loggedInPro]);

  // Provider filter sub-tabs
  const [proFilter, setProFilter] = useState<'todos' | 'nuevos' | 'cotizados' | 'contratados'>('nuevos');

  // Modal to send quote from provider
  const [quotingRequest, setQuotingRequest] = useState<ServiceRequest | null>(null);
  const [quoteAmountInput, setQuoteAmountInput] = useState<string>('');
  const [quoteNoteInput, setQuoteNoteInput] = useState<string>('');

  // Real-time Chat modal state
  const [activeChatRequest, setActiveChatRequest] = useState<ServiceRequest | null>(null);

  // Neighbor mode create request
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTrade, setNewTrade] = useState(categories[0]?.name || 'Albañilería y Reformas');
  const [newNeighborhood, setNewNeighborhood] = useState(neighborhoods[1]?.name || 'Cerrillos');
  const [newDesc, setNewDesc] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgente' | 'semana'>('normal');
  const [neighborFilter, setNeighborFilter] = useState<'todos' | 'en_espera' | 'cotizado' | 'contratado' | 'completado'>('todos');

  // Photo upload for completed jobs
  const [uploadingForReq, setUploadingForReq] = useState<ServiceRequest | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoCommentInput, setPhotoCommentInput] = useState('');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // Submit quote from provider
  const handleSendQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotingRequest || !onSendQuote) return;
    const amount = parseFloat(quoteAmountInput.replace(/[^0-9]/g, ''));
    if (isNaN(amount) || amount <= 0) return;

    onSendQuote(quotingRequest.id, amount, quoteNoteInput.trim() || undefined);
    setQuotingRequest(null);
    setQuoteAmountInput('');
    setQuoteNoteInput('');
  };

  // Submit new request from neighbor
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    onCreateRequest({
      title: newTitle.trim(),
      trade: newTrade,
      neighborhood: newNeighborhood,
      description: newDesc.trim(),
      status: 'en_espera',
      deviceId: getOrCreateDeviceId(),
      clientName: userProfile?.name || 'Vecino del Valle',
      phoneContact: userProfile?.phone || undefined
    });

    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

  // Upload photo file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingUpload(true);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPhotoUrlInput(uploadEvent.target?.result as string);
        setIsProcessingUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save photo upload
  const handleSavePhotoForReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingForReq || !onUploadJobPhoto) return;

    const finalImage = photoUrlInput.trim() || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
    onUploadJobPhoto(uploadingForReq.id, finalImage, photoCommentInput.trim() || undefined);

    setUploadingForReq(null);
    setPhotoUrlInput('');
    setPhotoCommentInput('');
  };

  // Provider calculations
  const isTradeRelevant = (reqTrade: string, proTrade: string) => {
    const r = reqTrade.toLowerCase();
    const p = proTrade.toLowerCase();
    return r.includes(p) || p.includes(r) || p.split(' ').some(word => word.length > 3 && r.includes(word));
  };

  const proRelevantRequests = loggedInPro
    ? requests.filter(r => isTradeRelevant(r.trade, loggedInPro.trade) || r.quotedBy === loggedInPro.name || r.assignedWorkerId === loggedInPro.id)
    : [];

  const proRequestsToDisplay = loggedInPro
    ? requests.filter(req => {
        if (proFilter === 'nuevos') {
          return req.status === 'en_espera';
        }
        if (proFilter === 'cotizados') {
          return req.status === 'cotizado' && req.quotedBy === loggedInPro.name;
        }
        if (proFilter === 'contratados') {
          return (req.status === 'contratado' || req.status === 'completado') && 
                 (req.assignedWorkerId === loggedInPro.id || req.quotedBy === loggedInPro.name);
        }
        return true; // 'todos'
      })
    : [];

  // Neighbor calculations
  const pendingCount = requests.filter(r => r.status === 'en_espera').length;
  const quotedCount = requests.filter(r => r.status === 'cotizado').length;
  const contractedOnlyCount = requests.filter(r => r.status === 'contratado').length;
  const completedCount = requests.filter(r => r.status === 'completado').length;
  const contractedCount = contractedOnlyCount + completedCount;

  const neighborRequestsToDisplay = requests.filter(req => {
    if (neighborFilter === 'todos') return true;
    return req.status === neighborFilter;
  });

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-2 pb-24">
      {/* 1. DUAL-VIEW TOGGLE SWITCHER (Visible when a provider is logged in) */}
      {loggedInPro && (
        <div className="mb-3 bg-white p-1.5 rounded-2xl border border-[#d3e4fe] shadow-2xs">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveMode('prestador')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'prestador'
                  ? 'bg-[#001428] text-white shadow-xs'
                  : 'bg-transparent text-[#43474d] hover:bg-[#eff4ff]'
              }`}
            >
              <Briefcase className="w-4 h-4 text-[#ffb68f]" />
              <span className="truncate">Bandeja de Trabajos ({proRelevantRequests.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('vecino')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'vecino'
                  ? 'bg-[#001428] text-white shadow-xs'
                  : 'bg-transparent text-[#43474d] hover:bg-[#eff4ff]'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-[#a3f69c]" />
              <span className="truncate">Mis Pedidos ({requests.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODE: PRESTADOR DE SERVICIOS (Bandeja de Pedidos de Clientes) */}
      {/* ========================================================================= */}
      {activeMode === 'prestador' && loggedInPro ? (
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Provider Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0f2942] to-[#001428] text-white shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={loggedInPro.avatar}
                alt={loggedInPro.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-sm font-bold truncate">{loggedInPro.name}</h2>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.5 rounded font-bold">
                    Prestador Activo
                  </span>
                </div>
                <p className="text-xs text-[#ffdbcb] font-semibold truncate mt-0.5">
                  {loggedInPro.trade} • {loggedInPro.neighborhood}
                </p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Bandeja de solicitudes de vecinos del Valle de Lerma
                </p>
              </div>
            </div>
          </div>

          {/* Quick Sub-Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
            {[
              { id: 'nuevos', label: 'Nuevos pedidos', count: requests.filter(r => r.status === 'en_espera').length },
              { id: 'cotizados', label: 'Mis cotizaciones', count: requests.filter(r => r.status === 'cotizado' && r.quotedBy === loggedInPro.name).length },
              { id: 'contratados', label: 'Asignados', count: requests.filter(r => (r.status === 'contratado' || r.status === 'completado') && (r.assignedWorkerId === loggedInPro.id || r.quotedBy === loggedInPro.name)).length },
              { id: 'todos', label: 'Todos', count: requests.length }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setProFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
                  proFilter === tab.id
                    ? 'bg-[#9e4300] text-white shadow-2xs'
                    : 'bg-white text-[#43474d] border border-[#e2e8f0] hover:bg-[#f8f9ff]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  proFilter === tab.id ? 'bg-white/25 text-white' : 'bg-gray-100 text-[#001428]'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Job List for the Provider */}
          <div className="space-y-3">
            {proRequestsToDisplay.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] text-center space-y-2">
                <Briefcase className="w-10 h-10 text-[#c3c6ce] mx-auto" />
                <h3 className="font-bold text-sm text-[#001428]">
                  No hay pedidos en esta sección
                </h3>
                <p className="text-xs text-[#74777e] max-w-xs mx-auto">
                  {proFilter === 'nuevos' 
                    ? 'No hay solicitudes pendientes de cotización en este momento.'
                    : 'Seleccioná la pestaña "Todos" o "Nuevos pedidos" para ver solicitudes en el Valle de Lerma.'}
                </p>
                <button
                  type="button"
                  onClick={() => setProFilter('todos')}
                  className="mt-2 px-3 py-1.5 bg-[#001428] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Ver todos los pedidos
                </button>
              </div>
            ) : (
              proRequestsToDisplay.map((req) => {
                const isQuotedByMe = req.status === 'cotizado' && req.quotedBy === loggedInPro.name;
                const isContractedToMe = (req.status === 'contratado' || req.status === 'completado') && 
                                         (req.assignedWorkerId === loggedInPro.id || req.quotedBy === loggedInPro.name);
                const isPending = req.status === 'en_espera';

                return (
                  <article
                    key={req.id}
                    className={`bg-white rounded-2xl p-4 border transition-all space-y-3 ${
                      isContractedToMe
                        ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-xs'
                        : isQuotedByMe
                        ? 'border-blue-300 shadow-2xs'
                        : 'border-[#e2e8f0] shadow-2xs'
                    }`}
                  >
                    {/* Header of Job Request */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-[#9e4300] uppercase tracking-wide bg-[#ffdbcb]/60 px-2 py-0.5 rounded">
                            {req.trade}
                          </span>
                          {req.neighborhood && (
                            <span className="text-[10px] font-bold text-[#001428] bg-gray-100 px-2 py-0.5 rounded flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-gray-500" />
                              {req.neighborhood}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-[#001428] mt-1 leading-tight">
                          {req.title}
                        </h3>
                        <p className="text-[11px] text-[#74777e] mt-0.5">
                          Solicitado por: <strong>{req.clientName || 'Vecino del Valle'}</strong> • {req.createdAt}
                        </p>
                      </div>

                      {/* Status Tag */}
                      {isContractedToMe ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#005312] text-xs font-bold border border-emerald-300 shrink-0 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#005312]" />
                          <span>¡Asignado a vos!</span>
                        </span>
                      ) : isQuotedByMe ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200 shrink-0">
                          Cotizado
                        </span>
                      ) : isPending ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 shrink-0">
                          Sin cotizar
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium shrink-0">
                          En proceso
                        </span>
                      )}
                    </div>

                    {/* Neighbor's description */}
                    <div className="bg-[#f8faff] p-3 rounded-xl border border-[#edf2f7] text-xs text-[#334155] leading-relaxed">
                      <p className="font-semibold text-[11px] text-[#001428] mb-0.5">Detalle del cliente:</p>
                      <p>{req.description}</p>
                    </div>

                    {/* Quote Info Box if quoted by me */}
                    {isQuotedByMe && (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-blue-950">Tu presupuesto enviado</p>
                          <p className="text-[11px] text-blue-800">
                            En espera de que el cliente confirme la contratación
                          </p>
                        </div>
                        <span className="text-sm font-black text-blue-900">
                          ${req.quoteAmount?.toLocaleString('es-AR')}
                        </span>
                      </div>
                    )}

                    {/* Contracted Box if assigned to this worker */}
                    {isContractedToMe && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-emerald-950">
                              Contrato #{req.contractNumber || 'ORD-VALLE-2026'}
                            </p>
                            <p className="text-[11px] text-emerald-800">
                              Monto pactado: ${req.quoteAmount?.toLocaleString('es-AR') || 'A convenir'}
                            </p>
                          </div>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 font-black px-2 py-0.5 rounded">
                            Confirmado
                          </span>
                        </div>

                        {req.completedJobPhoto ? (
                          <div className="pt-1">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 mb-1">
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Foto de obra certificada subida</span>
                            </div>
                            <img
                              src={req.completedJobPhoto}
                              alt="Obra finalizada"
                              className="w-full h-32 object-cover rounded-lg border border-emerald-200"
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setUploadingForReq(req);
                              setPhotoUrlInput('');
                              setPhotoCommentInput('');
                            }}
                            className="w-full py-2 bg-[#001428] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#0f2942] cursor-pointer shadow-xs"
                          >
                            <Camera className="w-4 h-4 text-[#ffdbcb]" />
                            <span>Subir Foto Certificada (Suma reputación en tu perfil)</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="space-y-1.5 pt-1">
                      {/* Send Quote Button if pending */}
                      {isPending && onSendQuote && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuotingRequest(req);
                            setQuoteAmountInput('');
                            setQuoteNoteInput('');
                          }}
                          className="w-full h-9 rounded-xl bg-[#9e4300] hover:bg-[#853900] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Enviar Presupuesto Formal</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        {/* Chat en Vivo integrado en app con resguardo 30 días */}
                        <button
                          type="button"
                          onClick={() => setActiveChatRequest(req)}
                          className="flex-1 h-9 rounded-xl bg-[#001428] hover:bg-[#0f2942] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          title="Chat directo en la plataforma con copia de seguridad por 30 días"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#ffdbcb]" />
                          <span>Chat en Vivo</span>
                        </button>

                        {/* WhatsApp Direct to Neighbor */}
                        <button
                          type="button"
                          onClick={() => {
                            const clientPhone = req.phoneContact || '+54 387 455-8910';
                            const clientName = req.clientName || 'Vecino';
                            if (onContactClientWhatsApp) {
                              onContactClientWhatsApp(clientPhone, clientName, req.title);
                            } else {
                              const cleanPhone = clientPhone.replace(/[^0-9]/g, '');
                              const msg = encodeURIComponent(`Hola ${clientName}, te escribe ${loggedInPro.name.split(' ')[0]} (${loggedInPro.trade}) de Oficios Valle de Lerma por tu pedido de "${req.title}". ¿Cómo estás?`);
                              window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          className="flex-1 h-9 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. MODE: VECINO / CLIENTE (Mis Solicitudes y Presupuestos) */
        /* ========================================================================= */
        <div className="space-y-3 animate-in fade-in duration-200">
          {/* Top Title & Action */}
          <div className="flex items-center justify-between py-1">
            <div>
              <h1 className="text-xl font-bold text-[#001428]">
                Mis Solicitudes
              </h1>
              <p className="text-xs text-[#43474d]">
                Presupuestos y contrataciones en el Valle de Lerma
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="h-9 px-3 bg-[#9e4300] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow hover:bg-[#853900] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Pedir presupuesto</span>
            </button>
          </div>

          {/* Invitation Banner for Providers (Visible when not logged in as a provider) */}
          {!loggedInPro && onNavigateToSerPro && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#eff4ff] to-[#e5eeff] border border-[#d3e4fe] flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#001428] text-[#ffdbcb] flex items-center justify-center shrink-0 shadow-2xs">
                  <Briefcase className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-[#001428]">
                    ¿Sos prestador de oficios o servicios?
                  </p>
                  <p className="text-[11px] text-[#43474d] leading-tight">
                    Iniciá sesión en <strong>Ser Pro</strong> para recibir los pedidos de trabajo de tus vecinos.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onNavigateToSerPro}
                className="px-3 py-1.5 bg-[#001428] hover:bg-[#0f2942] text-white text-xs font-bold rounded-xl shrink-0 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span>Acceder</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Status pills */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] shadow-2xs">
              <span className="text-[9px] uppercase font-bold text-[#005312] tracking-wider block">
                Contratados
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base sm:text-lg font-bold text-[#005312]">{contractedCount}</span>
                <span className="text-[10px] text-[#74777e] leading-tight">en la App</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] shadow-2xs">
              <span className="text-[9px] uppercase font-bold text-[#43474d] tracking-wider block">
                Cotizados
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base sm:text-lg font-bold text-[#001428]">{quotedCount}</span>
                <span className="text-[10px] text-[#74777e] leading-tight">listos</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#e2e8f0] shadow-2xs">
              <span className="text-[9px] uppercase font-bold text-[#43474d] tracking-wider block">
                En espera
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base sm:text-lg font-bold text-[#9e4300]">{pendingCount}</span>
                <span className="text-[10px] text-[#74777e] leading-tight">en revisión</span>
              </div>
            </div>
          </div>

          {/* Quick Sub-Filter Tabs for Neighbors */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold mt-1">
            {[
              { id: 'todos', label: 'Todos los pedidos', count: requests.length },
              { id: 'en_espera', label: 'Pendientes', count: pendingCount },
              { id: 'cotizado', label: 'Cotizados', count: quotedCount },
              { id: 'contratado', label: 'Contratados', count: contractedOnlyCount },
              { id: 'completado', label: 'Realizados / Galería', count: completedCount }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setNeighborFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
                  neighborFilter === tab.id
                    ? 'bg-[#001428] text-white shadow-2xs'
                    : 'bg-white text-[#43474d] border border-[#e2e8f0] hover:bg-[#f8f9ff]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  neighborFilter === tab.id ? 'bg-white/25 text-white' : 'bg-gray-100 text-[#001428]'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Requests List */}
          <div className="space-y-3 mt-1">
            {neighborRequestsToDisplay.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-2xl border border-[#e2e8f0] mt-2">
                <ClipboardList className="w-12 h-12 text-[#c3c6ce] mx-auto mb-2" />
                <h3 className="font-bold text-sm text-[#001428]">No hay solicitudes en esta sección</h3>
                <p className="text-xs text-[#74777e] mt-1 max-w-xs mx-auto">
                  Seleccioná "Todos los pedidos" o creá una nueva solicitud para pedir presupuesto sin cargo.
                </p>
                <button
                  onClick={() => setNeighborFilter('todos')}
                  className="mt-3 px-3 py-1.5 bg-[#001428] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Ver todos los pedidos
                </button>
              </div>
            ) : (
              neighborRequestsToDisplay.map((req) => {
                const isQuoted = req.status === 'cotizado';
                const isContracted = req.status === 'contratado';
                const isCompleted = req.status === 'completado';

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-2xl p-4 border transition-shadow space-y-3 ${
                      isContracted || isCompleted
                        ? 'border-emerald-300 shadow-xs ring-1 ring-emerald-100'
                        : 'border-[#e2e8f0] shadow-2xs'
                    }`}
                  >
                    {/* Header of card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#9e4300] uppercase tracking-wide">
                          {req.trade}
                        </span>
                        <h3 className="text-sm font-bold text-[#001428] leading-tight mt-0.5">
                          {req.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-[#74777e] mt-1">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {req.neighborhood}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {req.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isContracted ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#005312] text-xs font-bold border border-emerald-300 flex items-center gap-1 shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#005312]" />
                          <span>Contratado en App</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                          <span>Trabajo Finalizado</span>
                        </span>
                      ) : isQuoted ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#eff4ff] text-[#005312] text-xs font-bold border border-[#a3f69c] shrink-0">
                          Presupuesto listo
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-[#ffdbcb]/60 text-[#783100] text-xs font-bold shrink-0">
                          En espera
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#43474d] bg-[#f8f9ff] p-2.5 rounded-xl border border-[#eff4ff] leading-relaxed">
                      {req.description}
                    </p>

                    {/* Contracted Info Box */}
                    {(isContracted || isCompleted) && (
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-[#f0fdf4] border border-emerald-200 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {req.quotedByAvatar ? (
                              <img
                                src={req.quotedByAvatar}
                                alt={req.quotedBy || 'Profesional'}
                                className="w-10 h-10 rounded-full object-cover border border-emerald-300 shadow-2xs"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center text-xs">
                                PRO
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-emerald-950">{req.quotedBy || 'Profesional Contratado'}</p>
                                <span className="text-[9px] bg-emerald-200/80 text-emerald-900 font-extrabold px-1.5 py-0.2 rounded">
                                  Asignado
                                </span>
                              </div>
                              <p className="text-[10px] text-emerald-800">{req.quotedByTrade || req.trade}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[9px] font-mono text-emerald-800 block">
                              Orden #{req.contractNumber || 'ORD-VALLE-2026'}
                            </span>
                            {req.quoteAmount && (
                              <span className="text-xs font-extrabold text-emerald-900">
                                ${req.quoteAmount.toLocaleString('es-AR')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Completed job photo preview if available */}
                        {req.completedJobPhoto ? (
                          <div className="mt-1 bg-white p-2.5 rounded-xl border border-emerald-200 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                              <span className="flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                                Foto Certificada del Trabajo Realizado
                              </span>
                              <span className="text-[10px] text-emerald-700">Subida en perfil</span>
                            </div>
                            <img
                              src={req.completedJobPhoto}
                              alt="Foto de la obra finalizada"
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            {req.completedJobComment && (
                              <p className="text-xs text-[#43474d] italic bg-gray-50 p-2 rounded-lg">
                                "{req.completedJobComment}"
                              </p>
                            )}
                          </div>
                        ) : (
                          onUploadJobPhoto && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setUploadingForReq(req);
                                  setPhotoUrlInput('');
                                  setPhotoCommentInput('');
                                }}
                                className="w-full h-9 rounded-xl bg-[#0f2942] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#001428] active:scale-98 transition-all cursor-pointer shadow-xs"
                              >
                                <Camera className="w-3.5 h-3.5 text-[#ffdbcb]" />
                                <span>Subir Foto del Trabajo Realizado (Habilitado)</span>
                              </button>
                            </div>
                          )
                        )}
                        {/* Contracted Chat Button */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setActiveChatRequest(req)}
                            className="w-full h-9 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-200" />
                            <span>Chat en Vivo con {req.quotedBy || 'Profesional'} (Resguardo 30d)</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quoted box */}
                    {isQuoted && req.quotedBy && (
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#eff4ff] to-[#e5eeff] border border-[#d3e4fe] flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {req.quotedByAvatar && (
                              <img
                                src={req.quotedByAvatar}
                                alt={req.quotedBy}
                                className="w-9 h-9 rounded-full object-cover border border-white shadow-2xs"
                              />
                            )}
                            <div>
                              <p className="text-xs font-bold text-[#001428]">{req.quotedBy}</p>
                              <p className="text-[10px] text-[#43474d]">{req.quotedByTrade}</p>
                            </div>
                          </div>
                          {req.quoteAmount && (
                            <div className="text-right">
                              <span className="text-[10px] text-[#74777e] block">Presupuesto</span>
                              <span className="text-sm font-extrabold text-[#9e4300]">
                                ${req.quoteAmount.toLocaleString('es-AR')}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 pt-1 border-t border-[#d3e4fe]/80">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveChatRequest(req)}
                              className="h-9 rounded-lg bg-[#001428] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#0f2942] active:scale-95 transition-all cursor-pointer"
                              title="Chat directo seguro con resguardo de 30 días"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-[#ffdbcb]" />
                              <span>Chat en Vivo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenWhatsAppQuote(req)}
                              className="h-9 rounded-lg bg-[#25D366] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#20bd5a] active:scale-95 transition-all cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAcceptQuote(req.id)}
                            className="w-full h-9 rounded-lg bg-[#0f2942] text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#001428] active:scale-95 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#a3f69c]" />
                            <span>Contratar Trabajo</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pending request chat button */}
                    {!isContracted && !isCompleted && !isQuoted && (
                      <div className="pt-1 flex items-center justify-between gap-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setActiveChatRequest(req)}
                          className="w-full h-9 rounded-xl bg-gray-50 hover:bg-blue-50/60 border border-gray-200 text-[#001428] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#9e4300]" />
                          <span>Abrir Chat de la Solicitud</span>
                          <span className="text-[10px] text-gray-500 font-normal ml-1">• Resguardo de Seguridad 30d</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PROVIDER SENDS QUOTE */}
      {/* ========================================================================= */}
      {quotingRequest && loggedInPro && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0f2942] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#ffdbcb]" />
                <div>
                  <h3 className="font-bold text-sm">Enviar Presupuesto al Cliente</h3>
                  <p className="text-[10px] text-gray-300">
                    Cliente: {quotingRequest.clientName || 'Vecino del Valle'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuotingRequest(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendQuoteSubmit} className="p-4 space-y-3.5">
              <div className="p-3 bg-[#f8faff] rounded-xl border border-[#e2e8f0] text-xs">
                <p className="font-bold text-[#001428]">{quotingRequest.title}</p>
                <p className="text-[11px] text-[#43474d] mt-1 line-clamp-2">
                  {quotingRequest.description}
                </p>
                <p className="text-[10px] text-[#9e4300] font-semibold mt-1">
                  Localidad: {quotingRequest.neighborhood}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  Monto estimado de mano de obra / trabajo ($ ARS) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#74777e] font-bold text-sm">$</span>
                  <input
                    type="number"
                    required
                    min="100"
                    step="500"
                    value={quoteAmountInput}
                    onChange={(e) => setQuoteAmountInput(e.target.value)}
                    placeholder="Ej: 25000"
                    className="w-full text-sm font-bold pl-8 p-2.5 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  Aclaración o alcance del presupuesto (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={quoteNoteInput}
                  onChange={(e) => setQuoteNoteInput(e.target.value)}
                  placeholder="Ej: Incluye mano de obra calificada, herramientas y garantía."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuotingRequest(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#c3c6ce] text-xs font-semibold text-[#43474d]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Presupuesto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW REQUEST (NEIGHBOR) */}
      {/* ========================================================================= */}
      {isCreating && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0f2942] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#ffdbcb]" />
                <h3 className="font-bold text-sm">Pedir Presupuesto en el Valle de Lerma</h3>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  Título del trabajo o problema
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Pintar rejas de frente y portón"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#001428] block mb-1">
                    Rubro / Oficio
                  </label>
                  <select
                    value={newTrade}
                    onChange={(e) => setNewTrade(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#001428] block mb-1">
                    Departamento del Valle
                  </label>
                  <select
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                  >
                    {neighborhoods.filter(n => n.id !== 'todos').map((n) => (
                      <option key={n.id} value={n.name}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  Detalles de la tarea a realizar
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explicá medidas aproximadas, si tenés materiales comprados, etc."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  ¿Con qué urgencia lo necesitas?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'normal', label: 'Sin apuro' },
                    { id: 'semana', label: 'Esta semana' },
                    { id: 'urgente', label: 'Urgente hoy' }
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id as any)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        urgency === u.id
                          ? 'border-[#9e4300] bg-[#ffdbcb]/30 text-[#783100] font-bold'
                          : 'border-[#e2e8f0] text-[#43474d]'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#c3c6ce] text-xs font-semibold text-[#43474d]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#0f2942] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow hover:bg-[#001428] cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar solicitud</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD JOB PHOTO FOR CONTRACTED SERVICE */}
      {/* ========================================================================= */}
      {uploadingForReq && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0f2942] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#a3f69c]" />
                <div>
                  <h3 className="font-bold text-sm">Certificar Obra Realizada</h3>
                  <p className="text-[10px] text-[#ffdbcb]">
                    Orden #{uploadingForReq.contractNumber || 'ORD-VALLE-2026'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadingForReq(null)}
                className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhotoForReq} className="p-4 space-y-3.5">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                <p className="font-bold text-emerald-950">{uploadingForReq.title}</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Profesional: <strong>{uploadingForReq.quotedBy || 'Asignado'}</strong> • Localidad: <strong>{uploadingForReq.neighborhood}</strong>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  Foto de la obra o reparación *
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="flex-1 w-full flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#9e4300]/40 rounded-xl bg-white hover:bg-orange-50/40 cursor-pointer transition-colors">
                    <ImageIcon className="w-6 h-6 text-[#9e4300] mb-1" />
                    <span className="text-xs font-semibold text-[#001428]">
                      {isProcessingUpload ? 'Cargando foto...' : 'Seleccionar desde galería'}
                    </span>
                    <span className="text-[10px] text-[#74777e]">
                      JPG, PNG o WebP
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {photoUrlInput && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#9e4300] shrink-0 bg-black">
                      <img 
                        src={photoUrlInput} 
                        alt="Vista previa" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#74777e]">O elegir foto de prueba:</span>
                  <button
                    type="button"
                    onClick={() => setPhotoUrlInput('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80')}
                    className="text-[10px] bg-white border border-[#c3c6ce] px-2 py-0.5 rounded-md hover:bg-gray-50 text-[#001428]"
                  >
                    Plomería
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUrlInput('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80')}
                    className="text-[10px] bg-white border border-[#c3c6ce] px-2 py-0.5 rounded-md hover:bg-gray-50 text-[#001428]"
                  >
                    Construcción
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  Comentario técnico de la tarea
                </label>
                <textarea
                  rows={2}
                  value={photoCommentInput}
                  onChange={(e) => setPhotoCommentInput(e.target.value)}
                  placeholder="Detalles de materiales, garantía brindada y solución realizada..."
                  className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadingForReq(null)}
                  className="px-3 py-2 text-xs text-[#74777e] hover:text-[#001428] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f2942] text-white text-xs font-bold rounded-xl hover:bg-[#001428] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-[#a3f69c]" />
                  <span>Publicar Foto Certificada</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REAL-TIME CHAT & 30-DAY SECURITY LOG */}
      {/* ========================================================================= */}
      {activeChatRequest && (
        <RequestChatModal
          isOpen={Boolean(activeChatRequest)}
          onClose={() => setActiveChatRequest(null)}
          request={activeChatRequest}
          loggedInPro={loggedInPro}
          userProfile={userProfile}
          onOpenReport={onOpenReport}
        />
      )}
    </div>
  );
};
