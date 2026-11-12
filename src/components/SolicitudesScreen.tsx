import React, { useState, useEffect, useRef } from 'react';
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
  AlertTriangle,
  Phone,
  WifiOff
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
  onConfirmPayment?: (reqId: string, method?: 'efectivo' | 'transferencia' | 'mercado_pago') => void;
  onNavigateToSerPro?: () => void;
  onOpenReport?: (req?: ServiceRequest | null) => void;
  isOnline?: boolean;
  lastSyncedAt?: string;
}

// Helper to calculate days elapsed since last status change or request creation
export const calculateDaysWithoutUpdate = (req: ServiceRequest): number => {
  const targetDateStr = req.updatedAt || req.createdAt;
  if (!targetDateStr) return 0;

  // Try ISO parse
  const timestamp = Date.parse(targetDateStr);
  if (!isNaN(timestamp)) {
    const diff = Date.now() - timestamp;
    return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
  }

  // Parse relative strings in mock data
  const lower = targetDateStr.toLowerCase();
  if (lower.includes('meses')) {
    const match = lower.match(/hace\s+(\d+)\s+meses/);
    return match ? parseInt(match[1], 10) * 30 : 60;
  }
  if (lower.includes('mes')) {
    return 30;
  }
  if (lower.includes('semanas')) {
    const match = lower.match(/hace\s+(\d+)\s+semanas/);
    return match ? parseInt(match[1], 10) * 7 : 14;
  }
  if (lower.includes('semana')) {
    return 7;
  }
  if (lower.includes('días') || lower.includes('dias')) {
    const match = lower.match(/hace\s+(\d+)\s+d[íi]as/);
    return match ? parseInt(match[1], 10) : 3;
  }
  if (lower.includes('ayer')) {
    return 1;
  }
  return 0;
};

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
  onConfirmPayment,
  onNavigateToSerPro,
  onOpenReport,
  isOnline = true,
  lastSyncedAt
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
  const [proFilter, setProFilter] = useState<'todos' | 'nuevos' | 'cotizados' | 'contratados' | 'atencion'>('nuevos');

  // Modal to send quote from provider
  const [quotingRequest, setQuotingRequest] = useState<ServiceRequest | null>(null);
  const [quoteAmountInput, setQuoteAmountInput] = useState<string>('');
  const [quoteNoteInput, setQuoteNoteInput] = useState<string>('');
  const [selectedPhotoLightbox, setSelectedPhotoLightbox] = useState<string | null>(null);

  // Formateador de moneda Pesos Argentinos (ARS) en tiempo real con soporte de centavos
  const formatARS = (val: string | number): string => {
    if (val === '' || val === null || val === undefined) return '$ 0,00';
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
    if (isNaN(num)) return '$ 0,00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const handleSetPresetAmount = (preset: number) => {
    setQuoteAmountInput(preset.toString());
  };

  const parsedQuoteAmount = parseFloat(String(quoteAmountInput).replace(',', '.')) || 0;

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

  // Photo upload for completed jobs and progress
  const [uploadingForReq, setUploadingForReq] = useState<ServiceRequest | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoCommentInput, setPhotoCommentInput] = useState('');
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startLiveCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsLiveCameraActive(true);
    } catch (err) {
      console.warn('Error al iniciar cámara en vivo:', err);
      setCameraError('No se pudo activar la cámara web directa. Podés usar el botón para abrir la cámara de tu celular.');
    }
  };

  const captureLivePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoUrlInput(dataUrl);
        stopLiveCamera();
      }
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  const handleClosePhotoModal = () => {
    stopLiveCamera();
    setUploadingForReq(null);
    setPhotoUrlInput('');
    setPhotoCommentInput('');
    setCameraError(null);
  };

  // Submit quote from provider
  const handleSendQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotingRequest || !onSendQuote) return;
    const amount = parseFloat(String(quoteAmountInput).replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    const rounded = Math.round(amount * 100) / 100;

    onSendQuote(quotingRequest.id, rounded, quoteNoteInput.trim() || undefined);
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

  // Upload photo file (STRICT REAL-TIME CAMERA ONLY - BLOCKS GALLERY FILES)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCameraError(null);
      // Validar que la foto no provenga de una galería antigua
      const now = Date.now();
      const fileTime = file.lastModified;
      const diffMinutes = Math.abs(now - fileTime) / (1000 * 60);

      if (fileTime && diffMinutes > 20) {
        setCameraError('⚠️ Carga bloqueada: La foto seleccionada fue tomada hace más de 20 minutos o proviene de la galería. Por normas de certificación y seguridad, debés sacar la foto en vivo en el lugar de la obra.');
        e.target.value = '';
        return;
      }

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

  // Provider calculations: Filtro estricto para mostrar solo los trabajos solicitados a este prestador
  const isTradeRelevant = (reqTrade: string, proTrade: string) => {
    const r = reqTrade.toLowerCase();
    const p = proTrade.toLowerCase();
    return r.includes(p) || p.includes(r) || p.split(' ').some(word => word.length > 3 && r.includes(word));
  };

  // 1. Solicitudes pedidas directamente a este trabajador (por ID, nombre, teléfono o mención directa)
  const isJobRequestedToMe = (req: ServiceRequest): boolean => {
    if (!loggedInPro) return false;
    if (req.assignedWorkerId && req.assignedWorkerId === loggedInPro.id) return true;
    if (req.quotedBy && req.quotedBy.toLowerCase() === loggedInPro.name.toLowerCase()) return true;
    if (req.phoneContact && loggedInPro.phone && req.phoneContact.replace(/\D/g, '') === loggedInPro.phone.replace(/\D/g, '')) return true;
    if (req.title && req.title.toLowerCase().includes(loggedInPro.name.toLowerCase())) return true;
    if (req.description && req.description.toLowerCase().includes(loggedInPro.name.toLowerCase())) return true;
    return false;
  };

  // 2. Solicitudes abiertas del mismo rubro que no estén asignadas a otro profesional
  const isGeneralJobForMyTrade = (req: ServiceRequest): boolean => {
    if (!loggedInPro) return false;
    // Si ya está asignado o contratado por otro profesional específico, no mostrar a este prestador
    if (req.assignedWorkerId && req.assignedWorkerId !== loggedInPro.id) return false;
    if (req.quotedBy && req.quotedBy.toLowerCase() !== loggedInPro.name.toLowerCase() && (req.status === 'contratado' || req.status === 'completado')) return false;
    return isTradeRelevant(req.trade, loggedInPro.trade);
  };

  const proRelevantRequests = loggedInPro
    ? requests.filter(r => isJobRequestedToMe(r) || isGeneralJobForMyTrade(r))
    : [];

  const proRequestsToDisplay = loggedInPro
    ? requests.filter(req => {
        if (proFilter === 'nuevos') {
          return req.status === 'en_espera' && (isJobRequestedToMe(req) || isGeneralJobForMyTrade(req));
        }
        if (proFilter === 'cotizados') {
          return req.status === 'cotizado' && (isJobRequestedToMe(req) || req.quotedBy === loggedInPro.name);
        }
        if (proFilter === 'contratados') {
          return (req.status === 'contratado' || req.status === 'completado') && isJobRequestedToMe(req);
        }
        if (proFilter === 'atencion') {
          return (isJobRequestedToMe(req) || isGeneralJobForMyTrade(req)) && 
                 req.status !== 'completado' && 
                 calculateDaysWithoutUpdate(req) >= 7;
        }
        // 'todos': únicamente trabajos solicitados a este trabajador o de su rubro directo
        return isJobRequestedToMe(req) || isGeneralJobForMyTrade(req);
      })
    : [];

  const proAttentionCount = proRelevantRequests.filter(
    r => r.status !== 'completado' && calculateDaysWithoutUpdate(r) >= 7
  ).length;

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
      {/* Banner de Modo Sin Conexión para Solicitudes */}
      {!isOnline && (
        <div className="mb-3 p-3 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-center justify-between gap-2.5 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <WifiOff className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-amber-950 truncate">
                Modo Sin Conexión • Información Desactualizada
              </p>
              <p className="text-[11px] text-amber-900 truncate">
                Mostrando pedidos guardados localmente. Los presupuestos y chats se actualizarán al volver a tener internet.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded shrink-0">
            Copia Local
          </span>
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
              { id: 'nuevos', label: 'Nuevos pedidos', count: requests.filter(r => r.status === 'en_espera' && (isJobRequestedToMe(r) || isGeneralJobForMyTrade(r))).length },
              { id: 'cotizados', label: 'Mis cotizaciones', count: requests.filter(r => r.status === 'cotizado' && (isJobRequestedToMe(r) || r.quotedBy === loggedInPro.name)).length },
              { id: 'contratados', label: 'Asignados', count: requests.filter(r => (r.status === 'contratado' || r.status === 'completado') && isJobRequestedToMe(r)).length },
              { id: 'atencion', label: 'Atención Necesaria', count: proAttentionCount, isAttention: true },
              { id: 'todos', label: 'Todos', count: proRelevantRequests.length }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setProFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 text-xs ${
                  proFilter === tab.id
                    ? tab.isAttention
                      ? 'bg-amber-600 text-white shadow-2xs font-black'
                      : 'bg-[#9e4300] text-white shadow-2xs'
                    : tab.isAttention && tab.count > 0
                    ? 'bg-amber-50 text-amber-900 border-2 border-amber-300 hover:bg-amber-100 font-bold'
                    : 'bg-white text-[#43474d] border border-[#e2e8f0] hover:bg-[#f8f9ff]'
                }`}
              >
                {tab.isAttention && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  proFilter === tab.id 
                    ? 'bg-white/25 text-white' 
                    : tab.isAttention && tab.count > 0
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-[#001428]'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Banner de alerta de solicitudes que requieren atención urgente (+7 días) */}
          {proAttentionCount > 0 && proFilter !== 'atencion' && (
            <div 
              onClick={() => setProFilter('atencion')}
              className="p-3 rounded-xl bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 border-2 border-amber-400/90 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-amber-100 transition-all shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-amber-950 truncate">
                    {proAttentionCount} {proAttentionCount === 1 ? 'servicio requiere atención' : 'servicios requieren atención'} (+7 días sin cambios)
                  </p>
                  <p className="text-[11px] text-amber-900 truncate">
                    Identificá prioridades de respuesta y obras demoradas
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg shrink-0 shadow-xs">
                Ver Prioridades
              </span>
            </div>
          )}

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
                    : proFilter === 'atencion'
                    ? '¡Excelente! No tenés solicitudes pendientes con más de 7 días sin actualización.'
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
                const daysWithoutUpdate = calculateDaysWithoutUpdate(req);
                const needsAttention = daysWithoutUpdate >= 7 && req.status !== 'completado';

                return (
                  <article
                    key={req.id}
                    className={`bg-white rounded-2xl p-4 border transition-all space-y-3 ${
                      needsAttention
                        ? 'border-amber-400 ring-2 ring-amber-300 shadow-md bg-amber-50/15'
                        : isContractedToMe
                        ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-xs'
                        : isQuotedByMe
                        ? 'border-blue-300 shadow-2xs'
                        : 'border-[#e2e8f0] shadow-2xs'
                    }`}
                  >
                    {/* Indicador visual de Atención Necesaria (+7 días sin actualización) */}
                    {needsAttention && (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs animate-in fade-in duration-150">
                        <div className="flex items-center gap-2 min-w-0">
                          <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-bounce" />
                          <div className="min-w-0">
                            <p className="text-xs font-black tracking-wide flex items-center gap-1.5 flex-wrap">
                              <span>ATENCIÓN NECESARIA</span>
                              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                                {daysWithoutUpdate} días sin cambio de estado
                              </span>
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-wider bg-black/25 px-2 py-0.5 rounded-md shrink-0">
                          Prioritario
                        </span>
                      </div>
                    )}

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

                    {/* Recomendación de acción inmediata para el profesional si requiere atención */}
                    {needsAttention && (
                      <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-300 text-xs text-amber-950 flex items-start gap-2 shadow-2xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-relaxed">
                          {req.status === 'en_espera' && (
                            <p>
                              <strong>Solicitud prioritaria sin cotizar:</strong> Lleva {daysWithoutUpdate} días esperando presupuesto. Presupuestá hoy para ser el profesional preferido del vecino.
                            </p>
                          )}
                          {req.status === 'cotizado' && (
                            <p>
                              <strong>Presupuesto sin respuesta:</strong> Hace {daysWithoutUpdate} días enviaste tu cotización. Podés abrir el chat seguro para consultar dudas al cliente y reactivar el trabajo.
                            </p>
                          )}
                          {req.status === 'contratado' && (
                            <p>
                              <strong>Obra en curso demorada:</strong> Lleva {daysWithoutUpdate} días sin registrar avance. Subí una foto certificada de progreso con la cámara para actualizar el estado.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

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

                        {/* Alerta de inactividad de más de 15 días en obras asignadas */}
                        {(() => {
                          const contractDate = req.updatedAt || req.createdAt;
                          const daysWithoutMovement = contractDate 
                            ? Math.floor((Date.now() - new Date(contractDate).getTime()) / (1000 * 60 * 60 * 24))
                            : 0;
                          const isInactiveOver15Days = daysWithoutMovement >= 15 && req.status === 'contratado';

                          if (isInactiveOver15Days) {
                            return (
                              <div className="mt-1 p-3 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-2 shadow-2xs">
                                <div className="flex items-center gap-1.5 font-black text-xs text-amber-900">
                                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                                  <span>⚠️ Obra sin movimiento ({daysWithoutMovement} días sin nuevo reporte)</span>
                                </div>
                                <p className="text-[11px] text-amber-900 leading-snug">
                                  Esta obra asignada supera los 15 días en curso. Para garantizar la trazabilidad al cliente y administración, <strong>el sistema exige tomar y subir una foto de avance real con la cámara</strong>.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUploadingForReq(req);
                                    setPhotoUrlInput('');
                                    setPhotoCommentInput('');
                                    setCameraError(null);
                                  }}
                                  className="w-full py-2 px-3 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                                >
                                  <Camera className="w-3.5 h-3.5 text-white" />
                                  <span>Tomar Foto de Avance con Cámara Ahora (Requerido)</span>
                                </button>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Foto previa si ya existe */}
                        {req.completedJobPhoto && (
                          <div className="pt-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900 mb-1">
                              <span className="flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Foto de obra certificada</span>
                              </span>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Tocá para ampliar
                              </span>
                            </div>
                            <div
                              onClick={() => setSelectedPhotoLightbox(req.completedJobPhoto || null)}
                              className="relative cursor-pointer group overflow-hidden rounded-xl border border-emerald-300 shadow-2xs"
                              title="Tocar para ver en tamaño completo"
                            >
                              <img
                                src={req.completedJobPhoto}
                                alt="Obra finalizada"
                                className="w-full h-36 object-cover group-hover:scale-102 transition-transform duration-200"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                🔍 Ver en pantalla completa
                              </div>
                            </div>
                            {req.completedJobComment && (
                              <p className="text-xs text-[#43474d] italic bg-white/80 p-2 rounded-lg mt-1 border border-emerald-100">
                                "{req.completedJobComment}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Botón disponible para TODOS los pedidos asignados */}
                        <button
                          type="button"
                          onClick={() => {
                            setUploadingForReq(req);
                            setPhotoUrlInput('');
                            setPhotoCommentInput('');
                            setCameraError(null);
                          }}
                          className="w-full py-2 bg-[#001428] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#0f2942] cursor-pointer shadow-xs active:scale-98 transition-all"
                        >
                          <Camera className="w-4 h-4 text-[#ffdbcb]" />
                          <span>
                            {req.completedJobPhoto 
                              ? '📸 Actualizar / Tomar Nueva Foto de Avance (Cámara)' 
                              : '📸 Subir Foto de Avance de Obra (Cámara en Vivo)'}
                          </span>
                        </button>

                        {/* Trazabilidad del Pago de la Obra para el Prestador */}
                        {req.paymentStatus === 'confirmado' ? (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-100/90 border border-emerald-300 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              <span>Pago Registrado y Acreditado ({req.paymentMethod?.toUpperCase() || 'REGISTRADO'})</span>
                            </div>
                            <span className="font-mono text-[10px] text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300 font-bold">
                              Recibo #{req.paymentReceiptNumber || `REC-${req.id.replace('req-', '').slice(-4)}`}
                            </span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div>
                              <span className="font-bold text-amber-950 block">Cobro de la Obra: Pendiente de cobro</span>
                              <span className="text-[10px] text-amber-900">
                                Monto a cobrar: ${req.quoteAmount?.toLocaleString('es-AR') || 'A convenir'}
                              </span>
                            </div>
                            {onConfirmPayment && (
                              <button
                                type="button"
                                onClick={() => onConfirmPayment(req.id, 'efectivo')}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-2xs transition-all"
                              >
                                <DollarSign className="w-3.5 h-3.5 text-emerald-200" />
                                <span>Marcar Pago Recibido</span>
                              </button>
                            )}
                          </div>
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

                      {/* Modify Quote Button if already quoted */}
                      {isQuotedByMe && onSendQuote && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuotingRequest(req);
                            setQuoteAmountInput(req.quoteAmount ? req.quoteAmount.toLocaleString('es-AR') : '');
                            setQuoteNoteInput(req.completedJobComment || '');
                          }}
                          className="w-full h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Modificar Monto Presupuestado (${req.quoteAmount?.toLocaleString('es-AR')})</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        {/* Chat en Vivo integrado en app con resguardo 30 días */}
                        <button
                          type="button"
                          onClick={() => setActiveChatRequest(req)}
                          className="w-full h-10 rounded-xl bg-[#001428] hover:bg-[#0f2942] active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                          title="Chat directo en la plataforma con copia de seguridad por 30 días"
                        >
                          <MessageCircle className="w-4 h-4 text-amber-300" />
                          <span>Chat en Vivo de la Solicitud (Resguardo 30d)</span>
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
                const daysWithoutUpdate = calculateDaysWithoutUpdate(req);
                const needsAttention = daysWithoutUpdate >= 7 && !isCompleted;

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-2xl p-4 border transition-shadow space-y-3 ${
                      needsAttention
                        ? 'border-amber-400 ring-2 ring-amber-200/70 shadow-sm'
                        : isContracted || isCompleted
                        ? 'border-emerald-300 shadow-xs ring-1 ring-emerald-100'
                        : 'border-[#e2e8f0] shadow-2xs'
                    }`}
                  >
                    {/* Indicador de Atención si supera los 7 días */}
                    {needsAttention && (
                      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Atención: {daysWithoutUpdate} días sin cambios de estado</span>
                        </div>
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                          Pendiente
                        </span>
                      </div>
                    )}

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

                        {/* Alerta de inactividad de más de 15 días en obras contratadas */}
                        {(() => {
                          const contractDate = req.updatedAt || req.createdAt;
                          const daysWithoutMovement = contractDate 
                            ? Math.floor((Date.now() - new Date(contractDate).getTime()) / (1000 * 60 * 60 * 24))
                            : 0;
                          const isInactiveOver15Days = daysWithoutMovement >= 15 && req.status === 'contratado';

                          if (isInactiveOver15Days) {
                            return (
                              <div className="mt-1 p-3 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-2 shadow-2xs">
                                <div className="flex items-center gap-1.5 font-black text-xs text-amber-900">
                                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                                  <span>⚠️ Obra sin movimiento ({daysWithoutMovement} días sin nuevo reporte)</span>
                                </div>
                                <p className="text-[11px] text-amber-900 leading-snug">
                                  Esta obra asignada supera los 15 días en curso. Para garantizar la trazabilidad al cliente y auditoría, <strong>el sistema exige tomar y subir una foto de avance real con la cámara</strong>.
                                </p>
                                {onUploadJobPhoto && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setUploadingForReq(req);
                                      setPhotoUrlInput('');
                                      setPhotoCommentInput('');
                                      setCameraError(null);
                                    }}
                                    className="w-full py-2 px-3 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                                  >
                                    <Camera className="w-3.5 h-3.5 text-white" />
                                    <span>Tomar Foto de Avance con Cámara Ahora (Requerido)</span>
                                  </button>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Completed or progress job photo preview if available */}
                        {req.completedJobPhoto && (
                          <div className="mt-1 bg-white p-2.5 rounded-xl border border-emerald-200 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                              <span className="flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                                Foto Certificada de Avance / Trabajo Realizado
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold">Trazabilidad App</span>
                            </div>
                            <div
                              onClick={() => setSelectedPhotoLightbox(req.completedJobPhoto || null)}
                              className="relative cursor-pointer group overflow-hidden rounded-lg border border-emerald-300"
                              title="Tocar para ampliar foto"
                            >
                              <img
                                src={req.completedJobPhoto}
                                alt="Foto de la obra"
                                className="w-full h-40 object-cover group-hover:scale-102 transition-transform duration-200"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                🔍 Ver en pantalla completa
                              </div>
                            </div>
                            {req.completedJobComment && (
                              <p className="text-xs text-[#43474d] italic bg-gray-50 p-2 rounded-lg">
                                "{req.completedJobComment}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Botón para subir o actualizar fotos de avances de obra en cualquier momento */}
                        {onUploadJobPhoto && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setUploadingForReq(req);
                                setPhotoUrlInput('');
                                setPhotoCommentInput('');
                                setCameraError(null);
                              }}
                              className="w-full h-9 rounded-xl bg-[#0f2942] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#001428] active:scale-98 transition-all cursor-pointer shadow-xs"
                            >
                              <Camera className="w-3.5 h-3.5 text-[#ffdbcb]" />
                              <span>{req.completedJobPhoto ? '📸 Actualizar / Tomar Nueva Foto de Avance (Cámara)' : '📸 Tomar Foto de Avance de Obra (Cámara en Vivo)'}</span>
                            </button>
                          </div>
                        )}
                        {/* Trazabilidad del Pago de la Obra */}
                        {req.paymentStatus === 'confirmado' ? (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-100/90 border border-emerald-300 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                              <span>Pago de Obra Confirmado ({req.paymentMethod?.toUpperCase() || 'REGISTRADO'})</span>
                            </div>
                            <span className="font-mono text-[10px] text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300 font-bold">
                              Recibo #{req.paymentReceiptNumber || `REC-${req.id.replace('req-', '').slice(-4)}`}
                            </span>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <div>
                              <span className="font-bold text-amber-950 block">Trazabilidad de Pago: En gestión</span>
                              <span className="text-[10px] text-amber-900">
                                Total acordado: ${req.quoteAmount?.toLocaleString('es-AR') || 'A convenir'}
                              </span>
                            </div>
                            {onConfirmPayment && (
                              <button
                                type="button"
                                onClick={() => onConfirmPayment(req.id, 'efectivo')}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer shadow-2xs transition-all"
                              >
                                <DollarSign className="w-3.5 h-3.5 text-emerald-200" />
                                <span>Confirmar Pago Recibido / Efectuado</span>
                              </button>
                            )}
                          </div>
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
                              className="w-full h-9 rounded-lg bg-[#001428] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#0f2942] active:scale-95 transition-all cursor-pointer"
                              title="Chat directo seguro con resguardo de 30 días"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
                              <span>Chat en Vivo de la Cotización (Trazabilidad 30d)</span>
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
      {quotingRequest && (
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
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#001428] block">
                    Monto estimado de mano de obra / trabajo ($ ARS) *
                  </label>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Decimales (step='0.01')</span>
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-[#74777e] font-bold text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={quoteAmountInput}
                    onChange={(e) => setQuoteAmountInput(e.target.value)}
                    placeholder="0.00 (ej: 25000 o 25400.50)"
                    className="w-full text-base font-bold pl-8 pr-16 p-3 rounded-xl border-2 border-[#c3c6ce] focus:border-[#9e4300] focus:ring-2 focus:ring-[#ffdbcb] text-[#001428] bg-white transition-all shadow-2xs font-mono"
                  />
                  {quoteAmountInput && (
                    <button
                      type="button"
                      onClick={() => setQuoteAmountInput('')}
                      className="absolute right-3 top-3 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded cursor-pointer"
                    >
                      Borrar
                    </button>
                  )}
                </div>

                {/* Formateador de moneda en tiempo real (ARS) */}
                {parsedQuoteAmount > 0 ? (
                  <div className="mt-2.5 p-3 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-100/70 rounded-xl border-2 border-emerald-300 flex items-center justify-between text-xs animate-in fade-in duration-150 shadow-2xs">
                    <div className="space-y-0.5">
                      <span className="text-emerald-900 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Formato Oficial Pesos (ARS):
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        Presupuesto registrado con precisión
                      </span>
                    </div>
                    <span className="font-black text-emerald-950 text-base sm:text-lg font-mono">
                      {formatARS(quoteAmountInput)}
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#74777e] mt-1.5">
                    Ingresá el valor en pesos. Podés incluir centavos con punto decimal (ej: <code>18500.50</code>) o elegir un monto sugerido:
                  </p>
                )}

                {/* Botones de montos sugeridos y rápidos */}
                <div className="mt-2.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#74777e] tracking-wider block">
                    Valores sugeridos de mano de obra (Valle de Lerma):
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[15000, 25000, 40000, 60000, 90000, 150000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleSetPresetAmount(preset)}
                        className={`py-1.5 px-1 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                          parsedQuoteAmount === preset
                            ? 'bg-[#9e4300] text-white border-[#9e4300] shadow-xs'
                            : 'bg-white text-[#001428] border-gray-200 hover:bg-orange-50 hover:border-orange-200'
                        }`}
                      >
                        ${(preset / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>
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
                  className="flex-1 py-2.5 rounded-xl border border-[#c3c6ce] text-xs font-semibold text-[#43474d] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={parsedQuoteAmount <= 0}
                  className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all ${
                    parsedQuoteAmount > 0
                      ? 'bg-[#9e4300] hover:bg-[#853900] cursor-pointer active:scale-98'
                      : 'bg-gray-400 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    Enviar Presupuesto {parsedQuoteAmount > 0 ? `(${formatARS(quoteAmountInput)})` : ''}
                  </span>
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
                  Foto de Avance o Trabajo Realizado * (Solo Cámara en Vivo)
                </label>
                <p className="text-[11px] text-[#74777e] mb-2">
                  Por normas de certificación oficial y seguridad de las obras, <strong>no se admiten fotos guardadas en galería</strong>. Debés sacar la foto en tiempo real en el lugar de trabajo.
                </p>

                {cameraError && (
                  <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}

                {/* Viewfinder si la cámara en vivo está activa */}
                {isLiveCameraActive ? (
                  <div className="space-y-2 bg-black rounded-2xl p-2 overflow-hidden border border-[#9e4300]">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-widest flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" /> EN VIVO
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={stopLiveCamera}
                        className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold cursor-pointer"
                      >
                        Cancelar Cámara
                      </button>
                      <button
                        type="button"
                        onClick={captureLivePhoto}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Camera className="w-4 h-4 text-white" />
                        <span>Capturar Foto Ahora</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Botón para iniciar visor de cámara directa */}
                      <button
                        type="button"
                        onClick={startLiveCamera}
                        className="p-3 border-2 border-[#9e4300] bg-orange-50/60 hover:bg-orange-100/80 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group shadow-2xs"
                      >
                        <Camera className="w-6 h-6 text-[#9e4300] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-[#001428]">Abrir Visor de Cámara</span>
                        <span className="text-[10px] text-gray-500">Capturar directamente en la app</span>
                      </button>

                      {/* Input directo a cámara del dispositivo (capture="environment") */}
                      <label className="p-3 border-2 border-dashed border-[#9e4300]/50 hover:border-[#9e4300] bg-white hover:bg-orange-50/30 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group shadow-2xs">
                        <Camera className="w-6 h-6 text-[#9e4300] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-[#001428]">
                          {isProcessingUpload ? 'Procesando captura...' : 'Sacar Foto con el Celular'}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold">
                          Abre la cámara trasera automáticamente
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {photoUrlInput && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-emerald-400 shrink-0 bg-black">
                          <img 
                            src={photoUrlInput} 
                            alt="Foto tomada en vivo" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            Foto capturada en vivo lista
                          </p>
                          <p className="text-[10px] text-emerald-800">
                            Validación de fecha y hora en tiempo real completada.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
          onSendQuote={onSendQuote}
        />
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX MODAL: FULL PHOTO VIEWER */}
      {/* ========================================================================= */}
      {selectedPhotoLightbox && (
        <div 
          onClick={() => setSelectedPhotoLightbox(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-2xl w-full bg-[#001428] rounded-2xl overflow-hidden border border-white/20 shadow-2xl space-y-3 p-3 sm:p-4 cursor-default"
          >
            <div className="flex items-center justify-between text-white pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs sm:text-sm">Foto de Obra Certificada</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoLightbox(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
              <img
                src={selectedPhotoLightbox}
                alt="Foto de obra ampliada"
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-300 pt-1">
              <span>Certificada en Valle de Lerma</span>
              <button
                type="button"
                onClick={() => setSelectedPhotoLightbox(null)}
                className="px-3 py-1 bg-white text-[#001428] font-bold rounded-lg cursor-pointer hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
