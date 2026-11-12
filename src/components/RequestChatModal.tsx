import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Check, 
  User, 
  Sparkles, 
  MessageCircle, 
  AlertCircle,
  Phone,
  CheckCheck,
  Calendar,
  Lock,
  ChevronDown,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { ServiceRequest, Professional, ChatMessage, UserProfile } from '../types';
import { subscribeToChatMessages, sendChatMessage, getRemainingSecurityDays } from '../utils/chatService';
import { getOrCreateDeviceId, getStoredDevicePhone } from '../utils/deviceTracker';

interface RequestChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  loggedInPro?: Professional | null;
  userProfile?: UserProfile;
  onOpenReport?: (req: ServiceRequest) => void;
  onSendQuote?: (reqId: string, quoteAmount: number, quoteNote?: string) => void;
}

const QUICK_SUGGESTIONS_VECINO = [
  '¿Podrías pasar a revisar el trabajo hoy o mañana?',
  '¿El presupuesto estimado incluye materiales o solo mano de obra?',
  'Coordinemos el día y la hora para que vengas.',
  '¿Ofrecés garantía por este trabajo?',
  'Te confirmo mi domicilio en el Valle de Lerma.'
];

const QUICK_SUGGESTIONS_PRO = [
  'Hola, puedo pasar a revisar sin cargo para darte el presupuesto exacto.',
  '¿Para qué fecha necesitás que esté listo el trabajo?',
  'Tengo disponibilidad inmediata para comenzar esta semana.',
  '¿Podrías enviarme más detalles o fotos del lugar?',
  'Presupuesto listo y con garantía de trabajo.'
];

