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
  Smartphone,
  ZoomIn,
  Briefcase,
  DollarSign,
  Crosshair,
  Navigation,
  Compass
} from 'lucide-react';
import { Professional, ServiceCategory, Neighborhood, CompletedJob, AppAdvertisement, AppAnalytics, ServiceRequest, UsefulPhone } from '../types';
import { AdminAdvertisementConfig } from './AdminAdvertisementConfig';
import { AdminStatsDashboard } from './AdminStatsDashboard';
import { AdminCategoriesNeighborhoodsConfig } from './AdminCategoriesNeighborhoodsConfig';
import { AdminUsefulPhonesConfig } from './AdminUsefulPhonesConfig';
import { DockerDeployModal } from './DockerDeployModal';
import { AdminApkModal } from './AdminApkModal';
import { DEFAULT_ANALYTICS } from '../lib/firebase';
import { DniQualityBadge } from './DniQualityBadge';
import { analyzeDniImageQuality, DniQualityResult } from '../utils/imageQualityChecker';


interface SerProScreenProps {
  categories: ServiceCategory[];
  neighborhoods: Neighborhood[];
  onSaveCategories?: (updated: ServiceCategory[]) => void;
  onSaveNeighborhoods?: (updated: Neighborhood[]) => void;
  usefulPhones?: UsefulPhone[];
  onSaveUsefulPhones?: (updated: UsefulPhone[]) => void;
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
  onOpenManualesModal?: () => void;
}

