import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  CheckCircle2, 
  ShieldCheck, 
  MessageCircle, 
  Sparkles, 
  Send,
  MapPin,
  Clock,
  Image as ImageIcon,
  Upload,
  Trash2,
  AlertCircle,
  Check,
  X,
  UserCheck,
  Calendar,
  MessageSquare,
  Plus,
  Phone,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  Gift,
  ArrowRight,
  ExternalLink,
  Edit3,
  AlertTriangle,
  Camera,
  FileText,
  FileCheck,
  Megaphone,
  Cloud,
  Download,
  Loader2,
  BarChart3,
  Users,
  BookOpen,
  ListFilter,
  Tag,
  Layers,
  Smartphone
} from 'lucide-react';
import { Professional, ServiceCategory, Neighborhood, CompletedJob, AppAdvertisement, AppAnalytics, ServiceRequest } from '../types';
import { AdminAdvertisementConfig } from './AdminAdvertisementConfig';
import { AdminStatsDashboard } from './AdminStatsDashboard';
import { AdminCategoriesNeighborhoodsConfig } from './AdminCategoriesNeighborhoodsConfig';
import { DockerDeployModal } from './DockerDeployModal';
import { AdminApkModal } from './AdminApkModal';
import { DEFAULT_ANALYTICS } from '../lib/firebase';


interface SerProScreenProps {
  categories: ServiceCategory[];
  neighborhoods: Neighborhood[];
  onSaveCategories?: (updated: ServiceCategory[]) => void;
  onSaveNeighborhoods?: (updated: Neighborhood[]) => void;
  professionals: Professional[];
  requests?: ServiceRequest[];
  analytics?: AppAnalytics;
  loggedInPro?: Professional | null;
  initialView?: 'registro' | 'login' | 'panel-aprobacion';
  adminTrigger?: number;
  advertisements?: AppAdvertisement[];
  onSaveAdvertisements?: (updated: AppAdvertisement[]) => void;
  advertisement?: AppAdvertisement;
  onSaveAdvertisement?: (updated: AppAdvertisement) => void;
  onTestAdvertisement?: (ad?: AppAdvertisement) => void;
  onRegisterProfessionalWithCredentials?: (
    pro: Professional, 
    username: string, 
    password?: string
  ) => void;
  onLoginProfessional?: (username: string, password?: string) => boolean;
  onLogoutProfessional?: () => void;
  onUpdateProfessionalProfile?: (updated: Professional) => void;
  onRegisterProfessional: (pro: Professional) => void;
  onApproveProfessional: (id: string) => void;
  onRejectProfessional: (id: string, reason?: string) => void;
  onAddCompletedJob: (proId: string, job: CompletedJob) => void;
  onContactWhatsApp: (worker: Professional, msg?: string) => void;
  onNavigateToExplorar: () => void;
  onSelectWorkerForDetail?: (worker: Professional) => void;
  onUpdateSubscription?: (
    proId: string, 
    plan: 'prueba_gratuita' | 'abono_mensual' | 'abono_anual', 
    status: 'activa' | 'caducada'
  ) => void;
  onShowExpiredModal?: (pro: Professional) => void;
  isDevAdmin?: boolean;
  onTriggerAdminUnlock?: () => void;
  onLockAdmin?: () => void;
}