export const RequestChatModal: React.FC<RequestChatModalProps> = ({
  isOpen,
  onClose,
  request,
  loggedInPro,
  userProfile,
  onOpenReport,
  onSendQuote
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [showQuoteBox, setShowQuoteBox] = useState(false);
  const [chatQuoteAmount, setChatQuoteAmount] = useState(
    request?.quoteAmount ? String(request.quoteAmount) : ''
  );
  const [chatQuoteNote, setChatQuoteNote] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatChatARS = (val: string | number): string => {
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

  const parsedChatQuote = parseFloat(String(chatQuoteAmount).replace(',', '.')) || 0;

  const handleChatSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request || !onSendQuote) return;
    const amount = parseFloat(String(chatQuoteAmount).replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;
    const rounded = Math.round(amount * 100) / 100;

    onSendQuote(request.id, rounded, chatQuoteNote.trim() || undefined);
    setShowQuoteBox(false);

    // Send a message notifying about the quote
    await handleSendMessage(
      `📋 Presupuesto formal enviado: ${formatChatARS(rounded)} ARS${chatQuoteNote.trim() ? ` (${chatQuoteNote.trim()})` : ''}. Podés aceptarlo para iniciar el trabajo con garantía de trazabilidad.`
    );
  };

  // Determinar identidad y rol del usuario actual
  const isProvider = Boolean(loggedInPro);
  const currentUserId = isProvider ? (loggedInPro?.id || 'pro-unknown') : getOrCreateDeviceId();
  const currentUserName = isProvider 
    ? (loggedInPro?.name || 'Prestador') 
    : (userProfile?.name || 'Vecino del Valle');
  const currentUserRole: 'vecino' | 'prestador' = isProvider ? 'prestador' : 'vecino';
  const currentUserAvatar = isProvider ? loggedInPro?.avatar : userProfile?.avatar;

  // Interlocutor
  const otherPartyName = isProvider 
    ? (request?.clientName || 'Vecino solicitante') 
    : (request?.quotedBy || 'Prestador del Valle');

  // Suscribirse a los mensajes en tiempo real
  useEffect(() => {
    if (!isOpen || !request?.id) return;
    const unsubscribe = subscribeToChatMessages(request.id, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [isOpen, request?.id]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!isOpen || !request) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');

    // Optimistic UI update: mostrar inmediatamente el mensaje en pantalla
    const optimisticMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      requestId: request.id,
      requestTitle: request.title,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderAvatar: currentUserAvatar,
      text,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      securityLogHash: `SEC30D-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      deviceId: getOrCreateDeviceId(),
      read: true
    };

    setMessages(prev => {
      if (prev.some(m => m.id === optimisticMsg.id || (m.text === text && Math.abs(new Date(m.createdAt).getTime() - Date.now()) < 1500))) {
        return prev;
      }
      return [...prev, optimisticMsg];
    });

    try {
      await sendChatMessage({
        requestId: request.id,
        requestTitle: request.title,
        senderId: currentUserId,
        senderName: currentUserName,
        senderRole: currentUserRole,
        senderAvatar: currentUserAvatar,
        deviceId: getOrCreateDeviceId(),
        text
      });
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const suggestions = isProvider ? QUICK_SUGGESTIONS_PRO : QUICK_SUGGESTIONS_VECINO;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh] sm:h-[85vh]">
        {/* Header con interlocutor y contexto del pedido */}
        <div className="p-3.5 bg-gradient-to-r from-[#001428] via-[#0f2942] to-[#1c3a5e] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              {isProvider ? (
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400 text-blue-300 flex items-center justify-center font-bold text-sm">
                  <User className="w-5 h-5" />
                </div>
              ) : request.quotedByAvatar ? (
                <img
                  src={request.quotedByAvatar}
                  alt={otherPartyName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-orange-400"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-400 text-orange-300 flex items-center justify-center font-bold text-xs">
                  PRO
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-sm text-white truncate">
                  {otherPartyName}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  En línea
                </span>
              </div>
              <p className="text-[11px] text-[#d3e4fe] truncate flex items-center gap-1 mt-0.5">
                <span className="font-semibold text-amber-300">{request.trade}</span>
                <span>• {request.neighborhood}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onOpenReport && (
              <button
                type="button"
                onClick={() => onOpenReport(request)}
                className="px-2 py-1 text-[11px] font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Hacer un reclamo o reporte sobre esta solicitud"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Hacer Reclamo</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowSecurityInfo(!showSecurityInfo)}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Información del registro de seguridad de 30 días"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner de Registro de Seguridad (30 Días de Resguardo Legal / Antifraude) */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-3.5 py-2 text-xs text-amber-950 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="text-[11px] font-medium leading-tight text-amber-900 truncate">
              <strong>Registro de Seguridad Activo:</strong> Los mensajes se respaldan por 30 días para evitar inconvenientes y proteger a ambas partes.
            </span>
          </div>
          <span className="text-[10px] font-bold font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200">
            30 Días
          </span>
        </div>

        {/* Desplegable explicativo de seguridad si se toca el escudo */}
        {showSecurityInfo && (
          <div className="p-3 bg-slate-900 text-slate-200 text-xs border-b border-slate-800 space-y-1.5 shrink-0 animate-in fade-in duration-150">
            <div className="flex items-center justify-between font-bold text-amber-300 text-[11px]">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Política de Seguridad y Transparencia del Valle de Lerma:
              </span>
              <button
                type="button"
                onClick={() => setShowSecurityInfo(false)}
                className="text-slate-400 hover:text-white text-[10px] cursor-pointer"
              >
                Ocultar
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Cada mensaje intercambiado se almacena con marca de tiempo criptográfica y se conserva durante <strong>todo el tiempo que dure el trabajo</strong> (desde la solicitud y presupuesto hasta el pago y la conformidad mutua). Una vez finalizado el trabajo y aceptado el pago, los registros se resguardan por <strong>30 días adicionales</strong> para garantía legal y resolución de reclamos.
            </p>
          </div>
        )}

        {/* Resumen del pedido en cabecera */}
        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0 flex-wrap gap-2">
          <div className="truncate min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#9e4300] block">Solicitud Vinculada</span>
            <span className="font-bold text-slate-800 truncate block">{request.title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {request.quoteAmount && (
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                Cotizado: ${request.quoteAmount.toLocaleString('es-AR')}
              </span>
            )}
            {onSendQuote && isProvider && (
              <button
                type="button"
                onClick={() => setShowQuoteBox(!showQuoteBox)}
                className="px-2.5 py-1 bg-[#9e4300] hover:bg-[#853900] active:scale-95 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{request.quoteAmount ? 'Modificar Monto' : 'Cargar Presupuesto'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Panel Desplegable para Cargar o Modificar Presupuesto en el Chat */}
        {showQuoteBox && (
          <form onSubmit={handleChatSubmitQuote} className="p-3 bg-amber-50/90 border-b border-amber-300 space-y-2.5 shrink-0 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-[#9e4300]" />
                Monto estimado de mano de obra / trabajo ($ ARS):
              </span>
              <button
                type="button"
                onClick={() => setShowQuoteBox(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={chatQuoteAmount}
                    onChange={(e) => setChatQuoteAmount(e.target.value)}
                    placeholder="0.00 (ej: 25000 o 25400.50)"
                    className="w-full text-sm font-bold pl-7 pr-3 py-2 rounded-xl border border-amber-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#9e4300] font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={parsedChatQuote <= 0}
                  className="px-4 py-2 bg-[#9e4300] hover:bg-[#853900] active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirmar e Informar</span>
                </button>
              </div>

              {/* Formateador ARS en tiempo real */}
              {parsedChatQuote > 0 && (
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-300 flex items-center justify-between text-xs animate-in fade-in">
                  <span className="text-emerald-900 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Monto formateado en pesos:
                  </span>
                  <span className="font-bold text-emerald-950 font-mono">
                    {formatChatARS(chatQuoteAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* Presets rápidos */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-amber-900 font-bold">Valores rápidos:</span>
              {[15000, 25000, 40000, 60000, 90000, 150000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setChatQuoteAmount(val.toString())}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-amber-950 border border-amber-300 hover:bg-orange-100 cursor-pointer"
                >
                  ${(val / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </form>
        )}

        {/* Lista de Mensajes en Tiempo Real */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#f8fafc]">
          {/* Mensaje de Bienvenida del Sistema */}
          <div className="text-center my-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-slate-200/80 text-slate-700">
              <Lock className="w-3 h-3 text-slate-500" />
              Canal directo seguro entre {request.clientName || 'Vecino'} y {otherPartyName}
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-slate-500">
              <MessageCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Aún no hay mensajes en esta solicitud</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Podés escribir una consulta directa o utilizar una de las respuestas rápidas de abajo para coordinar la visita.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUserId || (isProvider && msg.senderRole === 'prestador') || (!isProvider && msg.senderRole === 'vecino');
              const remainingDays = getRemainingSecurityDays(msg.expiresAt);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-end gap-1.5 max-w-[85%] sm:max-w-[75%]">
                    {!isMine && (
                      <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mb-1">
                        {msg.senderName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isMine
                          ? 'bg-[#0f2942] text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {/* Remitente cuando no es mío */}
                      {!isMine && (
                        <p className="font-bold text-[10px] text-[#9e4300] mb-0.5">
                          {msg.senderName} ({msg.senderRole === 'prestador' ? 'Prestador' : 'Vecino'})
                        </p>
                      )}

                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                      <div
                        className={`mt-1 flex items-center justify-end gap-1.5 text-[9px] ${
                          isMine ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {isMine && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Etiqueta de Resguardo 30d */}
                  <span className={`text-[8px] font-mono text-slate-400 px-1 ${isMine ? 'text-right' : 'text-left'}`}>
                    Respaldo legal: {remainingDays}d restantes ({msg.securityLogHash?.substring(0, 10)})
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Respuestas Rápidas Sugeridas */}
        <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Sugerencias:
          </span>
          {suggestions.map((sug, idx) => (
            <div
              key={idx}
              className="inline-flex items-center bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-[11px] font-medium text-slate-700 shadow-2xs overflow-hidden shrink-0 transition-colors"
            >
              <button
                type="button"
                onClick={() => setInputText(sug)}
                className="px-2.5 py-1 hover:text-[#9e4300] cursor-pointer"
                title="Elegir y escribir en el campo de texto"
              >
                {sug}
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage(sug)}
                className="px-1.5 py-1 bg-amber-50 hover:bg-[#9e4300] hover:text-white text-[#9e4300] border-l border-slate-200 cursor-pointer transition-colors"
                title="Enviar esta sugerencia directamente"
              >
                <Send className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Input de Mensaje */}
        <form 
          onSubmit={handleFormSubmit} 
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Escribir a ${otherPartyName}...`}
            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9e4300] focus:bg-white transition-all text-[#001428]"
            disabled={isSending}
          />
          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            disabled={!inputText.trim() || isSending}
            className="w-10 h-10 bg-[#9e4300] hover:bg-[#853900] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
            title="Enviar mensaje en tiempo real"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
