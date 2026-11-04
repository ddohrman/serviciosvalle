import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Heart, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Share2, 
  Check, 
  Info, 
  FileText,
  Star,
  ExternalLink,
  Building2,
  ChevronRight,
  Lock,
  Edit3,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  Mail,
  Smartphone,
  AlertTriangle,
  Lightbulb,
  Copy,
  MessageSquare
} from 'lucide-react';
import { UserProfile, Professional, Neighborhood, ServiceRequest, UserFeedback, UsefulPhone } from '../types';
import { EMERGENCY_NUMBERS } from '../data/mockData';
import { saveDevicePhone, getOrCreateDeviceId } from '../utils/deviceTracker';
import { getLocalUserFeedbacks } from '../utils/feedbackService';

interface MiCuentaScreenProps {
  userProfile: UserProfile;
  favoritePros: Professional[];
  neighborhoods: Neighborhood[];
  onUpdateNeighborhood: (neighborhood: string) => void;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
  onSelectWorker: (worker: Professional) => void;
  onContactWhatsApp: (worker: Professional) => void;
  onStartInternalChat?: (worker: Professional) => void;
  onRemoveFavorite: (id: string) => void;
  usefulPhones?: UsefulPhone[];
  onOpenAdminPanel?: () => void;
  isDevAdmin?: boolean;
  onTriggerAdminUnlock?: () => void;
  onLockAdmin?: () => void;
  onOpenReclamosModal?: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
];