export const SerProScreen: React.FC<SerProScreenProps> = ({
  categories,
  neighborhoods,
  onSaveCategories,
  onSaveNeighborhoods,
  professionals,
  requests = [],
  analytics = DEFAULT_ANALYTICS,
  loggedInPro,
  initialView,
  adminTrigger,
  advertisements,
  onSaveAdvertisements,
  advertisement,
  onSaveAdvertisement,
  onTestAdvertisement,
  onRegisterProfessionalWithCredentials,
  onLoginProfessional,
  onLogoutProfessional,
  onUpdateProfessionalProfile,
  onRegisterProfessional,
  onApproveProfessional,
  onRejectProfessional,
  onAddCompletedJob,
  onContactWhatsApp,
  onNavigateToExplorar,
  onSelectWorkerForDetail,
  onUpdateSubscription,
  onShowExpiredModal,
  isDevAdmin = false,
  onTriggerAdminUnlock,
  onLockAdmin
}) => {
  // Navigation between registration, login, profile, and approval panel
  const [activeView, setActiveView] = useState<'registro' | 'login' | 'panel-aprobacion'>(initialView || 'registro');
  const [approvalFilter, setApprovalFilter] = useState<'pendiente' | 'aprobado' | 'prueba_activa' | 'prueba_caducada' | 'continuando_uso' | 'todos'>('pendiente');
  const [adminSubSection, setAdminSubSection] = useState<'prestadores' | 'publicidad' | 'estadisticas' | 'rubros-localidades'>('prestadores');

  // Ad counts for admin sub-section badge
  const currentAds = advertisements || (advertisement ? [advertisement] : []);
  const todayIndexForAd = new Date().getDay();
  const activeAdsTodayCount = currentAds.filter(ad => 
    ad.enabled && (!ad.daysOfWeek || ad.daysOfWeek.length === 0 || ad.daysOfWeek.includes(todayIndexForAd))
  ).length;

  useEffect(() => {
    if (initialView) {
      setActiveView(initialView);
    }
  }, [initialView, adminTrigger]);

  // Provider Registration fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [trade, setTrade] = useState('Albañil y Constructor');
  const [categoryId, setCategoryId] = useState('albanileria');
  const [neighborhood, setNeighborhood] = useState('Cerrillos');
  const [phone, setPhone] = useState('387');
  const [experienceYears, setExperienceYears] = useState(5);
  const [dniNumber, setDniNumber] = useState('');
  const [matricula, setMatricula] = useState('');
  const [emergencyDuty, setEmergencyDuty] = useState(false);
  const [quoteWithoutCharge, setQuoteWithoutCharge] = useState(true);
  const [bio, setBio] = useState('');
  const [searchKeywordsText, setSearchKeywordsText] = useState('');
  const [dniPhotoUrl, setDniPhotoUrl] = useState('');
  const [hasCertification, setHasCertification] = useState(false);
  const [certificatePhotoUrl, setCertificatePhotoUrl] = useState('');
  const [isUploadingDni, setIsUploadingDni] = useState(false);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [viewingDocumentModal, setViewingDocumentModal] = useState<{ title: string; imageUrl: string } | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [isDockerModalOpen, setIsDockerModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // File upload handlers for DNI and Certification
  const handleDniFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingDni(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setDniPhotoUrl(event.target?.result as string);
        setIsUploadingDni(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingCert(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCertificatePhotoUrl(event.target?.result as string);
        setIsUploadingCert(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Provider Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Provider Dashboard Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState(loggedInPro?.phone || '');
  const [editBio, setEditBio] = useState(loggedInPro?.bio || '');
  const [editEmergency, setEditEmergency] = useState(loggedInPro?.emergencyDuty || false);
  const [editKeywordsText, setEditKeywordsText] = useState(
    (loggedInPro?.palabrasClave && loggedInPro.palabrasClave.length > 0)
      ? loggedInPro.palabrasClave.join(', ')
      : loggedInPro?.searchKeywordsText || (loggedInPro?.searchKeywords || []).join(', ')
  );

  // Sync edit state whenever loggedInPro updates
  useEffect(() => {
    if (loggedInPro) {
      setEditPhone(loggedInPro.phone || '');
      setEditBio(loggedInPro.bio || '');
      setEditEmergency(loggedInPro.emergencyDuty || false);
      const kws = (loggedInPro.palabrasClave && loggedInPro.palabrasClave.length > 0)
        ? loggedInPro.palabrasClave.join(', ')
        : (loggedInPro.searchKeywords && loggedInPro.searchKeywords.length > 0)
        ? loggedInPro.searchKeywords.join(', ')
        : (loggedInPro.searchKeywordsText || '');
      setEditKeywordsText(kws);
    }
  }, [loggedInPro]);

  // Completed job upload modal/state for logged in provider
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobClient, setNewJobClient] = useState('');
  const [newJobNeighborhood, setNewJobNeighborhood] = useState(loggedInPro?.neighborhood || 'Cerrillos');
  const [newJobComment, setNewJobComment] = useState('');
  const [newJobPhotoUrl, setNewJobPhotoUrl] = useState('');

  // Status after submission
  const [submittedPro, setSubmittedPro] = useState<Professional | null>(null);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = categories.find(c => c.id === e.target.value);
    if (selected) {
      setCategoryId(selected.id);
      setTrade(selected.name);
    }
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationError(null);

    const cleanUser = username.trim().toLowerCase().replace(/\s+/g, '');
    if (!cleanUser || cleanUser.length < 3) {
      setRegistrationError('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }

    if (!password || password.length < 3) {
      setRegistrationError('La contraseña debe tener al menos 3 caracteres.');
      return;
    }

    if (!name.trim() || !phone.trim()) {
      setRegistrationError('Por favor completá tu nombre y número de teléfono.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const proId = `pro-${Date.now()}`;
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const newPro: Professional = {
      id: proId,
      name: name.trim(),
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
      trade: trade,
      categoryId: categoryId,
      neighborhood: neighborhood,
      rating: 5.0,
      reviewCount: 0,
      verified: true,
      verifiedLabel: (hasCertification && matricula.trim()) ? 'Matrícula Verificada' : '30 Días Gratis',
      availableNow: true,
      emergencyDuty: emergencyDuty,
      quoteWithoutCharge: quoteWithoutCharge,
      matricula: (hasCertification && matricula.trim()) ? matricula.trim() : undefined,
      certificatePhotoUrl: (hasCertification && certificatePhotoUrl) ? certificatePhotoUrl : undefined,
      dniNumber: dniNumber.trim() ? dniNumber.trim() : undefined,
      dniPhotoUrl: dniPhotoUrl || undefined,
      approvalStatus: 'aprobado',
      submissionDate: 'Hoy, hace instantes',
      phone: phone.startsWith('+54') ? phone : `+54 9 ${phone}`,
      whatsappNumber: `549${cleanPhone}`,
      experienceYears: experienceYears,
      bio: bio.trim() || `Profesional de oficio radicado en ${neighborhood} y con cobertura en todo el Valle de Lerma. Trabajo garantizado y atención personalizada.`,
      guaranteeText: (hasCertification && matricula.trim()) ? 'Matrícula y constancia habilitante verificada' : 'Garantía vecinal de mano de obra',
      priceTagText: quoteWithoutCharge ? 'Presupuesto sin cargo' : 'Consulta personalizada',
      palabrasClave: searchKeywordsText
        .split(/[,;\n]+/)
        .map(k => k.trim())
        .filter(Boolean),
      searchKeywords: searchKeywordsText
        .split(/[,;\n]+/)
        .map(k => k.trim())
        .filter(Boolean),
      searchKeywordsText: searchKeywordsText.trim() || undefined,
      services: [
        { name: `Trabajos de ${trade.toLowerCase()}`, priceEstimate: 'A convenir' },
        { name: 'Presupuesto y asesoramiento', priceEstimate: 'Sin cargo' }
      ],
      completedJobs: [],
      reviews: [],
      username: cleanUser,
      trialStartDate: now.toISOString(),
      trialEndDate: trialEnd.toISOString(),
      trialDaysTotal: 30,
      trialActive: true
    };

    if (onRegisterProfessionalWithCredentials) {
      onRegisterProfessionalWithCredentials(newPro, cleanUser, password);
    } else {
      onRegisterProfessional(newPro);
    }

    setSubmittedPro(newPro);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleanUser = loginUsername.trim().toLowerCase();
    if (!cleanUser) {
      setLoginError('Ingresá tu nombre de usuario.');
      return;
    }

    // Acceso directo de Administrador por credencial
    if (cleanUser === 'admin' || cleanUser === 'administrador') {
      setActiveView('panel-aprobacion');
      return;
    }

    if (onLoginProfessional) {
      const success = onLoginProfessional(loginUsername.trim(), loginPassword);
      if (!success) {
        setLoginError('Usuario o contraseña no encontrados. Podés usar las cuentas demo para probar con 1 toque.');
      }
    }
  };

  const handleSaveProfileChanges = () => {
    if (!loggedInPro || !onUpdateProfessionalProfile) return;
    const parsedKws = editKeywordsText
      .split(/[,;\n]+/)
      .map(k => k.trim())
      .filter(Boolean);

    const updated: Professional = {
      ...loggedInPro,
      phone: editPhone || loggedInPro.phone,
      bio: editBio || loggedInPro.bio,
      emergencyDuty: editEmergency,
      palabrasClave: parsedKws,
      searchKeywords: parsedKws,
      searchKeywordsText: editKeywordsText.trim() || undefined
    };
    onUpdateProfessionalProfile(updated);
    setIsEditingProfile(false);
  };

  const handleSaveCompletedJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInPro || !newJobTitle.trim()) return;

    const job: CompletedJob = {
      id: `job-${Date.now()}`,
      title: newJobTitle.trim(),
      clientName: newJobClient.trim() || 'Vecino del Valle de Lerma',
      neighborhood: newJobNeighborhood,
      date: 'Reciente',
      photoUrl: newJobPhotoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      comment: newJobComment.trim() || 'Trabajo finalizado con conformidad del cliente.',
      contractNumber: `VALLE-${Math.floor(1000 + Math.random() * 9000)}`,
      verifiedByApp: true
    };

    onAddCompletedJob(loggedInPro.id, job);
    setIsAddingJob(false);
    setNewJobTitle('');
    setNewJobClient('');
    setNewJobComment('');
    setNewJobPhotoUrl('');
  };

  // Pending professionals count for admin tab
  const pendingPros = professionals.filter(p => p.approvalStatus === 'pendiente');
  const approvedPros = professionals.filter(p => !p.approvalStatus || p.approvalStatus === 'aprobado');

  // Breakdown for statistics and filters
  const trialActivePros = professionals.filter(p => {
    const isExpired = p.isTrialExpired || p.subscriptionStatus === 'caducada' || p.trialActive === false;
    const isPaid = (p.subscriptionPlan === 'abono_mensual' || p.subscriptionPlan === 'abono_anual') && p.subscriptionStatus === 'activa';
    return !isExpired && !isPaid;
  });

  const trialExpiredPros = professionals.filter(p => {
    const isExpired = p.isTrialExpired || p.subscriptionStatus === 'caducada' || p.trialActive === false;
    const isPaid = (p.subscriptionPlan === 'abono_mensual' || p.subscriptionPlan === 'abono_anual') && p.subscriptionStatus === 'activa';
    return isExpired && !isPaid;
  });

  const continuingUsePros = professionals.filter(p => {
    return (p.subscriptionPlan === 'abono_mensual' || p.subscriptionPlan === 'abono_anual') && p.subscriptionStatus === 'activa';
  });

  const displayedPros = professionals.filter(p => {
    const isExpired = p.isTrialExpired || p.subscriptionStatus === 'caducada' || p.trialActive === false;
    const isPaid = (p.subscriptionPlan === 'abono_mensual' || p.subscriptionPlan === 'abono_anual') && p.subscriptionStatus === 'activa';
    const isTrialActive = !isExpired && !isPaid;

    if (approvalFilter === 'pendiente') return p.approvalStatus === 'pendiente';
    if (approvalFilter === 'aprobado') return !p.approvalStatus || p.approvalStatus === 'aprobado';
    if (approvalFilter === 'prueba_activa') return isTrialActive;
    if (approvalFilter === 'prueba_caducada') return isExpired && !isPaid;
    if (approvalFilter === 'continuando_uso') return isPaid;
    return true;
  });

  // Calculate remaining days for logged-in provider
  const getDaysRemaining = (pro: Professional) => {
    if (!pro.trialEndDate) return 30;
    const diff = new Date(pro.trialEndDate).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 pt-2 pb-24 space-y-4">
      {/* ========================================================================= */}
      {/* 1. DUAL-ROLE CLARITY BANNER (Clients vs Providers)                       */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-[#eff4ff] to-[#f8f9ff] p-4 rounded-2xl border border-[#c3d7f8] shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0f2942] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-[#ffdbcb]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#001428] flex items-center gap-1.5">
              <span>¿Cómo funciona Oficios y Servicios Valle de Lerma?</span>
            </h2>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-[#d8e2ee]">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Vecinos que Contratan</span>
                </div>
                <p className="text-[11px] text-[#43474d] mt-1 leading-snug">
                  Acceso <strong>100% libre, gratuito y sin registrarse</strong> por tiempo indeterminado. Buscá en Explorar y contactá directo por WhatsApp.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#fff2ea] border border-[#ffd5c2]">
                <div className="flex items-center gap-1.5 font-bold text-[#9e4300]">
                  <Wrench className="w-4 h-4 text-[#9e4300] shrink-0" />
                  <span>Trabajadores y Profesionales</span>
                </div>
                <p className="text-[11px] text-[#5e2700] mt-1 leading-snug">
                  Registrate con <strong>usuario y contraseña</strong> y disfrutá de <strong>30 días de prueba gratuita</strong> para recibir clientes del Valle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. IF PROVIDER IS LOGGED IN: SHOW DEDICATED PRO DASHBOARD & TRIAL STATUS  */}
      {/* ========================================================================= */}
      {loggedInPro && activeView !== 'panel-aprobacion' ? (
        <div className="space-y-4">
          {/* Header Card with Logged In Pro Info */}
          <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={loggedInPro.avatar}
                    alt={loggedInPro.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#9e4300] shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-[#001428] truncate">
                      {loggedInPro.name}
                    </h2>
                    <span className="bg-[#eff4ff] text-[#0f2942] border border-[#d3e4fe] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Prestador Activo
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#9e4300]">
                    {loggedInPro.trade}
                  </p>
                  <p className="text-[11px] text-[#74777e] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#9e4300]" />
                    {loggedInPro.neighborhood} • WhatsApp: {loggedInPro.phone}
                  </p>
                </div>
              </div>

              {/* Logout button */}
              {onLogoutProfessional && (
                <button
                  onClick={onLogoutProfessional}
                  className="p-2 text-[#74777e] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="Cerrar sesión de prestador"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              )}
            </div>

            {/* Quick action: View public card & Admin Panel access */}
            <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-[#43474d] font-medium">
                Tu perfil está publicado y recibiendo consultas de vecinos.
              </span>
              <div className="flex items-center gap-2">
                {isDevAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveView('panel-aprobacion')}
                    className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#9e4300] border border-orange-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Abrir Panel Administrador para gestionar suscripciones"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Panel Administrador</span>
                  </button>
                )}
                <button
                  onClick={() => onSelectWorkerForDetail && onSelectWorkerForDetail(loggedInPro)}
                  className="px-3 py-1.5 bg-[#0f2942] hover:bg-[#001428] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#ffdbcb]" />
                  <span>Ver mi Ficha Pública</span>
                </button>
              </div>
            </div>
          </div>

          {/* 30-DAY FREE TRIAL HIGHLIGHT BOX */}
          <div className="bg-gradient-to-br from-[#001428] via-[#0f2942] to-[#1c3a5e] text-white p-5 rounded-2xl shadow-md relative overflow-hidden border border-[#1e3e60]">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 bg-[#ffdbcb] text-[#783100] text-xs font-extrabold px-3 py-1 rounded-full shadow-xs">
                  <Gift className="w-3.5 h-3.5" />
                  <span>30 Días de Prueba Gratuita Activa</span>
                </span>
                <span className="text-xs font-bold text-[#a3f69c] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sin costo inicial</span>
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold">
                  Te quedan {getDaysRemaining(loggedInPro)} días de prueba gratuita
                </h3>
                <p className="text-xs text-[#d3e4fe] mt-0.5 leading-relaxed">
                  Aprovechá al máximo para recibir pedidos de trabajo de vecinos de Cerrillos y todo el Valle de Lerma.
                </p>
              </div>

              {/* Progress bar of the 30 days */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-semibold text-[#e0e8f5]">
                  <span>Día {Math.max(1, 31 - getDaysRemaining(loggedInPro))} de 30</span>
                  <span>{getDaysRemaining(loggedInPro)} días restantes</span>
                </div>
                <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="bg-gradient-to-r from-[#ff8843] to-[#a3f69c] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, (getDaysRemaining(loggedInPro) / 30) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Active Benefits during trial */}
              <div className="pt-2 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a3f69c] shrink-0" />
                  <span className="text-[#eff4ff] text-[11px]">Ficha pública activa en el catálogo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a3f69c] shrink-0" />
                  <span className="text-[#eff4ff] text-[11px]">Contacto directo por WhatsApp (0% comisión)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a3f69c] shrink-0" />
                  <span className="text-[#eff4ff] text-[11px]">Recepción de presupuestos y solicitudes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#a3f69c] shrink-0" />
                  <span className="text-[#eff4ff] text-[11px]">Subida de fotos de obras realizadas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Profile Editor */}
          <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#9e4300]" />
                <h3 className="font-bold text-sm text-[#001428]">Configuración de mi Perfil de Prestador</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isEditingProfile) {
                    setEditPhone(loggedInPro.phone);
                    setEditBio(loggedInPro.bio);
                    setEditEmergency(loggedInPro.emergencyDuty);
                  }
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="text-xs font-bold text-[#9e4300] hover:underline cursor-pointer"
              >
                {isEditingProfile ? 'Cancelar' : 'Editar Datos'}
              </button>
            </div>

            {isEditingProfile ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#001428] block mb-1">
                    Número de Celular / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#001428] block mb-1">
                    Presentación de tus Servicios (Bio)
                  </label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                  />
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] cursor-pointer">
                  <span className="text-xs font-medium text-[#001428]">
                    ¿Disponible hoy para guardias y auxilios de urgencia?
                  </span>
                  <input
                    type="checkbox"
                    checked={editEmergency}
                    onChange={(e) => setEditEmergency(e.target.checked)}
                    className="w-4 h-4 text-[#9e4300] rounded accent-[#9e4300]"
                  />
                </label>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#001428] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#9e4300]" />
                      <span>Palabras de búsqueda y rubros adicionales</span>
                    </label>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      Buscador de Vecinos
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5a5f67] leading-relaxed mb-1.5">
                    Ingresá términos o artículos secundarios separados por coma (ej. si tenés un corralón y también vendés artículos de pesca, escribí: <em>cañas de pescar, riles, reels, sillas plegables, anzuelos, carnada</em>):
                  </p>
                  <textarea
                    rows={2}
                    value={editKeywordsText}
                    onChange={(e) => setEditKeywordsText(e.target.value)}
                    placeholder="cañas de pescar, riles, reels, sillas plegables, anzuelos, carnada, camping..."
                    className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                  />
                  {/* Quick helper buttons */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-[#74777e] font-medium">Sugerencias:</span>
                    {['cañas de pescar', 'riles', 'sillas plegables', 'artículos de pesca', 'carnadas', 'fletes', 'camping'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          const current = editKeywordsText.trim();
                          if (!current) setEditKeywordsText(sug);
                          else if (!current.toLowerCase().includes(sug.toLowerCase())) setEditKeywordsText(current + ', ' + sug);
                        }}
                        className="px-2 py-0.5 bg-gray-100 hover:bg-orange-50 hover:text-[#9e4300] text-gray-700 text-[10px] font-semibold rounded border border-gray-200 transition-colors cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>

                  {/* Live preview of parsed palabrasClave array */}
                  {editKeywordsText.trim() && (
                    <div className="mt-2.5 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200">
                      <span className="text-[10px] font-bold text-amber-950 block mb-1.5 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-amber-700" />
                        <span>Palabras clave que se guardarán en tu perfil ({editKeywordsText.split(/[,;\n]+/).map(k => k.trim()).filter(Boolean).length}):</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {editKeywordsText.split(/[,;\n]+/).map(k => k.trim()).filter(Boolean).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-white text-amber-900 border border-amber-300 text-[10px] font-semibold rounded-md flex items-center gap-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfileChanges}
                  className="w-full py-2.5 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Guardar Cambios de Perfil
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <p className="text-[#43474d]">
                  <strong className="text-[#001428]">Bio actual:</strong> {loggedInPro.bio}
                </p>

                {(((loggedInPro.palabrasClave && loggedInPro.palabrasClave.length > 0) || (loggedInPro.searchKeywords && loggedInPro.searchKeywords.length > 0))) && (
                  <div className="pt-2 border-t border-[#f1f5f9]">
                    <span className="text-[11px] font-bold text-[#001428] block mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Palabras clave activas en el buscador ({((loggedInPro.palabrasClave && loggedInPro.palabrasClave.length > 0) ? loggedInPro.palabrasClave : (loggedInPro.searchKeywords || [])).length}):</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {((loggedInPro.palabrasClave && loggedInPro.palabrasClave.length > 0) ? loggedInPro.palabrasClave : (loggedInPro.searchKeywords || [])).map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-amber-700" />
                          <span>{kw}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    loggedInPro.emergencyDuty ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {loggedInPro.emergencyDuty ? '⚡ Disponible para Urgencias' : 'Urgencias: No activas'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900">
                    {loggedInPro.quoteWithoutCharge ? '✓ Presupuesto sin cargo' : 'Presupuesto a convenir'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Upload Completed Job with Photo */}
          <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#001428]">Mis Trabajos Certificados con Fotos</h3>
                <p className="text-xs text-[#74777e]">
                  Tenés {loggedInPro.completedJobs?.length || 0} trabajo(s) cargado(s)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingJob(!isAddingJob)}
                className="px-3 py-1.5 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Trabajo</span>
              </button>
            </div>

            {isAddingJob && (
              <form onSubmit={handleSaveCompletedJob} className="p-4 bg-[#f8f9ff] rounded-xl border border-[#d8e2ee] space-y-3">
                <h4 className="text-xs font-bold text-[#001428] uppercase tracking-wider">
                  Cargar Nuevo Trabajo Terminado
                </h4>

                <div>
                  <label className="text-xs font-bold text-[#001428] block mb-1">
                    Título de la Obra o Servicio *
                  </label>
                  <input
                    type="text"
                    required
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="Ej: Instalación de termotanque solar"
                    className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-[#001428] block mb-1">
                      Vecino / Cliente
                    </label>
                    <input
                      type="text"
                      value={newJobClient}
                      onChange={(e) => setNewJobClient(e.target.value)}
                      placeholder="Ej: Familia Romero"
                      className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#001428] block mb-1">
                      Localidad
                    </label>
                    <select
                      value={newJobNeighborhood}
                      onChange={(e) => setNewJobNeighborhood(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                    >
                      {neighborhoods.filter(n => n.id !== 'todos').map(n => (
                        <option key={n.id} value={n.name}>{n.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#001428] block mb-1">
                    Comentario o detalle de la obra
                  </label>
                  <textarea
                    rows={2}
                    value={newJobComment}
                    onChange={(e) => setNewJobComment(e.target.value)}
                    placeholder="Detalles sobre materiales utilizados y tiempo de ejecución..."
                    className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#001428] block mb-1">
                    Foto del Trabajo Realizado
                  </label>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-dashed border-[#c3c6ce] bg-white hover:bg-orange-50/40 cursor-pointer">
                    <Upload className="w-4 h-4 text-[#9e4300]" />
                    <span className="text-xs text-[#001428] truncate">
                      {newJobPhotoUrl ? 'Foto seleccionada ✓' : 'Seleccionar foto de tu galería'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setNewJobPhotoUrl(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Guardar y Publicar Trabajo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingJob(false)}
                    className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#001428] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* List of completed jobs */}
            {loggedInPro.completedJobs && loggedInPro.completedJobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {loggedInPro.completedJobs.map(job => (
                  <div key={job.id} className="rounded-xl border border-[#e2e8f0] overflow-hidden bg-[#f8f9ff] text-xs">
                    <img
                      src={job.photoUrl}
                      alt={job.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <p className="font-bold text-[#001428]">{job.title}</p>
                      <p className="text-[11px] text-[#74777e] mt-0.5">{job.neighborhood} • {job.clientName}</p>
                      {job.comment && (
                        <p className="text-[11px] text-[#43474d] mt-1 italic line-clamp-2">"{job.comment}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#74777e] bg-[#f8f9ff] rounded-xl border border-dashed border-[#d8e2ee]">
                <ImageIcon className="w-8 h-8 mx-auto text-[#c3c6ce] mb-1" />
                <p>Aún no cargaste fotos de trabajos terminados.</p>
                <p className="text-[11px] text-[#9e4300] mt-0.5">Las fotos aumentan un 80% las consultas de vecinos.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. IF PROVIDER IS NOT LOGGED IN: SHOW TABS (REGISTER, LOGIN, APPROVAL)     */
        /* ========================================================================= */
        <div className="space-y-4">
          {/* Sub Navigation Tabs (Visible on all devices: Mobile & Desktop) */}
          <div className="bg-white p-1.5 rounded-2xl border border-[#e2e8f0] shadow-xs grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveView('registro')}
              className={`py-2 px-1.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                activeView === 'registro'
                  ? 'bg-[#0f2942] text-white shadow-xs'
                  : 'text-[#43474d] hover:bg-gray-50'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Registrar</span>
              <span className="text-[9px] bg-[#ffdbcb] text-[#783100] px-1.5 py-0.2 rounded-full font-black hidden xs:inline">
                30d
              </span>
            </button>

            <button
              onClick={() => setActiveView('login')}
              className={`py-2 px-1.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                activeView === 'login'
                  ? 'bg-[#0f2942] text-white shadow-xs'
                  : 'text-[#43474d] hover:bg-gray-50'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Iniciar Sesión</span>
            </button>

            {isDevAdmin && (
              <button
                onClick={() => setActiveView('panel-aprobacion')}
                className={`py-2 px-1.5 sm:px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer relative ${
                  activeView === 'panel-aprobacion'
                    ? 'bg-[#9e4300] text-white shadow-xs'
                    : 'text-[#9e4300] bg-orange-50/80 hover:bg-orange-100 font-bold border border-orange-200'
                }`}
                title="Panel Administrador: Autorizar Prestadores y Suscripciones"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Admin ({pendingPros.length})</span>
              </button>
            )}
          </div>

          {/* TAB 1: REGISTRATION FORM */}
          {activeView === 'registro' && (
            <>
              {/* Header Hero */}
              <div className="bg-gradient-to-br from-[#001428] via-[#0f2942] to-[#1e3a5f] text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-1 bg-[#ffdbcb] text-[#783100] text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    30 Días de Prueba Gratuita Completa
                  </span>
                  <h1 className="text-xl font-bold leading-tight">
                    Brinda tu Oficio o Servicio y recibí clientes de todo el Valle de Lerma
                  </h1>
                  <p className="text-xs text-[#d3e4fe] mt-1.5 leading-relaxed">
                    Registrate con tu nombre de usuario y contraseña para activar tus 30 días de prueba gratuita. Los vecinos te escriben directo a tu WhatsApp.
                  </p>
                </div>
                <div className="absolute right-2 -bottom-4 opacity-15 pointer-events-none">
                  <Wrench className="w-28 h-28" />
                </div>
              </div>

              {/* Benefits points */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-[#e2e8f0] shadow-2xs">
                  <span className="text-[#9e4300] font-bold text-base block">30 Días</span>
                  <span className="text-[10px] text-[#43474d] font-semibold">Prueba gratuita</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#e2e8f0] shadow-2xs">
                  <span className="text-[#2E7D32] font-bold text-base block">Directo</span>
                  <span className="text-[10px] text-[#43474d] font-semibold">A tu WhatsApp</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-[#e2e8f0] shadow-2xs">
                  <span className="text-[#0f2942] font-bold text-base block">Todo el Valle</span>
                  <span className="text-[10px] text-[#43474d] font-semibold">6 localidades</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitRegistration} className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
                  <div>
                    <h2 className="text-sm font-bold text-[#001428] uppercase tracking-wider">
                      Registro de Prestador de Oficio
                    </h2>
                    <p className="text-[11px] text-[#74777e]">
                      Completá tus datos de acceso y tu especialidad
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                    30 días gratis
                  </span>
                </div>

                {registrationError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{registrationError}</span>
                  </div>
                )}

                {/* 1. CUENTA DE ACCESO: Usuario y Contraseña */}
                <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#c3d7f8] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#001428] uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#9e4300]" />
                      <span>1. Creá tu Usuario y Contraseña de Acceso</span>
                    </h3>
                    <span className="text-[10px] bg-[#0f2942] text-white font-bold px-2 py-0.5 rounded-full">
                      Paso Clave
                    </span>
                  </div>
                  <p className="text-[11px] text-[#43474d]">
                    Con estos datos podrás ingresar en cualquier momento desde cualquier celular para gestionar tu perfil y tus 30 días de prueba.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#001428] block mb-1">
                        Nombre de Usuario *
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        placeholder="Ej: roberto.gasista o carmen"
                        className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                      />
                      <span className="text-[10px] text-[#74777e] mt-0.5 block">
                        Minúsculas y sin espacios
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#001428] block mb-1">
                        Contraseña *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 3 caracteres"
                          className="w-full text-xs p-3 pr-10 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-[#74777e] hover:text-[#001428]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-[#74777e] mt-0.5 block">
                        Guardala para iniciar sesión
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. DATOS DE CONTACTO Y OFICIO */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#9e4300] uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>2. Datos de Contacto y Oficio</span>
                  </h3>

                  <div>
                    <label className="text-xs font-bold text-[#001428] block mb-1">
                      Nombre y Apellido / Nombre del Emprendimiento *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Marcelo Alancay o Construcciones Valle"
                      className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#001428] block mb-1">
                        Rubro principal *
                      </label>
                      <select
                        value={categoryId}
                        onChange={handleCategoryChange}
                        className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#001428] block mb-1">
                        Departamento / Localidad *
                      </label>
                      <select
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                      >
                        {neighborhoods.filter(n => n.id !== 'todos').map((n) => (
                          <option key={n.id} value={n.name}>
                            {n.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#001428] block mb-1">
                        Celular / WhatsApp *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-xs text-[#74777e] font-semibold">
                          +54 9
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="387 555-1234"
                          className="w-full text-xs p-3 pl-14 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                        />
                      </div>
                      <span className="text-[10px] text-[#74777e] mt-0.5 block">
                        Aquí te llegarán los mensajes de los clientes
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#001428] block mb-1">
                        Años de experiencia
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                        className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. DOCUMENTACIÓN DE IDENTIDAD Y CERTIFICACIÓN */}
                <div className="space-y-3 pt-2 border-t border-[#f1f5f9]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#9e4300] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>3. Identidad y Certificación (Opcional)</span>
                    </h3>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Insignia Verificada
                    </span>
                  </div>
                  <p className="text-[11px] text-[#43474d] leading-relaxed">
                    Adjuntar tu DNI y constancia de matrícula o título permite verificar tu cuenta con el sello de <strong>Matrícula Verificada</strong> para dar máxima confianza a los vecinos.
                  </p>

                  {/* Documento Nacional de Identidad (DNI) */}
                  <div className="p-3.5 bg-[#f8faff] rounded-xl border border-[#dce7f5] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#001428]" />
                        <label className="text-xs font-bold text-[#001428]">
                          Documento Nacional de Identidad (DNI)
                        </label>
                      </div>
                      <span className="text-[10px] text-[#74777e]">Foto frente / dorso</span>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={dniNumber}
                        onChange={(e) => setDniNumber(e.target.value)}
                        placeholder="Número de DNI (Ej: 34.567.890)"
                        className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                      />
                    </div>

                    {/* Foto del DNI Upload */}
                    {dniPhotoUrl ? (
                      <div className="relative rounded-xl border border-emerald-300 bg-emerald-50/60 p-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={dniPhotoUrl}
                            alt="DNI adjunto"
                            className="w-14 h-11 object-cover rounded-lg border border-emerald-200 shadow-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Foto del DNI adjunta</span>
                            </span>
                            <p className="text-[10px] text-emerald-800 truncate">
                              Lista para validación de seguridad
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDniPhotoUrl('')}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer shrink-0 transition-colors"
                          title="Eliminar foto de DNI"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full py-2.5 px-3 bg-white border border-dashed border-[#9e4300] hover:bg-[#ffdbcb]/10 text-[#9e4300] text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs">
                        <Camera className="w-4 h-4 text-[#9e4300]" />
                        <span>{isUploadingDni ? 'Cargando foto...' : 'Subir o fotografiar DNI'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDniFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Certificación o Matrícula Profesional */}
                  <div className="p-3.5 bg-[#f8faff] rounded-xl border border-[#dce7f5] space-y-3">
                    <label className="flex items-start justify-between gap-3 cursor-pointer">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-[#9e4300]" />
                          <span className="text-xs font-bold text-[#001428]">
                            ¿Contás con matrícula, certificado o constancia de oficio?
                          </span>
                        </div>
                        <p className="text-[11px] text-[#43474d] mt-0.5 leading-snug">
                          Habilita la insignia oficial de <strong>Matrícula Verificada</strong> (ej: gasistas, electricistas, refrigeración, instaladores).
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasCertification}
                        onChange={(e) => setHasCertification(e.target.checked)}
                        className="w-4 h-4 mt-1 text-[#9e4300] rounded accent-[#9e4300] shrink-0"
                      />
                    </label>

                    {hasCertification && (
                      <div className="pt-2 border-t border-[#dce7f5] space-y-2.5 animate-in fade-in duration-200">
                        <div>
                          <label className="text-xs font-bold text-[#001428] block mb-1">
                            Número de Matrícula o Constancia Habilitante
                          </label>
                          <input
                            type="text"
                            value={matricula}
                            onChange={(e) => setMatricula(e.target.value)}
                            placeholder="Ej: Matrícula GAS-8942 / Copipa / Certificado UTN"
                            className="w-full text-xs p-2.5 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                          />
                        </div>

                        {/* Foto de la Constancia / Certificado Upload */}
                        {certificatePhotoUrl ? (
                          <div className="relative rounded-xl border border-emerald-300 bg-emerald-50/60 p-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={certificatePhotoUrl}
                                alt="Constancia adjunta"
                                className="w-14 h-11 object-cover rounded-lg border border-emerald-200 shadow-2xs shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Constancia de Matrícula adjunta</span>
                                </span>
                                <p className="text-[10px] text-emerald-800 truncate">
                                  Se activará la insignia de Matrícula Verificada
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCertificatePhotoUrl('')}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer shrink-0 transition-colors"
                              title="Eliminar constancia"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full py-2.5 px-3 bg-white border border-dashed border-[#0f2942] hover:bg-gray-50 text-[#0f2942] text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs">
                            <Upload className="w-4 h-4 text-[#0f2942]" />
                            <span>{isUploadingCert ? 'Cargando constancia...' : 'Subir foto o constancia de Certificado / Carnet'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCertFileChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. OPCIONES Y BIO */}
                <div className="space-y-3 pt-2 border-t border-[#f1f5f9]">
                  <h3 className="text-xs font-bold text-[#9e4300] uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>4. Opciones de Servicio y Presentación</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] cursor-pointer">
                      <span className="text-xs font-medium text-[#001428]">
                        ¿Hacés guardias de urgencia?
                      </span>
                      <input
                        type="checkbox"
                        checked={emergencyDuty}
                        onChange={(e) => setEmergencyDuty(e.target.checked)}
                        className="w-4 h-4 text-[#9e4300] rounded accent-[#9e4300]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl border border-[#e2e8f0] bg-[#f8f9ff] cursor-pointer">
                      <span className="text-xs font-medium text-[#001428]">
                        ¿Ofrecés presupuesto sin cargo?
                      </span>
                      <input
                        type="checkbox"
                        checked={quoteWithoutCharge}
                        onChange={(e) => setQuoteWithoutCharge(e.target.checked)}
                        className="w-4 h-4 text-[#9e4300] rounded accent-[#9e4300]"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#001428] block mb-1">
                      Breve presentación para los vecinos del Valle de Lerma
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Contá sobre tus especialidades, puntualidad, herramientas y cobertura de trabajo..."
                      className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                    />
                  </div>
                </div>

                {/* 5. PALABRAS DE BÚSQUEDA Y RUBROS ADICIONALES */}
                <div className="space-y-3 pt-2 border-t border-[#f1f5f9]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#9e4300] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>5. Palabras de Búsqueda y Rubros Adicionales (Opcional)</span>
                    </h3>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      Buscador Directo
                    </span>
                  </div>

                  <p className="text-[11px] text-[#43474d] leading-relaxed">
                    ¿Vendés otros artículos o realizás otros trabajos además de tu rubro principal? (Ejemplo: si tenés un corralón y también vendés artículos de pesca, o si hacés fletes y desmalezado). Escribí palabras separadas por coma para que los vecinos te encuentren cuando busquen esos términos específicos.
                  </p>

                  <div>
                    <label className="text-xs font-bold text-[#001428] block mb-1">
                      Palabras o productos clave separados por comas
                    </label>
                    <textarea
                      rows={2}
                      value={searchKeywordsText}
                      onChange={(e) => setSearchKeywordsText(e.target.value)}
                      placeholder="Ej. cañas de pescar, riles, reels, sillas plegables, anzuelos, carnada, camping, sombrillas..."
                      className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                    />
                  </div>

                  {/* Suggested quick chips */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[10px] text-[#74777e] font-medium">Ejemplos para agregar:</span>
                    {['cañas de pescar', 'riles', 'sillas plegables', 'artículos de pesca', 'carnadas', 'fletes', 'camping'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          const current = searchKeywordsText.trim();
                          if (!current) setSearchKeywordsText(sug);
                          else if (!current.toLowerCase().includes(sug.toLowerCase())) setSearchKeywordsText(current + ', ' + sug);
                        }}
                        className="px-2 py-0.5 bg-gray-100 hover:bg-orange-50 hover:text-[#9e4300] text-gray-700 text-[10px] font-semibold rounded border border-gray-200 transition-colors cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>

                  {/* Live preview of parsed palabrasClave array */}
                  {searchKeywordsText.trim() && (
                    <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200">
                      <span className="text-[10px] font-bold text-amber-950 block mb-1.5 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-amber-700" />
                        <span>Palabras clave que se indexarán para las búsquedas ({searchKeywordsText.split(/[,;\n]+/).map(k => k.trim()).filter(Boolean).length}):</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {searchKeywordsText.split(/[,;\n]+/).map(k => k.trim()).filter(Boolean).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-white text-amber-900 border border-amber-300 text-[10px] font-semibold rounded-md flex items-center gap-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#ffdbcb]" />
                  <span>Registrarme y Activar mis 30 Días Gratis</span>
                </button>
              </form>
            </>
          )}

          {/* TAB 2: LOGIN FORM */}
          {activeView === 'login' && (
            <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#e2e8f0]">
                <div className="w-10 h-10 rounded-xl bg-[#0f2942] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <LogIn className="w-5 h-5 text-[#ffdbcb]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#001428]">Iniciar Sesión de Prestador</h2>
                  <p className="text-[11px] text-[#74777e]">
                    Ingresá con tu usuario y contraseña para acceder a tu panel y consultar tus 30 días gratis
                  </p>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-[#001428] block mb-1">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Ej: carmen o roberto.gasista"
                    className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#001428] block mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0f2942] hover:bg-[#001428] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Ingresar a mi Panel Pro
                </button>
              </form>

              {/* Acceso Especial Administrador General - Solo para Jorge */}
              {isDevAdmin && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#001428] via-[#0f2942] to-[#1e3a5f] text-white border border-[#1e3e60] shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#ffdbcb] text-[#783100] flex items-center justify-center font-bold">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white">¿Sos el Administrador general?</h3>
                        <p className="text-[10px] text-[#ffdbcb]">No necesitás registrarte como prestador</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                      Panel Admin
                    </span>
                  </div>

                  <p className="text-[11px] text-[#d3e4fe] leading-relaxed">
                    Para autorizar solicitudes, auditar DNI o matrículas de prestadores y habilitar el abono mensual o anual cuando paguen su suscripción, podés ingresar directamente aquí:
                  </p>

                  <button
                    type="button"
                    onClick={() => setActiveView('panel-aprobacion')}
                    className="w-full py-2.5 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Ingresar al Panel Administrador</span>
                  </button>
                </div>
              )}

              {/* Cuentas de Demostración para Prueba Inmediata */}
              <div className="pt-3 border-t border-[#f1f5f9] space-y-2">
                <p className="text-[11px] font-bold text-[#43474d] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#9e4300]" />
                  <span>Cuentas de demostración (iniciar con 1 clic para probar):</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginUsername('roberto');
                      setLoginPassword('123');
                      if (onLoginProfessional) onLoginProfessional('roberto', '123');
                    }}
                    className="p-3 rounded-xl border border-[#d8e2ee] bg-[#f8f9ff] hover:bg-[#eef4ff] text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#001428]">Roberto Gómez</p>
                      <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded">EJEMPLO</span>
                    </div>
                    <p className="text-[10px] text-[#9e4300] font-semibold">Albañil • Cerrillos</p>
                    <p className="text-[9px] text-[#74777e] mt-0.5">Usuario: roberto • Clave: 123</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginUsername('carlos');
                      setLoginPassword('123');
                      if (onLoginProfessional) onLoginProfessional('carlos', '123');
                    }}
                    className="p-3 rounded-xl border border-[#d8e2ee] bg-[#f8f9ff] hover:bg-[#eef4ff] text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-[#001428]">Carlos Mamaní</p>
                      <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded">EJEMPLO</span>
                    </div>
                    <p className="text-[10px] text-[#9e4300] font-semibold">Electricista • Rosario de Lerma</p>
                    <p className="text-[9px] text-[#74777e] mt-0.5">Usuario: carlos • Clave: 123</p>
                  </button>

                  {/* CUENTA DEMO CON PERÍODO DE PRUEBA CADUCADO: Muestra cartel del 3875286914 */}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginUsername('marcos.demo');
                      setLoginPassword('123');
                      if (onLoginProfessional) onLoginProfessional('marcos.demo', '123');
                    }}
                    className="p-3 rounded-xl border-2 border-red-300 bg-red-50/70 hover:bg-red-100/80 text-left transition-colors cursor-pointer sm:col-span-2 relative"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <p className="text-xs font-bold text-red-900">
                          Marcos Benítez (DEMO PRUEBA CADUCADA)
                        </p>
                      </div>
                      <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Bloqueado
                      </span>
                    </div>
                    <p className="text-[10px] text-red-700 font-semibold mt-0.5">
                      Albañil • Período de 30 días vencido
                    </p>
                    <p className="text-[10px] text-red-800 font-bold mt-1 bg-white/70 p-1.5 rounded-lg border border-red-200">
                      👉 Tocá acá para probar el cartel: "Su período de prueba ha caducado... comunicarse al 3875286914"
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN APPROVAL PANEL & SUBSCRIPTION MANAGEMENT */}
          {activeView === 'panel-aprobacion' && (
            !isDevAdmin ? (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e2e8f0] shadow-sm text-center space-y-4 max-w-md mx-auto my-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#9e4300] flex items-center justify-center mx-auto shadow-xs border border-orange-200">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#001428]">Acceso Restringido al Administrador</h3>
                  <p className="text-xs text-[#5a5f67] leading-relaxed">
                    Esta sección es exclusiva de <strong>Jorge Lopez (Desarrollador)</strong> para gestionar las altas de prestadores y las publicidades.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveView('registro')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    Volver
                  </button>
                  {onTriggerAdminUnlock && (
                    <button
                      type="button"
                      onClick={onTriggerAdminUnlock}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Ingresar Clave</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
            <div className="space-y-4">
              {loggedInPro && (
                <div className="bg-gradient-to-r from-blue-900 to-[#0f2942] text-white p-3 rounded-xl flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#a3f69c]" />
                    <span>
                      Modo Admin activo (Sesión de prestador: <strong>{loggedInPro.name}</strong>)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('registro')}
                    className="px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-white font-bold transition-colors cursor-pointer"
                  >
                    Volver a mi Panel Pro
                  </button>
                </div>
              )}

              {/* Cartel Exclusivo del Administrador: Descargar ZIP, APK y Guía Ubuntu */}
              <div className="bg-gradient-to-br from-[#001428] via-[#09223a] to-[#122e4d] border border-amber-400/30 rounded-2xl p-4 sm:p-5 text-white shadow-md space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#001428] flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-white">
                        Descarga de Código Fuente, APK y Despliegue en Servidor
                      </h3>
                      <span className="text-[10px] bg-amber-400 text-[#001428] font-black px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                        ZIP 2.48 MB
                      </span>
                      <span className="text-[10px] bg-emerald-500 text-white font-black px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                        APK Android
                      </span>
                    </div>
                    <p className="text-xs text-[#d3e4fe] mt-1 leading-relaxed">
                      Descargá el archivo completo con el código fuente (.zip), el instalador directo para celulares Android (.apk) o consultá la configuración de Docker y Nginx para tu servidor Linux.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/10">
                  <a
                    href="/oficios-valle-de-lerma.zip"
                    download="oficios-valle-de-lerma.zip"
                    className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-[#001428] text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm border border-amber-300 text-center"
                    title="Descargar paquete ZIP con todos los archivos del proyecto y Docker"
                  >
                    <Download className="w-4 h-4 text-[#001428] shrink-0" />
                    <span>Descargar ZIP (Código)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsApkModalOpen(true)}
                    className="py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 active:scale-95 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm border border-emerald-400 text-center"
                    title="Descargar paquete APK instalador para celulares Android"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-200 shrink-0" />
                    <span>Descargar APK (Android)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDockerModalOpen(true)}
                    className="py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm border border-blue-400 text-center"
                    title="Ver docker-compose.yml y comandos para producción"
                  >
                    <Layers className="w-4 h-4 text-blue-200 shrink-0" />
                    <span>Docker Compose (Producción)</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
                {/* Header del Panel Administrador con Desarrollador y Acciones */}
                <div className="mb-3.5 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-[#001428] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#9e4300]" />
                      Panel Administrador
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#9e4300] text-xs font-black border border-orange-200">
                      Desarrollador: Jorge Lopez
                    </span>
                    <a
                      href="tel:3875286914"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold border border-emerald-300 transition-colors"
                      title="Llamar o WhatsApp a Jorge Lopez"
                    >
                      <Phone className="w-3 h-3 text-emerald-700" />
                      <span>Tel: 3875286914</span>
                    </a>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      <Cloud className="w-3 h-3 text-emerald-600 animate-pulse" /> Cloud Firebase Conectado
                    </span>
                    <a
                      href="/oficios-valle-de-lerma.zip"
                      download="oficios-valle-de-lerma.zip"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#001428] text-[11px] font-black border border-amber-600 shadow-2xs transition-colors cursor-pointer"
                      title="Descargar archivo ZIP de la aplicación"
                    >
                      <Download className="w-3 h-3 text-[#001428]" />
                      <span>Descargar ZIP</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsApkModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold border border-emerald-500 shadow-2xs transition-colors cursor-pointer"
                      title="Descargar APK oficial para Android"
                    >
                      <Smartphone className="w-3 h-3 text-emerald-200" />
                      <span>Descargar APK</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDockerModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-900 hover:bg-blue-800 text-white text-[11px] font-bold border border-blue-700 shadow-2xs transition-colors cursor-pointer"
                      title="Ver configuración y comandos de Docker Compose para desplegar en tu servidor"
                    >
                      <Layers className="w-3 h-3 text-blue-300" />
                      <span>Docker Compose (Producción)</span>
                    </button>
                    {onLockAdmin && (
                      <button
                        type="button"
                        onClick={onLockAdmin}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-600 text-xs font-bold border border-gray-200 transition-colors cursor-pointer"
                        title="Ocultar botón y bloquear panel en este celular"
                      >
                        <Lock className="w-3 h-3" />
                        <span>Ocultar botón en este celular</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#43474d]">
                    Supervisá las solicitudes, suscripciones de 30 días, configuración de rubros y publicidad en la nube con sincronización instantánea.
                  </p>
                </div>

                {/* Sub-section Switcher Tabs: Grid de doble línea responsivo que nunca se desborda del margen */}
                <div className="w-full mb-3 p-1.5 bg-gray-100/90 rounded-2xl border border-gray-200/80 grid grid-cols-2 md:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAdminSubSection('estadisticas')}
                    className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      adminSubSection === 'estadisticas'
                        ? 'bg-[#001428] text-white shadow-xs'
                        : 'text-[#5a5f67] hover:text-[#001428] hover:bg-white/60'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="leading-tight">Estadísticas y Logs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSubSection('prestadores')}
                    className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      adminSubSection === 'prestadores'
                        ? 'bg-white text-[#001428] shadow-xs'
                        : 'text-[#5a5f67] hover:text-[#001428] hover:bg-white/60'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-[#9e4300] shrink-0" />
                    <span className="leading-tight">
                      Prestadores ({professionals.length})
                      {pendingPros.length > 0 && (
                        <span className="ml-1 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full inline-block">
                          {pendingPros.length}
                        </span>
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSubSection('publicidad')}
                    className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      adminSubSection === 'publicidad'
                        ? 'bg-[#9e4300] text-white shadow-xs'
                        : 'text-[#5a5f67] hover:text-[#001428] hover:bg-white/60'
                    }`}
                  >
                    <Megaphone className="w-4 h-4 text-orange-200 shrink-0" />
                    <span className="leading-tight">
                      Publicidades
                      {activeAdsTodayCount > 0 ? (
                        <span className="ml-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full inline-block">
                          {activeAdsTodayCount} hoy
                        </span>
                      ) : (
                        <span className="ml-1 bg-gray-400 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full inline-block">
                          0 hoy
                        </span>
                      )}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminSubSection('rubros-localidades')}
                    className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      adminSubSection === 'rubros-localidades'
                        ? 'bg-amber-400 text-[#001428] shadow-xs'
                        : 'text-[#5a5f67] hover:text-[#001428] hover:bg-white/60'
                    }`}
                  >
                    <ListFilter className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="leading-tight">Servicios y Localidades</span>
                  </button>
                </div>

                {/* Filter tabs and quick metrics only when prestadores sub-section is active */}
                {adminSubSection === 'prestadores' && (
                  <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
                    {/* Quick Metric Bar for Administrator */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-200/60 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-blue-800 font-semibold truncate">Clientes que usaron</p>
                          <p className="font-black text-xs text-[#001428] truncate">{analytics.uniqueClientsCount} únicos • {analytics.totalClientVisits} visitas</p>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/60 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-emerald-800 font-semibold truncate">Prueba Activa (30d)</p>
                          <p className="font-black text-xs text-emerald-950 truncate">{trialActivePros.length} vigentes</p>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-red-50/80 border border-red-200/60 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-red-800 font-semibold truncate">Prueba Caducada</p>
                          <p className="font-black text-xs text-red-950 truncate">{trialExpiredPros.length} a contactar</p>
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-purple-50/80 border border-purple-200/60 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-purple-800 font-semibold truncate">Continuando Uso</p>
                          <p className="font-black text-xs text-purple-950 truncate">{continuingUsePros.length} abonados</p>
                        </div>
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      <button
                        onClick={() => setApprovalFilter('pendiente')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          approvalFilter === 'pendiente'
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'bg-gray-100 text-[#43474d] hover:bg-gray-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pendientes ({pendingPros.length})</span>
                      </button>
                      
                      <button
                        onClick={() => setApprovalFilter('prueba_activa')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          approvalFilter === 'prueba_activa'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Prueba Activa ({trialActivePros.length})</span>
                      </button>

                      <button
                        onClick={() => setApprovalFilter('prueba_caducada')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          approvalFilter === 'prueba_caducada'
                            ? 'bg-red-600 text-white shadow-2xs'
                            : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Prueba Caducada ({trialExpiredPros.length})</span>
                      </button>

                      <button
                        onClick={() => setApprovalFilter('continuando_uso')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          approvalFilter === 'continuando_uso'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Continuando Uso ({continuingUsePros.length})</span>
                      </button>

                      <button
                        onClick={() => setApprovalFilter('aprobado')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                          approvalFilter === 'aprobado'
                            ? 'bg-gray-800 text-white shadow-2xs'
                            : 'bg-gray-100 text-[#43474d] hover:bg-gray-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Aprobados ({approvedPros.length})</span>
                      </button>

                      <button
                        onClick={() => setApprovalFilter('todos')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer ${
                          approvalFilter === 'todos'
                            ? 'bg-[#001428] text-white shadow-2xs'
                            : 'bg-gray-100 text-[#43474d] hover:bg-gray-200'
                        }`}
                      >
                        Todos ({professionals.length})
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RENDER CONTENT BASED ON SUB-SECTION */}
              {adminSubSection === 'estadisticas' && (
                <AdminStatsDashboard
                  analytics={analytics}
                  professionals={professionals}
                  requests={requests}
                  onSelectFilter={(fil) => {
                    setApprovalFilter(fil);
                    setAdminSubSection('prestadores');
                  }}
                  onSwitchToPrestadores={() => setAdminSubSection('prestadores')}
                  onOpenApkModal={() => setIsApkModalOpen(true)}
                  onOpenDockerModal={() => setIsDockerModalOpen(true)}
                />
              )}

              {adminSubSection === 'publicidad' && onTestAdvertisement && (
                <AdminAdvertisementConfig
                  advertisements={currentAds}
                  onSaveAdvertisements={onSaveAdvertisements}
                  advertisement={advertisement}
                  onSaveAdvertisement={onSaveAdvertisement}
                  onTestAdvertisement={onTestAdvertisement}
                />
              )}

              {adminSubSection === 'rubros-localidades' && (
                <AdminCategoriesNeighborhoodsConfig
                  categories={categories}
                  neighborhoods={neighborhoods}
                  onSaveCategories={onSaveCategories || (() => {})}
                  onSaveNeighborhoods={onSaveNeighborhoods || (() => {})}
                />
              )}

              {adminSubSection === 'prestadores' && (
                <>

              {/* List of professionals with Subscription Management */}
              {displayedPros.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h3 className="font-bold text-sm text-[#001428]">
                    No hay profesionales en este filtro.
                  </h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedPros.map((pro) => {
                    const isExpired = pro.isTrialExpired || pro.subscriptionStatus === 'caducada' || pro.trialActive === false;
                    const isMonthly = pro.subscriptionPlan === 'abono_mensual' && pro.subscriptionStatus === 'activa';
                    const isAnnual = pro.subscriptionPlan === 'abono_anual' && pro.subscriptionStatus === 'activa';

                    return (
                      <div key={pro.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={pro.avatar}
                              alt={pro.name}
                              className="w-12 h-12 rounded-full object-cover border border-[#e2e8f0]"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-sm text-[#001428]">{pro.name}</h3>
                                {pro.isExample && (
                                  <span className="text-[10px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded shadow-2xs">
                                    EJEMPLO
                                  </span>
                                )}
                                {pro.username && (
                                  <span className="text-[10px] text-[#74777e] bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                                    @{pro.username}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#9e4300] font-semibold">{pro.trade}</p>
                              <p className="text-[11px] text-[#74777e]">{pro.neighborhood} • Cel: {pro.phone}</p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0">
                            {isExpired ? (
                              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full border border-red-300 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                <span>Prueba Caducada</span>
                              </span>
                            ) : isMonthly ? (
                              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-300 flex items-center gap-1">
                                <Check className="w-3 h-3 text-blue-600" />
                                <span>Abono Mensual</span>
                              </span>
                            ) : isAnnual ? (
                              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-300 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                <span>Abono Anual</span>
                              </span>
                            ) : (
                              <span className="text-[10px] bg-[#ffdbcb] text-[#783100] font-bold px-2 py-0.5 rounded-full border border-[#ffb68f]">
                                30 Días Gratis
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Documentos Adjuntos (DNI y Matrícula) */}
                        {(pro.dniNumber || pro.dniPhotoUrl || pro.matricula || pro.certificatePhotoUrl) && (
                          <div className="p-2.5 rounded-xl bg-[#f8faff] border border-[#dce7f5] text-xs flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-bold text-[#74777e] uppercase tracking-wider flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#9e4300]" />
                              <span>Documentación:</span>
                            </span>
                            {pro.dniNumber && (
                              <span className="text-[#001428]">
                                <strong>DNI:</strong> {pro.dniNumber}
                              </span>
                            )}
                            {pro.dniPhotoUrl && (
                              <button
                                type="button"
                                onClick={() => setViewingDocumentModal({ title: `Foto DNI - ${pro.name}`, imageUrl: pro.dniPhotoUrl! })}
                                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Ver Foto DNI</span>
                              </button>
                            )}
                            {pro.matricula && (
                              <span className="text-emerald-900 bg-emerald-100/70 px-2 py-0.5 rounded-lg border border-emerald-200 font-semibold">
                                <strong>Matrícula:</strong> {pro.matricula}
                              </span>
                            )}
                            {pro.certificatePhotoUrl && (
                              <button
                                type="button"
                                onClick={() => setViewingDocumentModal({ title: `Constancia / Certificado - ${pro.name}`, imageUrl: pro.certificatePhotoUrl! })}
                                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <ShieldCheck className="w-3 h-3" />
                                <span>Ver Constancia</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Palabras clave de búsqueda configuradas */}
                        {(((pro.palabrasClave && pro.palabrasClave.length > 0) || (pro.searchKeywords && pro.searchKeywords.length > 0))) && (
                          <div className="text-xs p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                            <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1 mb-1">
                              <Tag className="w-3 h-3 text-amber-700" />
                              <span>Palabras clave de búsqueda ({((pro.palabrasClave && pro.palabrasClave.length > 0) ? pro.palabrasClave : (pro.searchKeywords || [])).length}):</span>
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {((pro.palabrasClave && pro.palabrasClave.length > 0) ? pro.palabrasClave : (pro.searchKeywords || [])).map((kw, i) => (
                                <span key={i} className="text-[10px] bg-white border border-amber-300 text-amber-900 font-semibold px-2 py-0.5 rounded-md shadow-2xs">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Subscription details & Admin Actions */}
                        <div className="pt-3 border-t border-[#f1f5f9] bg-[#f8faff] -mx-5 -mb-5 p-4 rounded-b-2xl">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="text-xs">
                              <p className="font-bold text-[#001428]">
                                Estado de Ingreso: {isExpired ? (
                                  <span className="text-red-600">🔴 Bloqueado (Debe comunicarse al 3875286914)</span>
                                ) : (
                                  <span className="text-emerald-700 font-semibold">🟢 Permitido</span>
                                )}
                              </p>
                              <p className="text-[11px] text-[#43474d] mt-0.5">
                                Cuando el prestador pague su abono, habilitá su ingreso aquí:
                              </p>
                            </div>

                            {/* Action Buttons for the Admin */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {onUpdateSubscription && (
                                <>
                                  {/* Permitir Abono Mensual */}
                                  <button
                                    type="button"
                                    onClick={() => onUpdateSubscription(pro.id, 'abono_mensual', 'activa')}
                                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                                    title="El prestador abonó el mes: permitir ingreso"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Habilitar Mensual</span>
                                  </button>

                                  {/* Permitir Abono Anual */}
                                  <button
                                    type="button"
                                    onClick={() => onUpdateSubscription(pro.id, 'abono_anual', 'activa')}
                                    className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                                    title="El prestador abonó el año: permitir ingreso"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    <span>Habilitar Anual</span>
                                  </button>

                                  {/* Forzar/Simular Caducidad */}
                                  {!isExpired ? (
                                    <button
                                      type="button"
                                      onClick={() => onUpdateSubscription(pro.id, 'prueba_gratuita', 'caducada')}
                                      className="px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                                      title="Bloquear ingreso simulando caducidad de prueba"
                                    >
                                      Bloquear (Caducar)
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => onUpdateSubscription(pro.id, 'prueba_gratuita', 'activa')}
                                      className="px-2 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                                      title="Dar 30 días de prueba gratuita"
                                    >
                                      Reiniciar 30 días
                                    </button>
                                  )}
                                </>
                              )}

                              {/* Preview cartel directly */}
                              {onShowExpiredModal && (
                                <button
                                  type="button"
                                  onClick={() => onShowExpiredModal(pro)}
                                  className="px-2 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-[11px] font-semibold rounded-lg cursor-pointer"
                                  title="Ver cómo ve el prestador el cartel de contacto al 3875286914"
                                >
                                  Ver Cartel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Vista de Documentación (DNI o Certificado/Constancia) */}
      {viewingDocumentModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setViewingDocumentModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 bg-[#0f2942] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#ffdbcb]" />
                <h4 className="font-bold text-xs truncate">{viewingDocumentModal.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setViewingDocumentModal(null)}
                className="p-1 text-white hover:bg-white/20 rounded-full cursor-pointer transition-colors"
                title="Cerrar vista"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-100 min-h-[220px] max-h-[75vh] overflow-auto">
              <img
                src={viewingDocumentModal.imageUrl}
                alt={viewingDocumentModal.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl border border-gray-300 shadow-sm"
              />
            </div>
            <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#74777e]">
                Documento respaldatorio cargado por el prestador
              </span>
              <button
                type="button"
                onClick={() => setViewingDocumentModal(null)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Despliegue con Docker Compose exclusivo para el Administrador */}
      <DockerDeployModal
        isOpen={isDockerModalOpen}
        onClose={() => setIsDockerModalOpen(false)}
      />

      {/* Modal de Descarga e Instalación del APK de Android */}
      <AdminApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
};
