import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Lightbulb, 
  Heart, 
  HelpCircle, 
  X, 
  Send, 
  CheckCircle2, 
  Smartphone, 
  ShieldCheck, 
  Copy, 
  Check,
  FileText
} from 'lucide-react';
import { UserProfile, ServiceRequest, UserFeedback } from '../types';
import { getOrCreateDeviceId } from '../utils/deviceTracker';
import { submitUserFeedback } from '../utils/feedbackService';

interface ReclamosSugerenciasModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  initialRequest?: ServiceRequest | null;
  requests?: ServiceRequest[];
  onFeedbackSubmitted?: (feedback: UserFeedback) => void;
}

export const ReclamosSugerenciasModal: React.FC<ReclamosSugerenciasModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  initialRequest,
  requests = [],
  onFeedbackSubmitted
}) => {
  const deviceId = getOrCreateDeviceId();
  const [copiedId, setCopiedId] = useState(false);

  // Form State
  const [feedbackType, setFeedbackType] = useState<'reclamo' | 'sugerencia' | 'felicitacion' | 'consulta'>(
    initialRequest ? 'reclamo' : 'reclamo'
  );
  const [title, setTitle] = useState(
    initialRequest ? `Reclamo sobre pedido: ${initialRequest.title}` : ''
  );
  const [description, setDescription] = useState('');
  const [userName, setUserName] = useState(userProfile?.name || '');
  const [userPhone, setUserPhone] = useState(userProfile?.phone || '');
  const [userNeighborhood, setUserNeighborhood] = useState(userProfile?.neighborhood || 'Cerrillos');
  const [selectedRequestId, setSelectedRequestId] = useState<string>(initialRequest?.id || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<UserFeedback | null>(null);

  if (!isOpen) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const relatedReq = requests.find(r => r.id === selectedRequestId) || initialRequest;
      const feedback = await submitUserFeedback({
        type: feedbackType,
        title: title.trim(),
        description: description.trim(),
        deviceId,
        userName: userName.trim() || 'Vecino del Valle',
        userPhone: userPhone.trim() || undefined,
        userNeighborhood,
        relatedRequestId: relatedReq?.id || (selectedRequestId ? selectedRequestId : undefined),
        relatedRequestTitle: relatedReq?.title || undefined,
        relatedProName: relatedReq?.quotedBy || undefined
      });

      setSubmittedTicket(feedback);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(feedback);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0f2942] text-white p-4.5 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              {feedbackType === 'reclamo' ? (
                <AlertTriangle className="w-5 h-5 text-amber-300" />
              ) : feedbackType === 'sugerencia' ? (
                <Lightbulb className="w-5 h-5 text-yellow-300" />
              ) : feedbackType === 'felicitacion' ? (
                <Heart className="w-5 h-5 text-rose-300" />
              ) : (
                <HelpCircle className="w-5 h-5 text-blue-300" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Reclamos y Sugerencias
              </h2>
              <p className="text-xs text-gray-300">
                Atención directa de la administración de Oficios Valle de Lerma
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submittedTicket ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#001428]">
                ¡Reclamo / Sugerencia Registrado!
              </h3>
              <p className="text-xs text-gray-600">
                Tu solicitud ha sido ingresada correctamente a la plataforma.
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Número de Ticket:</span>
                <span className="font-mono font-bold text-[#001428] bg-white px-2 py-0.5 rounded border border-gray-200">
                  {submittedTicket.id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Identificador de Dispositivo:</span>
                <span className="font-mono text-gray-700">{submittedTicket.deviceId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Estado Inicial:</span>
                <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[10px]">
                  Pendiente de Revisión
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              El administrador revisará el historial de solicitudes y los chats de seguridad vinculados a tu dispositivo para darte una solución o respuesta a la brevedad.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-[#0f2942] hover:bg-[#001428] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Entendido y Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
            {/* Device ID Badge */}
            <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-700" />
                <div>
                  <span className="font-bold text-blue-950 block text-[11px]">
                    Identificador de tu Dispositivo:
                  </span>
                  <span className="font-mono font-bold text-blue-800 text-xs">
                    {deviceId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="px-2 py-1 rounded-lg bg-white border border-blue-200 text-blue-800 text-[10px] font-bold flex items-center gap-1 hover:bg-blue-100 cursor-pointer shadow-2xs"
                title="Copiar ID para brindar al administrador"
              >
                {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            {/* Type Selector */}
            <div>
              <label className="text-xs font-bold text-[#001428] block mb-1.5">
                Tipo de Comunicación:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'reclamo', label: 'Reclamo', icon: AlertTriangle, color: 'text-amber-600' },
                  { id: 'sugerencia', label: 'Sugerencia', icon: Lightbulb, color: 'text-yellow-600' },
                  { id: 'felicitacion', label: 'Felicitación', icon: Heart, color: 'text-rose-600' },
                  { id: 'consulta', label: 'Consulta', icon: HelpCircle, color: 'text-blue-600' }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = feedbackType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFeedbackType(item.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#0f2942] text-white border-[#0f2942] shadow-xs' 
                          : 'bg-gray-50 hover:bg-gray-100 text-[#43474d] border-gray-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : item.color}`} />
                      <span className="text-[11px]">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Data Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  Tu Nombre:
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ej. Juan Gómez"
                  className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0f2942]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  Teléfono de Contacto (WhatsApp):
                </label>
                <input
                  type="tel"
                  required
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="Ej. 387 555-1234"
                  className="w-full text-xs p-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0f2942]"
                />
              </div>
            </div>

            {/* Related Request (Optional) */}
            {requests.length > 0 && (
              <div>
                <label className="text-xs font-bold text-[#001428] block mb-1">
                  Vincular a una solicitud previa (Opcional):
                </label>
                <select
                  value={selectedRequestId}
                  onChange={(e) => {
                    setSelectedRequestId(e.target.value);
                    const found = requests.find(r => r.id === e.target.value);
                    if (found && !title) {
                      setTitle(`Reclamo / Consulta sobre: ${found.title}`);
                    }
                  }}
                  className="w-full text-xs p-2 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#0f2942]"
                >
                  <option value="">Ninguna solicitud en particular / General</option>
                  {requests.map(r => (
                    <option key={r.id} value={r.id}>
                      #{r.id} - {r.title} ({r.trade} - {r.neighborhood})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title / Motivo */}
            <div>
              <label className="text-xs font-bold text-[#001428] block mb-1">
                Motivo / Asunto:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Incumplimiento de horario, desacuerdo con presupuesto o sugerencia..."
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0f2942]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-[#001428] block mb-1">
                Detalle de lo ocurrido o propuesta:
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explicá con claridad la situación, qué acordaron con el prestador o qué te gustaría mejorar..."
                className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#0f2942]"
              />
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p>
                Este reclamo quedará auditado con tu ID de dispositivo. En el perfil administrador se contrastará con los chats y acuerdos de 30 días para resolverlo de forma justa.
              </p>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Reclamo / Sugerencia'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