export const MiCuentaScreen: React.FC<MiCuentaScreenProps> = ({
  userProfile,
  favoritePros,
  neighborhoods,
  onUpdateNeighborhood,
  onUpdateProfile,
  onSelectWorker,
  onContactWhatsApp,
  onStartInternalChat,
  onRemoveFavorite,
  usefulPhones,
  onOpenAdminPanel,
  isDevAdmin = false,
  onTriggerAdminUnlock,
  onLockAdmin,
  onOpenReclamosModal
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedDeviceId, setCopiedDeviceId] = useState(false);
  const [selectedBarrio, setSelectedBarrio] = useState(userProfile.neighborhood);

  const deviceId = getOrCreateDeviceId();
  const userFeedbacks = getLocalUserFeedbacks(deviceId);

  const handleCopyDeviceId = () => {
    navigator.clipboard.writeText(deviceId);
    setCopiedDeviceId(true);
    setTimeout(() => setCopiedDeviceId(false), 2200);
  };

  // Edit Profile State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editPhone, setEditPhone] = useState(userProfile.phone || '');
  const [editEmail, setEditEmail] = useState(userProfile.email || '');
  const [editNeighborhood, setEditNeighborhood] = useState(userProfile.neighborhood);
  const [editAvatar, setEditAvatar] = useState(userProfile.avatar);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleOpenEditModal = () => {
    setEditName(userProfile.name);
    setEditPhone(userProfile.phone || '');
    setEditEmail(userProfile.email || '');
    setEditNeighborhood(userProfile.neighborhood);
    setEditAvatar(userProfile.avatar);
    setIsEditModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPhoto(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditAvatar(event.target.result as string);
        }
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        name: editName.trim() || 'Vecino del Valle',
        phone: editPhone.trim(),
        email: editEmail.trim(),
        neighborhood: editNeighborhood,
        avatar: editAvatar
      });
    }
    if (editPhone.trim()) {
      saveDevicePhone(editPhone.trim(), editName.trim()).catch(() => {});
    }
    setSelectedBarrio(editNeighborhood);
    onUpdateNeighborhood(editNeighborhood);
    setIsEditModalOpen(false);
  };

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Oficios y Servicios Valle de Lerma',
        text: 'Encontrá plomeros, albañiles, gasistas y electricistas recomendados en el Valle de Lerma:',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleBarrioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBarrio(e.target.value);
    onUpdateNeighborhood(e.target.value);
    if (onUpdateProfile) {
      onUpdateProfile({ neighborhood: e.target.value });
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-2 pb-24 space-y-4">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#e2e8f0] shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar con botón de cámara */}
            <div 
              onClick={handleOpenEditModal}
              className="relative cursor-pointer group shrink-0"
              title="Tocar para cambiar foto y datos"
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#001428]/10 shadow-xs group-hover:opacity-90 transition-opacity"
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#9e4300] text-white flex items-center justify-center border-2 border-white shadow-xs">
                <Camera className="w-2.5 h-2.5" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-bold text-[#001428] truncate">
                  {userProfile.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#005312] text-[10px] font-bold border border-[#a3f69c] shrink-0">
                  Vecino Verificado
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#9e4300] font-semibold mt-0.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{userProfile.neighborhood} • Salta</span>
              </div>
              {userProfile.phone && (
                <p className="text-[11px] text-[#43474d] mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>{userProfile.phone}</span>
                </p>
              )}
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyDeviceId}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded-md border border-gray-300 transition-colors cursor-pointer"
                  title="Tocar para copiar tu identificador de dispositivo para reclamos o soporte"
                >
                  <Smartphone className="w-2.5 h-2.5 text-blue-600" />
                  <span>ID: {deviceId}</span>
                  {copiedDeviceId ? (
                    <Check className="w-3 h-3 text-emerald-600 ml-0.5" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 text-gray-500 ml-0.5" />
                  )}
                </button>
                {copiedDeviceId && (
                  <span className="text-[10px] text-emerald-700 font-bold">¡ID Copiado!</span>
                )}
              </div>
            </div>
          </div>

          {/* Botón Editar Mis Datos */}
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dbeafe] text-[#001428] border border-[#bfdbfe] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0 active:scale-95"
            title="Editar mi nombre, foto y teléfono"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#9e4300]" />
            <span>Editar mis Datos</span>
          </button>
        </div>

        {/* User Preferences Selector */}
        <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between gap-2">
          <label className="text-xs font-bold text-[#43474d]">
            Mi Departamento / Localidad:
          </label>
          <select
            value={selectedBarrio}
            onChange={handleBarrioChange}
            className="text-xs font-semibold p-1.5 px-2.5 rounded-lg border border-[#c3c6ce] bg-[#f8f9ff] text-[#001428] focus:outline-none"
          >
            {neighborhoods.filter(n => n.id !== 'todos').map((n) => (
              <option key={n.id} value={n.name}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Atención al Vecino: Reclamos y Sugerencias */}
      <div className="bg-white rounded-2xl p-4.5 border border-[#e2e8f0] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#001428]">
                Reclamos y Sugerencias de Servicios
              </h2>
              <p className="text-[11px] text-[#43474d]">
                Atención directa con el administrador para resolver inconvenientes
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed bg-[#f8fafc] p-3 rounded-xl border border-gray-100">
          ¿Tuviste un problema con algún trabajo, presupuesto o querés sugerir mejoras? Al realizar un reclamo, tu identificador de dispositivo (<span className="font-mono font-bold text-blue-900">{deviceId}</span>) permite a la administración ubicar al instante tus solicitudes y los chats de 30 días para mediar y ayudarte.
        </p>

        {onOpenReclamosModal && (
          <button
            type="button"
            onClick={onOpenReclamosModal}
            className="w-full py-2.5 bg-[#0f2942] hover:bg-[#001428] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            <span>Hacer un Reclamo o Sugerencia</span>
          </button>
        )}

        {/* Historial de Reclamos de este Dispositivo */}
        {userFeedbacks.length > 0 && (
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-700 block">
              Tus Reclamos / Sugerencias Registrados ({userFeedbacks.length}):
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {userFeedbacks.map((f) => (
                <div key={f.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-gray-900 text-[10px]">
                      Ticket #{f.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      f.status === 'resuelto' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : f.status === 'en_revision' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {f.status === 'resuelto' ? 'Resuelto' : f.status === 'en_revision' ? 'En Revisión' : 'Pendiente'}
                    </span>
                  </div>
                  <p className="font-bold text-[#001428] text-[11px]">{f.title}</p>
                  <p className="text-[10px] text-gray-500 line-clamp-2">"{f.description}"</p>
                  {f.adminNotes && (
                    <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[10px] text-blue-900">
                      <strong>Respuesta de la Administración:</strong> {f.adminNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mis Profesionales Guardados */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <h2 className="text-sm font-bold text-[#001428]">
              Mis Profesionales Guardados ({favoritePros.length})
            </h2>
          </div>
        </div>

        {favoritePros.length === 0 ? (
          <p className="text-xs text-[#74777e] py-3 text-center">
            Aún no has guardado ningún profesional en tus favoritos. Hacé clic en el corazón de cualquier tarjeta para tenerlo a mano.
          </p>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {favoritePros.map((pro) => (
              <div key={pro.id} className="py-2.5 flex items-center justify-between gap-3">
                <div 
                  onClick={() => onSelectWorker(pro)}
                  className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 group"
                >
                  <img
                    src={pro.avatar}
                    alt={pro.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#e2e8f0]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#001428] group-hover:text-[#9e4300] truncate">
                      {pro.name}
                    </p>
                    <p className="text-[11px] text-[#9e4300] font-semibold truncate">
                      {pro.trade}
                    </p>
                    <p className="text-[10px] text-[#74777e]">
                      {pro.neighborhood} • ⭐ {pro.rating.toFixed(1)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      if (onStartInternalChat) {
                        onStartInternalChat(pro);
                      } else {
                        onContactWhatsApp(pro);
                      }
                    }}
                    className="h-8 px-2.5 rounded-lg bg-[#001428] hover:bg-[#0f2942] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                    title="Abrir chat interno seguro con el prestador"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#ffdbcb]" />
                    <span>Chat Interno</span>
                  </button>
                  <button
                    onClick={() => onRemoveFavorite(pro.id)}
                    className="p-1.5 text-[#c3c6ce] hover:text-red-500 rounded-lg cursor-pointer"
                    title="Quitar de favoritos"
                  >
                    <Heart className="w-4 h-4 fill-current text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Administrator Access Card - Solo visible para Jorge Lopez */}
      {isDevAdmin && (
        <div className="bg-gradient-to-br from-[#001428] to-[#0f2942] text-white rounded-2xl p-4.5 shadow-md border border-[#1e3e60] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#ffdbcb] flex items-center justify-center text-[#783100]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Panel Administrador General</h2>
                <p className="text-[10px] text-[#ffdbcb] font-semibold">Jorge Lopez (Dev) y Daniel Dohrman (Dev)</p>
              </div>
            </div>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
              Modo Activo
            </span>
          </div>
          
          <p className="text-[11px] text-[#d3e4fe] leading-relaxed">
            Tenés acceso completo a las estadísticas de uso de clientes, métricas de prestadores (prueba gratuita vs continuando uso), autorización de matrículas y publicidades.
          </p>

          <div className="space-y-2 pt-1">
            {onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="w-full py-2.5 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Ingresar al Panel Administrador</span>
              </button>
            )}

            {onLockAdmin && (
              <button
                type="button"
                onClick={onLockAdmin}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Ocultar botón y bloquear acceso en este celular</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Useful Emergency & Public Directory of Cerrillos */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-[#001428] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#0f2942]" />
          Teléfonos Útiles de Cerrillos y Valle de Lerma
        </h2>

        <div className="grid grid-cols-1 gap-2">
          {(usefulPhones || EMERGENCY_NUMBERS).map((n, i) => (
            <a
              key={i}
              href={`tel:${n.phone.replace(/[^0-9]/g, '')}`}
              className="p-2.5 rounded-xl bg-[#f8f9ff] border border-[#eff4ff] hover:bg-[#eff4ff] flex items-center justify-between transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#001428] truncate">{n.name}</p>
                <p className="text-[11px] font-semibold text-[#9e4300]">{n.phone}</p>
              </div>
              <Phone className="w-4 h-4 text-[#9e4300] shrink-0" />
            </a>
          ))}
        </div>
      </div>

      {/* Community Information & Share */}
      <div className="bg-[#eff4ff] rounded-2xl p-4 border border-[#d3e4fe] space-y-3">
        <div className="flex items-start gap-2.5">
          <Info className="w-5 h-5 text-[#001428] shrink-0 mt-0.5" />
          <div className="text-xs text-[#0b1c30] leading-relaxed">
            <p className="font-bold text-sm mb-1">
              Sobre Oficios y Servicios Valle de Lerma
            </p>
            <p className="text-[#43474d]">
              Iniciativa comunitaria para conectar a los hogares de Cerrillos, La Merced y San Agustín con albañiles, plomeros, electricistas y técnicos confiables de nuestra propia localidad.
            </p>
          </div>
        </div>

        <button
          onClick={handleShareApp}
          className="w-full py-2.5 bg-white border border-[#c3c6ce] text-[#001428] text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-2xs hover:bg-[#f8f9ff] active:scale-95 transition-all cursor-pointer"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-bold">¡Enlace copiado al portapapeles!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-[#9e4300]" />
              <span>Compartir la aplicación con vecinos</span>
            </>
          )}
        </button>
      </div>

      {/* Acceso discreto para Jorge Lopez */}
      {!isDevAdmin && onTriggerAdminUnlock && (
        <div className="pt-2 pb-6 text-center">
          <button
            type="button"
            onClick={onTriggerAdminUnlock}
            className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors py-1.5 px-3 rounded-xl hover:bg-gray-100 cursor-pointer"
            title="Acceso exclusivo administración"
          >
            <Lock className="w-3 h-3 text-[#9e4300]" />
            <span>Acceso Administración (Jorge Lopez)</span>
          </button>
        </div>
      )}

      {/* Modal para Editar Datos Personales del Vecino */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado */}
            <div className="bg-gradient-to-r from-[#001428] via-[#09223a] to-[#122e4d] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#9e4300] text-white flex items-center justify-center shadow-xs">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Editar mis Datos de Vecino</h3>
                  <p className="text-[11px] text-[#d3e4fe]">Modificá tu nombre, foto y teléfono</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveProfile} className="p-5 space-y-4 overflow-y-auto">
              {/* Selector y subida de Foto */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#001428] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#9e4300]" />
                  <span>Foto de Perfil:</span>
                </label>

                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#f8f9ff] border border-[#dce7f5]">
                  <img
                    src={editAvatar}
                    alt="Vista previa"
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <label 
                      htmlFor="vecino-photo-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingPhoto ? 'Cargando foto...' : 'Subir foto de mi celular'}</span>
                    </label>
                    <input
                      id="vecino-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <p className="text-[10px] text-[#74777e]">
                      Formatos JPG, PNG desde tu cámara o galería.
                    </p>
                  </div>
                </div>

                {/* Avatares sugeridos */}
                <div className="pt-1">
                  <p className="text-[11px] text-[#5a5f67] mb-1.5 font-semibold">O elegí un avatar predeterminado:</p>
                  <div className="flex items-center gap-2">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatar(preset)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          editAvatar === preset ? 'border-[#9e4300] ring-2 ring-[#ffdbcb] scale-105' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img src={preset} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nombre y Apellido */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#001428]">
                  Tu Nombre y Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ej: Martín Romero"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] focus:border-[#9e4300] focus:ring-2 focus:ring-[#ffdbcb] outline-none transition-all"
                />
              </div>

              {/* Teléfono / WhatsApp */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#001428] flex items-center justify-between">
                  <span>Tu Celular / WhatsApp:</span>
                  <span className="text-[10px] font-normal text-[#74777e]">(Para coordinar con prestadores)</span>
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Ej: 387 555-1234"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] focus:border-[#9e4300] focus:ring-2 focus:ring-[#ffdbcb] outline-none transition-all"
                />
              </div>

              {/* Departamento / Localidad */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#001428]">
                  Tu Departamento o Localidad:
                </label>
                <select
                  value={editNeighborhood}
                  onChange={(e) => setEditNeighborhood(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] focus:border-[#9e4300] outline-none bg-white transition-all font-medium"
                >
                  {neighborhoods.filter(n => n.id !== 'todos').map((n) => (
                    <option key={n.id} value={n.name}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Correo Electrónico (Opcional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#001428] flex items-center justify-between">
                  <span>Correo Electrónico:</span>
                  <span className="text-[10px] font-normal text-[#74777e]">(Opcional)</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] focus:border-[#9e4300] outline-none transition-all"
                />
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