export const SerProScreen: React.FC<SerProScreenProps> = ({
  categories,
  neighborhoods,
  onSaveCategories,
  onSaveNeighborhoods,
  usefulPhones,
  onSaveUsefulPhones,
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
  onLockAdmin,
  onOpenManualesModal
}) => {
  // Navigation between registration, login, profile, and approval panel
  const [activeView, setActiveView] = useState<'registro' | 'login' | 'panel-aprobacion'>(initialView || 'registro');
  const [approvalFilter, setApprovalFilter] = useState<'pendiente' | 'aprobado' | 'prueba_activa' | 'prueba_caducada' | 'continuando_uso' | 'todos'>('pendiente');
  const [adminSubSection, setAdminSubSection] = useState<'prestadores' | 'publicidad' | 'estadisticas' | 'rubros-localidades' | 'telefonos-utiles'>('prestadores');

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
  const [dniQualityResult, setDniQualityResult] = useState<DniQualityResult | null>(null);
  const [isAnalyzingDniQuality, setIsAnalyzingDniQuality] = useState(false);

  // Estados de calidad visual de DNI para el panel del prestador logueado
  const [workerDniQuality, setWorkerDniQuality] = useState<DniQualityResult | null>(null);
  const [isAnalyzingWorkerDni, setIsAnalyzingWorkerDni] = useState(false);
  const [isUpdatingWorkerDni, setIsUpdatingWorkerDni] = useState(false);
  const [newWorkerDniUrl, setNewWorkerDniUrl] = useState('');
  const [newWorkerDniQuality, setNewWorkerDniQuality] = useState<DniQualityResult | null>(null);
  const [isAnalyzingNewWorkerDni, setIsAnalyzingNewWorkerDni] = useState(false);
  const [workerDniUpdateSuccess, setWorkerDniUpdateSuccess] = useState<string | null>(null);

  // Estado de análisis para el modal de vista de documento
  const [viewingModalDniQuality, setViewingModalDniQuality] = useState<DniQualityResult | null>(null);
  const [isAnalyzingModalDni, setIsAnalyzingModalDni] = useState(false);

  const [viewingDocumentModal, setViewingDocumentModal] = useState<{ title: string; imageUrl: string } | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [isDockerModalOpen, setIsDockerModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // WhatsApp verification state
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [generatedVerificationCode, setGeneratedVerificationCode] = useState('');
  const [inputVerificationCode, setInputVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Coverage zones (localities where the professional is available to work)
  const [coverageZones, setCoverageZones] = useState<string[]>(['Cerrillos']);

  // GPS Geolocation state for auto-suggesting Valle de Lerma town
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [locationDetectedInfo, setLocationDetectedInfo] = useState<{
    locality: string;
    distanceKm: number;
    accuracyMeters?: number;
    latitude?: number;
    longitude?: number;
    message?: string;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Live camera selfie state (camera-only capture, stamped timestamp, anti-gallery)
  const [liveSelfieUrl, setLiveSelfieUrl] = useState('');
  const [photoTakenAt, setPhotoTakenAt] = useState<string | null>(null);
  const [photoCaptureTimestamp, setPhotoCaptureTimestamp] = useState<number | null>(null);
  const [photoValidationStatus, setPhotoValidationStatus] = useState<'valid' | 'gallery_rejected' | 'expired' | null>(null);
  const [photoValidationError, setPhotoValidationError] = useState<string | null>(null);

  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Valle de Lerma towns coordinates
  const VALLE_DE_LERMA_TOWNS = [
    { name: 'Cerrillos', lat: -24.8983, lng: -65.4850 },
    { name: 'La Merced', lat: -24.9664, lng: -65.4883 },
    { name: 'El Carril', lat: -25.0742, lng: -65.5511 },
    { name: 'Chicoana', lat: -25.1050, lng: -65.5342 },
    { name: 'Campo Quijano', lat: -24.9125, lng: -65.6417 },
    { name: 'Rosario de Lerma', lat: -24.9856, lng: -65.5806 },
    { name: 'San Agustín', lat: -24.9928, lng: -65.4219 },
    { name: 'La Silleta', lat: -24.8722, lng: -65.5786 },
    { name: 'Coronel Moldes', lat: -25.2811, lng: -65.4794 },
    { name: 'Salta Capital', lat: -24.7821, lng: -65.4232 }
  ];

  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleDetectUserLocation = () => {
    setLocationError(null);
    setLocationDetectedInfo(null);

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationError('Tu dispositivo o navegador no soporta geolocalización GPS. Podés elegir tu localidad de la lista.');
      return;
    }

    setIsLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        const { latitude, longitude, accuracy } = pos.coords;

        // Buscar la localidad más cercana del Valle de Lerma
        let nearestTown = VALLE_DE_LERMA_TOWNS[0];
        let minDistance = calculateDistanceKm(latitude, longitude, nearestTown.lat, nearestTown.lng);

        for (const town of VALLE_DE_LERMA_TOWNS) {
          const dist = calculateDistanceKm(latitude, longitude, town.lat, town.lng);
          if (dist < minDistance) {
            minDistance = dist;
            nearestTown = town;
          }
        }

        // Buscar coincidencia en la lista de barrios/localidades registradas
        const matchedNeighborhood = neighborhoods.find(n => 
          n.name.toLowerCase() === nearestTown.name.toLowerCase()
        ) || neighborhoods.find(n => 
          nearestTown.name.toLowerCase().includes(n.name.toLowerCase()) || 
          n.name.toLowerCase().includes(nearestTown.name.toLowerCase())
        );

        const chosenLocality = matchedNeighborhood ? matchedNeighborhood.name : nearestTown.name;

        // Auto-seleccionar localidad sugerida
        setNeighborhood(chosenLocality);
        if (!coverageZones.includes(chosenLocality)) {
          setCoverageZones(prev => [...prev, chosenLocality]);
        }

        const isClose = minDistance <= 35;
        const msg = isClose
          ? `Localidad detectada con éxito: ${chosenLocality} (distancia estimada: ${minDistance < 1 ? Math.round(minDistance * 1000) + ' metros' : minDistance.toFixed(1) + ' km'}, precisión GPS: ±${Math.round(accuracy)}m).`
          : `Coordenadas recibidas (Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}). Localidad más cercana en el Valle de Lerma: ${chosenLocality} (${minDistance.toFixed(0)} km).`;

        setLocationDetectedInfo({
          locality: chosenLocality,
          distanceKm: minDistance,
          accuracyMeters: accuracy,
          latitude,
          longitude,
          message: msg
        });
      },
      (err) => {
        setIsLocatingUser(false);
        let errorMsg = 'No se pudo obtener la ubicación GPS.';
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = 'Permiso denegado por el navegador. Habilitá el permiso de ubicación o seleccioná tu localidad manualmente.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = 'Señal de ubicación no disponible en este momento. Seleccioná tu localidad de la lista.';
        } else if (err.code === err.TIMEOUT) {
          errorMsg = 'Tiempo de espera agotado al consultar el GPS. Intentá nuevamente o elegí de la lista.';
        }
        setLocationError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Connect stream to video element when modal opens
  useEffect(() => {
    if (isLiveCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isLiveCameraOpen, cameraStream]);

  const startLiveCamera = async () => {
    setCameraError(null);
    setIsLiveCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      setCameraError('No se pudo acceder a la cámara en vivo. Usá el botón para abrir la cámara de tu celular.');
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsLiveCameraOpen(false);
  };

  const captureFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const now = Date.now();
      setLiveSelfieUrl(dataUrl);
      setPhotoTakenAt(new Date(now).toISOString());
      setPhotoCaptureTimestamp(now);
      setPhotoValidationStatus('valid');
      setPhotoValidationError(null);
    }
    stopLiveCamera();
  };

  const handleNativeCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const now = Date.now();
    const fileModified = file.lastModified;
    const ageSeconds = (now - fileModified) / 1000;
    const ageMinutes = ageSeconds / 60;

    const fileDate = new Date(fileModified);
    const today = new Date(now);
    const isSameDay = fileDate.getFullYear() === today.getFullYear() &&
                      fileDate.getMonth() === today.getMonth() &&
                      fileDate.getDate() === today.getDate();

    // VALIDACIÓN ESTRICTA EN TIEMPO REAL:
    // Si la foto tiene más de 5 minutos de antigüedad o fue tomada en un día previo, o fecha en el futuro
    if (!isSameDay || ageMinutes > 5 || fileModified > now + 60000) {
      setLiveSelfieUrl('');
      setPhotoTakenAt(null);
      setPhotoCaptureTimestamp(null);
      setPhotoValidationStatus('gallery_rejected');
      
      const timeDetail = !isSameDay 
        ? `guardada el ${fileDate.toLocaleDateString('es-AR')}`
        : `tomada hace ${Math.round(ageMinutes)} minutos`;

      setPhotoValidationError(
        `🚫 ARCHIVO RECHAZADO: Se detectó una foto preexistente de la galería (${timeDetail}). Por política estricta de seguridad y prevención de fraudes, está bloqueada la carga de fotos de la galería. Debés tomar una foto en vivo en este preciso instante con la cámara del celular.`
      );
      e.target.value = '';
      return;
    }

    // Foto tomada en tiempo real verificada
    const reader = new FileReader();
    reader.onload = (event) => {
      setLiveSelfieUrl(event.target?.result as string);
      setPhotoTakenAt(new Date(now).toISOString());
      setPhotoCaptureTimestamp(now);
      setPhotoValidationStatus('valid');
      setPhotoValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSendVerificationCode = () => {
    setVerificationError(null);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 7) {
      setVerificationError('Ingresá un número de celular de al menos 7 dígitos (ej: 387 5286914).');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedVerificationCode(code);
    setVerificationCodeSent(true);
    // WhatsApp URL to receive the code
    const fullPhone = cleanPhone.startsWith('54') ? cleanPhone : `549${cleanPhone}`;
    const msg = encodeURIComponent(`Tu código de verificación para Oficios Valle de Lerma es: *${code}*`);
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
  };

  const handleConfirmVerificationCode = () => {
    setVerificationError(null);
    if (!inputVerificationCode.trim()) {
      setVerificationError('Ingresá el código de 6 dígitos.');
      return;
    }
    if (inputVerificationCode.trim() === generatedVerificationCode) {
      setPhoneVerified(true);
      setVerificationError(null);
    } else {
      setVerificationError('El código ingresado no coincide con el enviado a tu WhatsApp. Intentá nuevamente.');
    }
  };

  const toggleCoverageZone = (zoneName: string) => {
    setCoverageZones(prev => {
      if (prev.includes(zoneName)) {
        // don't allow empty if it's the only one
        if (prev.length === 1) return prev;
        return prev.filter(z => z !== zoneName);
      } else {
        return [...prev, zoneName];
      }
    });
  };

  // File upload handlers for DNI and Certification with real-time visual legibility analysis
  const handleDniFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingDni(true);
      setIsAnalyzingDniQuality(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const resultUrl = event.target?.result as string;
        setDniPhotoUrl(resultUrl);
        setIsUploadingDni(false);
        try {
          const quality = await analyzeDniImageQuality(resultUrl);
          setDniQualityResult(quality);
        } catch (err) {
          console.warn('Error al analizar calidad de DNI:', err);
        } finally {
          setIsAnalyzingDniQuality(false);
        }
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

  // Sync edit state & analyze worker DNI quality whenever loggedInPro updates
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

      // Automated visual quality audit for worker's DNI photo
      if (loggedInPro.dniPhotoUrl) {
        let isMounted = true;
        setIsAnalyzingWorkerDni(true);
        analyzeDniImageQuality(loggedInPro.dniPhotoUrl)
          .then((result) => {
            if (isMounted) {
              setWorkerDniQuality(result);
              setIsAnalyzingWorkerDni(false);
            }
          })
          .catch(() => {
            if (isMounted) setIsAnalyzingWorkerDni(false);
          });
        return () => {
          isMounted = false;
        };
      } else {
        setWorkerDniQuality(null);
      }
    }
  }, [loggedInPro?.id, loggedInPro?.dniPhotoUrl]);

  // Handle viewing document modal quality check
  useEffect(() => {
    if (viewingDocumentModal?.imageUrl && viewingDocumentModal.title.toLowerCase().includes('dni')) {
      let isMounted = true;
      setIsAnalyzingModalDni(true);
      analyzeDniImageQuality(viewingDocumentModal.imageUrl)
        .then((result) => {
          if (isMounted) {
            setViewingModalDniQuality(result);
            setIsAnalyzingModalDni(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsAnalyzingModalDni(false);
        });
      return () => {
        isMounted = false;
      };
    } else {
      setViewingModalDniQuality(null);
    }
  }, [viewingDocumentModal?.imageUrl]);

  // Handler for worker re-uploading / changing their DNI photo from their dashboard
  const handleWorkerNewDniFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsAnalyzingNewWorkerDni(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const resultUrl = event.target?.result as string;
        setNewWorkerDniUrl(resultUrl);
        try {
          const quality = await analyzeDniImageQuality(resultUrl);
          setNewWorkerDniQuality(quality);
        } catch (err) {
          console.warn('Error al analizar foto:', err);
        } finally {
          setIsAnalyzingNewWorkerDni(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveWorkerDniUpdate = () => {
    if (!loggedInPro || !newWorkerDniUrl || !onUpdateProfessionalProfile) return;
    const updated: Professional = {
      ...loggedInPro,
      dniPhotoUrl: newWorkerDniUrl,
      dniQuality: newWorkerDniQuality ? {
        isLegible: newWorkerDniQuality.isLegible,
        status: newWorkerDniQuality.status,
        sharpnessScore: newWorkerDniQuality.sharpnessScore,
        brightnessScore: newWorkerDniQuality.brightnessScore,
        isBlurry: newWorkerDniQuality.isBlurry,
        isLowLight: newWorkerDniQuality.isLowLight,
        isOverexposed: newWorkerDniQuality.isOverexposed,
        analyzedAt: new Date().toISOString()
      } : undefined,
      approvalStatus: 'pendiente' // Flagged for administrator re-approval with the new image
    };
    onUpdateProfessionalProfile(updated);
    setWorkerDniQuality(newWorkerDniQuality);
    setIsUpdatingWorkerDni(false);
    setNewWorkerDniUrl('');
    setNewWorkerDniQuality(null);
    setWorkerDniUpdateSuccess('¡Foto de DNI actualizada correctamente! Enviada a la administración para su validación oficial.');
    setTimeout(() => setWorkerDniUpdateSuccess(null), 5000);
  };

  // Completed job upload modal/state for logged in provider
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobClient, setNewJobClient] = useState('');
  const [newJobNeighborhood, setNewJobNeighborhood] = useState(loggedInPro?.neighborhood || 'Cerrillos');
  const [newJobComment, setNewJobComment] = useState('');
  const [newJobPhotoUrl, setNewJobPhotoUrl] = useState('');
  const [selectedProPhotoModal, setSelectedProPhotoModal] = useState<{
    id: string;
    title: string;
    clientName: string;
    neighborhood: string;
    photoUrl: string;
    comment?: string;
    contractNumber?: string;
    date?: string;
  } | null>(null);

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

    // 1. WhatsApp verification check
    if (!phoneVerified) {
      setRegistrationError('Es obligatorio verificar tu número de WhatsApp con el código de 6 dígitos.');
      return;
    }

    // 2. Mandatory live camera photo check with real-time system timestamp comparison
    if (!liveSelfieUrl || !photoTakenAt) {
      setRegistrationError('Es obligatorio tomarte una foto actual en vivo con la cámara del celular.');
      return;
    }

    if (photoValidationStatus === 'gallery_rejected') {
      setRegistrationError('La foto fue rechazada por provenir de la galería. Por seguridad, debés tomarla en tiempo real con la cámara.');
      return;
    }

    // Verify photo date strictly matches registration date (same day)
    const photoDate = new Date(photoTakenAt);
    const today = new Date();
    if (photoDate.getFullYear() !== today.getFullYear() ||
        photoDate.getMonth() !== today.getMonth() ||
        photoDate.getDate() !== today.getDate()) {
      setRegistrationError('La fecha de captura de la foto no coincide con la fecha de alta de hoy. Se requiere una foto tomada hoy en vivo.');
      return;
    }

    // Verify photo was captured within the last 15 minutes (real-time enforcement)
    if (photoCaptureTimestamp && (Date.now() - photoCaptureTimestamp > 15 * 60 * 1000)) {
      setRegistrationError('La captura de la foto ha expirado (más de 15 minutos). Por favor volvé a capturarla con la cámara para validar tu presencia en tiempo real.');
      return;
    }

    // 3. Mandatory DNI photo check
    if (!dniPhotoUrl) {
      setRegistrationError('Es obligatorio subir o fotografiar la foto de tu DNI (frente o dorso).');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const proId = `pro-${Date.now()}`;
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const finalCoverage = coverageZones.includes(neighborhood) ? coverageZones : [neighborhood, ...coverageZones];

    const newPro: Professional = {
      id: proId,
      name: name.trim(),
      avatar: liveSelfieUrl,
      photoTakenAt: photoTakenAt,
      trade: trade,
      categoryId: categoryId,
      neighborhood: neighborhood,
      coverageZones: finalCoverage,
      rating: 5.0,
      reviewCount: 0,
      verified: true,
      verifiedLabel: (hasCertification && matricula.trim()) ? 'Matrícula Verificada' : '30 Días Gratis',
      availableNow: true,
      emergencyDuty: emergencyDuty,
      quoteWithoutCharge: quoteWithoutCharge,
      matricula: (hasCertification && matricula.trim()) ? matricula.trim() : undefined,
      dniNumber: dniNumber.trim() ? dniNumber.trim() : undefined,
      dniPhotoUrl: dniPhotoUrl || undefined,
      dniQuality: dniQualityResult ? {
        isLegible: dniQualityResult.isLegible,
        status: dniQualityResult.status,
        sharpnessScore: dniQualityResult.sharpnessScore,
        brightnessScore: dniQualityResult.brightnessScore,
        isBlurry: dniQualityResult.isBlurry,
        isLowLight: dniQualityResult.isLowLight,
        isOverexposed: dniQualityResult.isOverexposed,
        analyzedAt: new Date().toISOString()
      } : undefined,
      approvalStatus: 'pendiente',
      submissionDate: 'Hoy, hace instantes',
      phone: phone.startsWith('+54') ? phone : `+54 9 ${phone}`,
      whatsappNumber: `549${cleanPhone}`,
      phoneVerified: true,
      experienceYears: experienceYears,
      bio: bio.trim() || `Profesional de oficio radicado en ${neighborhood} con cobertura en ${finalCoverage.join(', ')}. Trabajo garantizado y atención personalizada.`,
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

    const finalPhoto = newJobPhotoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
    const job: CompletedJob = {
      id: `job-${Date.now()}`,
      title: newJobTitle.trim(),
      clientName: newJobClient.trim() || 'Vecino del Valle de Lerma',
      neighborhood: newJobNeighborhood,
      date: 'Reciente',
      photoUrl: finalPhoto,
      imageUrl: finalPhoto,
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
      {/* 1. DUAL-ROLE CLARITY BANNER (Visible solo antes de iniciar sesión)        */}
      {/* ========================================================================= */}
      {!loggedInPro && (
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
      )}

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
                  <span className="text-[#eff4ff] text-[11px]">Chat privado directo y seguro en la app (0% comisión)</span>
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

          {/* ========================================================================= */}
          {/* VALIDACIÓN VISUAL DE DNI: CONTROL DE NITIDEZ, ILUMINACIÓN Y ESTADO ADMIN */}
          {/* ========================================================================= */}
          <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#9e4300]" />
                <div>
                  <h3 className="font-bold text-sm text-[#001428]">
                    Verificación de Identidad (DNI) y Legibilidad
                  </h3>
                  <p className="text-[11px] text-[#74777e]">
                    Control visual automático de nitidez e iluminación antes de la aprobación del administrador
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {!loggedInPro.dniPhotoUrl ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>DNI Pendiente de Carga</span>
                  </span>
                ) : loggedInPro.approvalStatus === 'pendiente' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>DNI en Revisión por Administración</span>
                  </span>
                ) : loggedInPro.approvalStatus === 'rechazado' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Requiere Nueva Foto de DNI</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Identidad Verificada Oficialmente</span>
                  </span>
                )}
              </div>
            </div>

            {workerDniUpdateSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{workerDniUpdateSuccess}</span>
              </div>
            )}

            {/* DNI Photo preview and current quality status */}
            {loggedInPro.dniPhotoUrl ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={loggedInPro.dniPhotoUrl}
                      alt="DNI del prestador"
                      onClick={() => setViewingDocumentModal({
                        title: `Foto de DNI - ${loggedInPro.name}`,
                        imageUrl: loggedInPro.dniPhotoUrl!
                      })}
                      className="w-16 h-12 object-cover rounded-lg border border-slate-300 shadow-2xs cursor-pointer hover:opacity-90"
                      title="Tocá para ampliar"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#001428] flex items-center gap-1.5">
                        <span>Foto de DNI Actual Registrada</span>
                        <span
                          className="text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.2 rounded border border-blue-200 font-semibold cursor-pointer"
                          onClick={() => setViewingDocumentModal({ title: `Foto de DNI - ${loggedInPro.name}`, imageUrl: loggedInPro.dniPhotoUrl! })}
                        >
                          Ver grande
                        </span>
                      </p>
                      {loggedInPro.dniNumber ? (
                        <p className="text-[11px] text-[#43474d]">
                          DNI N°: <strong>{loggedInPro.dniNumber}</strong>
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#74777e]">Número no especificado</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsUpdatingWorkerDni(!isUpdatingWorkerDni)}
                    className="px-3 py-1.5 bg-white border border-[#c3c6ce] hover:border-[#9e4300] hover:text-[#9e4300] text-[#001428] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#9e4300]" />
                    <span>{isUpdatingWorkerDni ? 'Cerrar Actualizador' : 'Actualizar / Sacar Nueva Foto'}</span>
                  </button>
                </div>

                {/* Real-time Quality Badge & Warnings */}
                <DniQualityBadge
                  quality={workerDniQuality}
                  isAnalyzing={isAnalyzingWorkerDni}
                  onRetake={() => setIsUpdatingWorkerDni(true)}
                  showAdminAdvice={true}
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/70 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Aún no tenés foto de DNI cargada</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Para que el administrador Jorge Lopez apruebe definitivamente tu cuenta y otorgue la insignia oficial de confianza, es obligatorio adjuntar una foto legible de tu DNI.
                </p>
                <button
                  type="button"
                  onClick={() => setIsUpdatingWorkerDni(true)}
                  className="px-3 py-2 bg-[#9e4300] hover:bg-[#853900] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>Subir o Tomar Foto de DNI Ahora</span>
                </button>
              </div>
            )}

            {/* Inline Editor to Re-take or Upload new DNI with Live Quality Audit */}
            {isUpdatingWorkerDni && (
              <div className="p-4 bg-orange-50/60 rounded-xl border-2 border-dashed border-[#9e4300]/40 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#9e4300]" />
                    <h4 className="text-xs font-black text-[#001428] uppercase tracking-wide">
                      Actualizar Foto de DNI con Validación Visual
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUpdatingWorkerDni(false);
                      setNewWorkerDniUrl('');
                      setNewWorkerDniQuality(null);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer font-bold"
                  >
                    Cancelar
                  </button>
                </div>

                <p className="text-[11px] text-[#43474d] leading-relaxed">
                  Tomá una foto clara y bien iluminada de tu documento. El sistema analizará en tiempo real si tiene buena luz y nitidez antes de enviarla a la aprobación del administrador Jorge Lopez.
                </p>

                {/* Upload or Camera Capture options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="p-3 bg-white border border-[#c3c6ce] hover:border-[#9e4300] hover:bg-[#ffdbcb]/10 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs text-xs font-bold text-[#001428]">
                    <Camera className="w-4 h-4 text-[#9e4300]" />
                    <span>Sacar Foto con Cámara</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleWorkerNewDniFileChange}
                      className="hidden"
                    />
                  </label>

                  <label className="p-3 bg-white border border-[#c3c6ce] hover:border-[#9e4300] hover:bg-[#ffdbcb]/10 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs text-xs font-bold text-[#001428]">
                    <Upload className="w-4 h-4 text-[#9e4300]" />
                    <span>Seleccionar Archivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleWorkerNewDniFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preview of newly selected photo with real-time quality check */}
                {newWorkerDniUrl && (
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-gray-200">
                      <img
                        src={newWorkerDniUrl}
                        alt="Nueva foto DNI"
                        className="w-16 h-12 object-cover rounded-lg border border-gray-300 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#001428]">Nueva foto seleccionada</p>
                        <p className="text-[10px] text-[#74777e]">Lista para guardar y enviar al administrador</p>
                      </div>
                    </div>

                    <DniQualityBadge
                      quality={newWorkerDniQuality}
                      isAnalyzing={isAnalyzingNewWorkerDni}
                      onRetake={() => {
                        setNewWorkerDniUrl('');
                        setNewWorkerDniQuality(null);
                      }}
                      showAdminAdvice={true}
                    />

                    <button
                      type="button"
                      onClick={handleSaveWorkerDniUpdate}
                      disabled={isAnalyzingNewWorkerDni}
                      className="w-full py-2.5 bg-[#9e4300] hover:bg-[#853900] disabled:bg-gray-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Guardar Foto de DNI y Enviar al Administrador</span>
                    </button>
                  </div>
                )}
              </div>
            )}
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

          {/* ========================================================================= */}
          {/* TARJETA 1: TRABAJOS Y PEDIDOS SOLICITADOS EXCLUSIVAMENTE A ESTE TRABAJADOR */}
          {/* ========================================================================= */}
          {(() => {
            const myDirectRequests = (requests || []).filter(r => 
              (r.assignedWorkerId && r.assignedWorkerId === loggedInPro.id) ||
              (r.quotedBy && r.quotedBy.toLowerCase() === loggedInPro.name.toLowerCase()) ||
              (r.phoneContact && loggedInPro.phone && r.phoneContact.replace(/\D/g, '') === loggedInPro.phone.replace(/\D/g, '')) ||
              (r.title && r.title.toLowerCase().includes(loggedInPro.name.toLowerCase()))
            );

            return (
              <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#9e4300] flex items-center justify-center font-bold">
                      <Briefcase className="w-5 h-5 text-[#9e4300]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#001428]">
                        Trabajos Solicitados a mi Perfil
                      </h3>
                      <p className="text-xs text-[#74777e]">
                        Pedidos y órdenes de servicio dirigidos exclusivamente a vos ({myDirectRequests.length})
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-[#9e4300] border border-orange-200">
                    {myDirectRequests.length} {myDirectRequests.length === 1 ? 'pedido' : 'pedidos'}
                  </span>
                </div>

                {myDirectRequests.length === 0 ? (
                  <div className="p-5 text-center bg-[#f8fafc] rounded-xl border border-dashed border-[#cbd5e1] space-y-1.5">
                    <Briefcase className="w-7 h-7 text-[#94a3b8] mx-auto" />
                    <p className="text-xs font-bold text-[#001428]">No tenés pedidos directos asignados en este momento</p>
                    <p className="text-[11px] text-[#64748b] max-w-sm mx-auto">
                      Cuando un vecino te pida una cotización directa o te contrate formalmente, verás aquí su solicitud, trazabilidad y estado de pago.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {myDirectRequests.map((req) => {
                      const contractNum = req.contractNumber || `ORD-VALLE-${req.id.replace('req-', '').slice(-4)}`;
                      const isPaid = req.paymentStatus === 'confirmado';

                      return (
                        <div 
                          key={req.id} 
                          className="p-3 bg-[#f8fafc] hover:bg-[#eff4ff]/60 rounded-xl border border-[#e2e8f0] transition-colors space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-mono font-bold text-slate-800 bg-white px-1.5 py-0.2 rounded border border-slate-300">
                                  #{contractNum}
                                </span>
                                <span className="text-[10px] font-bold text-[#9e4300] bg-orange-50 px-1.5 py-0.2 rounded">
                                  {req.trade}
                                </span>
                                <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-gray-400" />
                                  {req.neighborhood}
                                </span>
                              </div>
                              <h4 className="font-bold text-xs text-[#001428] mt-1">
                                {req.title}
                              </h4>
                              <p className="text-[11px] text-[#64748b]">
                                Solicitado por: <strong>{req.clientName || 'Vecino'}</strong> • {req.createdAt}
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                req.status === 'completado'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : req.status === 'contratado'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : req.status === 'cotizado'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {req.status === 'completado'
                                  ? '✓ Finalizado'
                                  : req.status === 'contratado'
                                  ? '⚡ En Curso'
                                  : req.status === 'cotizado'
                                  ? 'Cotizado'
                                  : 'En Espera'}
                              </span>

                              {req.quoteAmount && (
                                <span className="text-xs font-black text-[#001428]">
                                  ${req.quoteAmount.toLocaleString('es-AR')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Foto adjunta si el trabajo está terminado */}
                          {req.completedJobPhoto && (
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                              <img
                                src={req.completedJobPhoto}
                                alt="Foto certificada"
                                onClick={() => setSelectedProPhotoModal({
                                  id: req.id,
                                  title: req.title,
                                  clientName: req.clientName || 'Vecino',
                                  neighborhood: req.neighborhood,
                                  photoUrl: req.completedJobPhoto as string,
                                  comment: req.completedJobComment,
                                  contractNumber: contractNum,
                                  date: req.createdAt
                                })}
                                className="w-12 h-12 rounded-lg object-cover border border-emerald-300 cursor-pointer hover:opacity-90"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Obra certificada con foto subida</span>
                                </p>
                                <p className="text-[10px] text-gray-500 italic truncate">
                                  {req.completedJobComment || 'Conformidad de obra registrada.'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ========================================================================= */}
          {/* TARJETA 2: MIS TRABAJOS CERTIFICADOS CON FOTOS (CON LIGHTBOX Y FIX IMAGES) */}
          {/* ========================================================================= */}
          {(() => {
            const completedFromReqs = (requests || [])
              .filter(r => (r.assignedWorkerId === loggedInPro.id || r.quotedBy === loggedInPro.name) && Boolean(r.completedJobPhoto))
              .map(r => ({
                id: `req-photo-${r.id}`,
                title: r.title,
                clientName: r.clientName || 'Vecino del Valle',
                neighborhood: r.neighborhood,
                photoUrl: r.completedJobPhoto as string,
                imageUrl: r.completedJobPhoto as string,
                comment: r.completedJobComment || 'Trabajo terminado y certificado mediante orden de contratación.',
                contractNumber: r.contractNumber || `ORD-VALLE-${r.id.replace('req-', '').slice(-4)}`,
                verifiedByApp: true,
                date: r.createdAt
              }));

            const combinedCertifiedJobs = [
              ...(loggedInPro.completedJobs || []).map((j, i) => ({
                id: j.id || `pro-photo-${i}`,
                title: j.title,
                clientName: j.clientName || 'Vecino del Valle de Lerma',
                neighborhood: j.neighborhood || loggedInPro.neighborhood,
                photoUrl: j.photoUrl || j.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
                imageUrl: j.imageUrl || j.photoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
                comment: j.comment || 'Trabajo certificado.',
                contractNumber: j.contractNumber,
                verifiedByApp: j.verifiedByApp !== false,
                date: j.date || 'Reciente'
              })),
              ...completedFromReqs
            ];

            return (
              <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#001428]">Mis Trabajos Certificados con Fotos</h3>
                    <p className="text-xs text-[#74777e]">
                      Tenés {combinedCertifiedJobs.length} trabajo(s) certificado(s)
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

                {/* List of completed jobs with photo view fix & zoom */}
                {combinedCertifiedJobs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {combinedCertifiedJobs.map(job => {
                      const displayPhoto = job.photoUrl || job.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

                      return (
                        <div 
                          key={job.id} 
                          onClick={() => setSelectedProPhotoModal(job)}
                          className="rounded-2xl border border-[#e2e8f0] hover:border-orange-300 overflow-hidden bg-[#f8f9ff] text-xs cursor-pointer group shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                          title="Hacé clic para ver la foto en pantalla completa"
                        >
                          <div>
                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                              <img
                                src={displayPhoto}
                                alt={job.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5 backdrop-blur-2xs">
                                <ZoomIn className="w-4 h-4 text-amber-300" />
                                <span>Ver foto en tamaño completo</span>
                              </div>
                              {job.contractNumber && (
                                <span className="absolute bottom-2 right-2 bg-black/75 text-white font-mono text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs">
                                  #{job.contractNumber}
                                </span>
                              )}
                              <span className="absolute top-2 left-2 bg-[#001428]/80 text-[#a3f69c] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
                                <ShieldCheck className="w-3 h-3 text-[#a3f69c]" />
                                <span>Certificado</span>
                              </span>
                            </div>

                            <div className="p-3">
                              <p className="font-bold text-[#001428] group-hover:text-[#9e4300] transition-colors leading-snug">
                                {job.title}
                              </p>
                              <p className="text-[11px] text-[#74777e] mt-0.5">
                                {job.neighborhood} • {job.clientName}
                              </p>
                              {job.comment && (
                                <p className="text-[11px] text-[#43474d] mt-1.5 italic line-clamp-2 bg-white/70 p-1.5 rounded-lg border border-slate-200">
                                  "{job.comment}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="px-3 pb-2.5 pt-0">
                            <span className="text-[10px] text-[#9e4300] font-bold flex items-center gap-1">
                              <ZoomIn className="w-3 h-3" />
                              <span>Tocá para ver foto ampliada</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-[#74777e] bg-[#f8f9ff] rounded-xl border border-dashed border-[#d8e2ee]">
                    <ImageIcon className="w-8 h-8 mx-auto text-[#c3c6ce] mb-1" />
                    <p>Aún no cargaste fotos de trabajos terminados.</p>
                    <p className="text-[11px] text-[#9e4300] mt-0.5">Las fotos aumentan un 80% las consultas de vecinos.</p>
                  </div>
                )}
              </div>
            );
          })()}
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-[#001428]">
                          Localidad donde residís *
                        </label>
                        <button
                          type="button"
                          onClick={handleDetectUserLocation}
                          disabled={isLocatingUser}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#9e4300] bg-orange-50 hover:bg-orange-100 active:bg-orange-200 border border-orange-300 px-2.5 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
                          title="Detectar por GPS tu localidad más cercana en el Valle de Lerma"
                        >
                          {isLocatingUser ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9e4300]" />
                          ) : (
                            <Crosshair className="w-3.5 h-3.5 text-[#9e4300]" />
                          )}
                          <span>{isLocatingUser ? 'Consultando GPS...' : '📍 Detectar con GPS'}</span>
                        </button>
                      </div>

                      <select
                        value={neighborhood}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNeighborhood(val);
                          if (!coverageZones.includes(val)) {
                            setCoverageZones([...coverageZones, val]);
                          }
                        }}
                        className="w-full text-xs p-3 rounded-xl border border-[#c3c6ce] bg-white focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                      >
                        {neighborhoods.filter(n => n.id !== 'todos').map((n) => (
                          <option key={n.id} value={n.name}>
                            {n.name}
                          </option>
                        ))}
                      </select>

                      {/* Feedback de detección GPS */}
                      {locationDetectedInfo && (
                        <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-[11px] flex items-start gap-2 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-emerald-900">
                                📍 Localidad sugerida: {locationDetectedInfo.locality}
                              </span>
                              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-1.5 py-0.2 rounded-full">
                                {locationDetectedInfo.distanceKm < 1 
                                  ? `${Math.round(locationDetectedInfo.distanceKm * 1000)}m de tu ubicación` 
                                  : `a ${locationDetectedInfo.distanceKm.toFixed(1)} km`}
                              </span>
                            </div>
                            <p className="text-[10px] text-emerald-800 mt-0.5 leading-snug">
                              {locationDetectedInfo.message}
                            </p>
                          </div>
                        </div>
                      )}

                      {locationError && (
                        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-[11px] flex items-start gap-2 shadow-2xs">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-bold block text-amber-900">Aviso de Ubicación GPS</span>
                            <p className="text-[10px] text-amber-800 mt-0.5 leading-snug">
                              {locationError}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Zonas de Cobertura Multi-localidad */}
                  <div className="p-3.5 bg-[#f8faff] rounded-xl border border-[#dce7f5] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#001428] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#9e4300]" />
                        <span>¿En qué localidades estás disponible para trabajar? *</span>
                      </label>
                      <span className="text-[10px] text-[#9e4300] font-bold">
                        {coverageZones.length} seleccionada{coverageZones.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5a5f67] leading-relaxed">
                      Si vivís en {neighborhood} pero podés trasladarte a otras localidades, marcalas aquí para aparecer cuando los vecinos filtren por esas zonas:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {neighborhoods.filter(n => n.id !== 'todos').map((n) => {
                        const isSelected = coverageZones.includes(n.name);
                        return (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => toggleCoverageZone(n.name)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#0f2942] text-white shadow-xs'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#ffdbcb]' : 'bg-gray-300'}`} />
                            <span>{n.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-[#ffdbcb]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Celular y Verificación WhatsApp con Código */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-[#001428] block">
                            Celular / WhatsApp *
                          </label>
                          {phoneVerified && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verificado
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-xs text-[#74777e] font-semibold">
                            +54 9
                          </span>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (phoneVerified) setPhoneVerified(false);
                            }}
                            placeholder="387 555-1234"
                            className="w-full text-xs p-3 pl-14 rounded-xl border border-[#c3c6ce] focus:outline-none focus:ring-1 focus:ring-[#9e4300]"
                          />
                        </div>
                        <span className="text-[10px] text-[#74777e] mt-0.5 block">
                          Aquí te escribirán los clientes directos
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

                    {/* Módulo de Verificación de WhatsApp mediante Código */}
                    <div className="p-3.5 bg-[#f0fdf4] rounded-xl border border-emerald-200 space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-950">
                            Validación de WhatsApp con Código de Seguridad *
                          </span>
                        </div>
                        {phoneVerified ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1 shadow-2xs">
                            <Check className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Confirmado
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendVerificationCode}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{verificationCodeSent ? 'Reenviar Código' : 'Enviar Código a WhatsApp'}</span>
                          </button>
                        )}
                      </div>

                      {!phoneVerified && verificationCodeSent && (
                        <div className="p-3 bg-white rounded-xl border border-emerald-300 space-y-2 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between text-xs text-gray-700">
                            <span>Ingresá el código de 6 dígitos enviado a WhatsApp:</span>
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-mono font-bold px-2 py-0.5 rounded">
                              Código de prueba: {generatedVerificationCode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={inputVerificationCode}
                              onChange={(e) => setInputVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="Ej: 123456"
                              className="w-36 text-center text-sm font-mono tracking-widest font-black p-2.5 rounded-xl border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={handleConfirmVerificationCode}
                              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                              Confirmar Código
                            </button>
                          </div>
                          {verificationError && (
                            <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>{verificationError}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {!phoneVerified && !verificationCodeSent && (
                        <p className="text-[11px] text-emerald-800 leading-snug">
                          Tocá en "Enviar Código a WhatsApp" para recibir un código de 6 dígitos y validar que tu número reciba clientes sin problemas.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* FOTO ACTUAL CON LA CÁMARA (OBLIGATORIA) */}
                  <div className="p-4 bg-[#fffaf5] rounded-xl border border-orange-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#9e4300]" />
                        <h4 className="text-xs font-bold text-[#001428] uppercase tracking-wider">
                          Foto Actual con la Cámara del Celular *
                        </h4>
                      </div>
                      <span className="text-[10px] bg-red-100 text-red-800 font-black px-2 py-0.5 rounded-full">
                        Obligatorio
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5a5f67] leading-relaxed">
                      Por política de seguridad para los vecinos, no se permiten fotos guardadas de la galería. Debés tomarte una foto de rostro actual con la cámara. La fecha y hora de captura quedarán registradas ({new Date().toLocaleDateString()}).
                    </p>

                    {/* Alerta de bloqueo si intentó cargar un archivo preexistente de la galería */}
                    {photoValidationError && (
                      <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-xl text-red-950 text-xs flex items-start gap-2.5 shadow-xs animate-shake">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <strong className="font-black text-red-900 block text-xs">
                            Carga de Archivo Bloqueada (Control Antifraude)
                          </strong>
                          <p className="text-[11px] text-red-800 leading-relaxed">
                            {photoValidationError}
                          </p>
                          <span className="text-[10px] bg-red-100 text-red-900 font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                            ⚠️ Solo se admiten capturas en vivo de hoy ({new Date().toLocaleDateString('es-AR')})
                          </span>
                        </div>
                      </div>
                    )}

                    {liveSelfieUrl ? (
                      <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={liveSelfieUrl}
                            alt="Foto selfie actual"
                            className="w-14 h-14 object-cover rounded-xl border-2 border-emerald-400 shadow-xs shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Foto verificada en tiempo real</span>
                            </span>
                            <p className="text-[10px] text-emerald-800 mt-0.5 truncate font-mono">
                              Capturada: {photoTakenAt ? new Date(photoTakenAt).toLocaleDateString('es-AR') : 'Hoy'} a las {photoTakenAt ? new Date(photoTakenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                            </p>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-sm inline-block mt-0.5">
                              ✓ Validación de captura en vivo aprobada
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setLiveSelfieUrl('');
                            setPhotoTakenAt(null);
                            setPhotoCaptureTimestamp(null);
                            setPhotoValidationStatus(null);
                            setPhotoValidationError(null);
                          }}
                          className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors shrink-0 font-bold border border-red-200"
                        >
                          Volver a tomar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Botón 1: Cámara en vivo con visor */}
                          <button
                            type="button"
                            onClick={startLiveCamera}
                            className="py-3 px-3 bg-[#0f2942] hover:bg-[#001428] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                          >
                            <Camera className="w-4 h-4 text-[#ffdbcb]" />
                            <span>Abrir Visor de Cámara</span>
                          </button>

                          {/* Botón 2: Cámara nativa del celular (capture="user") */}
                          <label className="py-3 px-3 bg-white border border-[#9e4300] hover:bg-orange-50 text-[#9e4300] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs text-center">
                            <Smartphone className="w-4 h-4 text-[#9e4300]" />
                            <span>Cámara Frontal Celular</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="user"
                              onChange={handleNativeCameraCapture}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <span className="text-[10px] text-gray-500 block text-center">
                          El navegador activará la cámara frontal para sacar tu selfie en el momento. La fecha del archivo se verifica contra el reloj del sistema.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. DOCUMENTACIÓN DE IDENTIDAD OBLIGATORIA (DNI) Y MATRÍCULA */}
                <div className="space-y-3 pt-2 border-t border-[#f1f5f9]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#9e4300] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>3. Identidad Obligatoria (DNI) y Matrícula (Opcional)</span>
                    </h3>
                    <span className="text-[10px] text-red-800 bg-red-100 font-bold px-2 py-0.5 rounded-full">
                      DNI Obligatorio
                    </span>
                  </div>
                  <p className="text-[11px] text-[#43474d] leading-relaxed">
                    Adjuntar la foto de tu DNI es <strong>obligatorio</strong> para validar tu identidad. Si contás con matrícula o título oficial, también podés adjuntarlo para obtener la insignia de <strong>Matrícula Verificada</strong>.
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

                    {/* Foto del DNI Upload con Auditoría Visual */}
                    {dniPhotoUrl ? (
                      <div className="space-y-2.5">
                        <div className="relative rounded-xl border border-emerald-300 bg-emerald-50/60 p-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={dniPhotoUrl}
                              alt="DNI adjunto"
                              onClick={() => setViewingDocumentModal({ title: 'Foto de tu DNI adjunta', imageUrl: dniPhotoUrl })}
                              className="w-14 h-11 object-cover rounded-lg border border-emerald-200 shadow-2xs shrink-0 cursor-pointer hover:opacity-90"
                              title="Tocá para ampliar"
                            />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Foto del DNI cargada</span>
                              </span>
                              <p className="text-[10px] text-emerald-800 truncate">
                                Auditando legibilidad e iluminación...
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDniPhotoUrl('');
                              setDniQualityResult(null);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg cursor-pointer shrink-0 transition-colors"
                            title="Eliminar foto de DNI"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Visual Quality & Legibility Notification */}
                        <DniQualityBadge
                          quality={dniQualityResult}
                          isAnalyzing={isAnalyzingDniQuality}
                          onRetake={() => {
                            setDniPhotoUrl('');
                            setDniQualityResult(null);
                          }}
                          showAdminAdvice={true}
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <label className="py-2.5 px-3 bg-white border border-dashed border-[#9e4300] hover:bg-[#ffdbcb]/10 text-[#9e4300] text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs">
                            <Camera className="w-4 h-4 text-[#9e4300]" />
                            <span>{isUploadingDni ? 'Cargando...' : 'Tomar Foto con Cámara'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={handleDniFileChange}
                              className="hidden"
                            />
                          </label>

                          <label className="py-2.5 px-3 bg-white border border-dashed border-gray-400 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs">
                            <Upload className="w-4 h-4 text-gray-600" />
                            <span>{isUploadingDni ? 'Cargando...' : 'Subir Archivo de Foto'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleDniFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-[10px] text-[#74777e] leading-snug">
                          El sistema comprobará automáticamente que la foto sea legible y no esté oscura ni borrosa antes de enviarla a la aprobación del administrador.
                        </p>
                      </div>
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
                        ¿Atención de Urgencias 24 horas?
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

                  <button
                    type="button"
                    onClick={() => setAdminSubSection('telefonos-utiles')}
                    className={`w-full py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                      adminSubSection === 'telefonos-utiles'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-[#5a5f67] hover:text-[#001428] hover:bg-white/60'
                    }`}
                  >
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="leading-tight">Teléfonos Útiles</span>
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
                  onOpenManualesModal={onOpenManualesModal}
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

              {adminSubSection === 'telefonos-utiles' && (
                <AdminUsefulPhonesConfig
                  usefulPhones={usefulPhones || []}
                  onSaveUsefulPhones={onSaveUsefulPhones || (() => {})}
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
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setViewingDocumentModal({ title: `Foto DNI - ${pro.name}`, imageUrl: pro.dniPhotoUrl! })}
                                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Ver Foto DNI</span>
                                </button>
                                {pro.dniQuality && (
                                  <DniQualityBadge quality={pro.dniQuality as any} compact />
                                )}
                              </div>
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

            {/* Visual Quality Analysis if viewing a DNI */}
            {viewingDocumentModal.title.toLowerCase().includes('dni') && (
              <div className="p-3.5 bg-slate-50 border-t border-gray-200">
                <DniQualityBadge
                  quality={viewingModalDniQuality}
                  isAnalyzing={isAnalyzingModalDni}
                  showAdminAdvice={false}
                />
              </div>
            )}

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

      {/* Modal de Cámara en Vivo para Selfie Obligatoria */}
      {isLiveCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="p-3.5 bg-[#0f2942] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#ffdbcb]" />
                <h4 className="font-bold text-xs">Cámara en Vivo - Foto de Rostro</h4>
              </div>
              <button
                type="button"
                onClick={stopLiveCamera}
                className="p-1 text-white hover:bg-white/20 rounded-full cursor-pointer transition-colors"
                title="Cerrar visor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 bg-gray-900 text-center">
              {cameraError ? (
                <div className="p-4 bg-red-900/60 border border-red-500 rounded-xl text-white text-xs space-y-3">
                  <p>{cameraError}</p>
                  <label className="block py-2.5 px-3 bg-white text-[#9e4300] font-bold rounded-xl cursor-pointer">
                    Usar Cámara Frontal Nativa
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(e) => {
                        handleNativeCameraCapture(e);
                        stopLiveCamera();
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <>
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#ffdbcb] aspect-square bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute inset-0 pointer-events-none border-2 border-white/20 rounded-full m-8 border-dashed" />
                  </div>

                  <p className="text-[11px] text-gray-300">
                    Ubicá tu rostro en el centro y presioná el botón para capturar tu foto de alta.
                  </p>

                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={stopLiveCamera}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={captureFromVideo}
                      className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capturar Foto</span>
                    </button>
                  </div>
                </>
              )}
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

      {/* ========================================================================= */}
      {/* MODAL LIGHTBOX: VER FOTO DE OBRA EN TAMAÑO COMPLETO CON DETALLES           */}
      {/* ========================================================================= */}
      {selectedProPhotoModal && (
        <div 
          onClick={() => setSelectedProPhotoModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-2xl w-full bg-[#001428] rounded-2xl overflow-hidden border border-white/20 shadow-2xl space-y-3 p-4 text-white cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#a3f69c]" />
                <span className="font-bold text-xs sm:text-sm">
                  {selectedProPhotoModal.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProPhotoModal(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[65vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
              <img
                src={selectedProPhotoModal.photoUrl}
                alt={selectedProPhotoModal.title}
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-gray-300 text-[11px] flex-wrap gap-2">
                <span>Cliente: <strong className="text-white">{selectedProPhotoModal.clientName}</strong> • {selectedProPhotoModal.neighborhood}</span>
                {selectedProPhotoModal.contractNumber && (
                  <span className="bg-white/15 px-2 py-0.5 rounded font-mono text-[10px] text-amber-300 font-bold">
                    #{selectedProPhotoModal.contractNumber}
                  </span>
                )}
              </div>
              {selectedProPhotoModal.comment && (
                <p className="text-[11px] text-gray-200 italic">
                  "{selectedProPhotoModal.comment}"
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-gray-400">Oficios y Servicios Valle de Lerma</span>
              <button
                type="button"
                onClick={() => setSelectedProPhotoModal(null)}
                className="px-4 py-1.5 bg-white text-[#001428] font-bold text-xs rounded-xl cursor-pointer hover:bg-gray-200 transition-colors shadow-xs"
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
