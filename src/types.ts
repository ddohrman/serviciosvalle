export interface ServiceItem {
  name: string;
  priceEstimate?: string;
  description?: string;
}

export interface CompletedJob {
  id?: string;
  serviceRequestId?: string;
  contractNumber?: string;
  clientName?: string;
  title: string;
  imageUrl?: string;
  photoUrl?: string;
  neighborhood: string;
  date?: string;
  comment?: string;
  verifiedByApp?: boolean;
}

export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
  neighborhood: string;
}

export interface Professional {
  id: string;
  name: string;
  avatar: string;
  trade: string;
  categoryId: string;
  neighborhood: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  verifiedLabel?: string;
  availableNow: boolean;
  emergencyDuty: boolean;
  quoteWithoutCharge: boolean;
  matricula?: string;
  certificatePhotoUrl?: string;
  dniNumber?: string;
  dniPhotoUrl?: string;
  approvalStatus?: 'aprobado' | 'pendiente' | 'rechazado';
  submissionDate?: string;
  rejectionReason?: string;
  phone: string;
  whatsappNumber: string;
  experienceYears: number;
  bio: string;
  guaranteeText: string;
  priceTagText: string;
  username?: string;
  password?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  trialDaysTotal?: number;
  trialActive?: boolean;
  subscriptionPlan?: 'prueba_gratuita' | 'abono_mensual' | 'abono_anual';
  subscriptionStatus?: 'activa' | 'caducada';
  subscriptionEndDate?: string;
  isTrialExpired?: boolean;
  isExample?: boolean;
  palabrasClave?: string[]; // Array de strings con palabras clave configuradas por el prestador
  searchKeywords?: string[];
  searchKeywordsText?: string;
  services: ServiceItem[];
  completedJobs: CompletedJob[];
  reviews: Review[];
}

export interface ProAccount {
  id?: string;
  username: string;
  password?: string;
  professionalId?: string;
  proId?: string;
  registeredAt?: string;
  createdAt?: string;
  trialDaysTotal?: number;
  trialEndDate?: string;
  isActive?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  countText: string;
  description?: string;
  badge?: string;
}

export interface Neighborhood {
  id: string;
  name: string;
}

export interface ServiceRequest {
  id: string;
  title: string;
  trade: string;
  neighborhood: string;
  description: string;
  createdAt: string;
  status: 'cotizado' | 'en_espera' | 'contratado' | 'completado';
  quotedBy?: string;
  quotedByAvatar?: string;
  quotedByTrade?: string;
  quoteAmount?: number;
  phoneContact?: string;
  assignedWorkerId?: string;
  contractNumber?: string;
  clientName?: string;
  completedJobPhoto?: string;
  completedJobComment?: string;
  deviceId?: string; // Identificador único de dispositivo creador
  paymentStatus?: 'pendiente' | 'confirmado';
  paymentMethod?: 'efectivo' | 'transferencia' | 'mercado_pago';
  paymentConfirmedAt?: string;
  paymentConfirmedBy?: string;
  paymentReceiptNumber?: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  neighborhood: string;
  city: string;
  email: string;
  phone: string;
  favorites: string[];
}

export interface AppAdvertisement {
  id: string;
  enabled: boolean;
  title: string;
  subtitle?: string;
  badgeText?: string;
  description: string;
  imageUrl?: string;
  displayDurationSeconds: number; // e.g. 3
  buttonText?: string;
  targetType: 'whatsapp' | 'url' | 'none';
  targetUrl?: string;
  targetWhatsAppNumber?: string;
  targetWhatsAppMessage?: string;
  daysOfWeek?: number[]; // [0, 1, 2, 3, 4, 5, 6] (0 = Domingo, 1 = Lunes, ..., 6 = Sábado). Vacío = Todos los días
  updatedAt?: string;
}

export interface AppAnalytics {
  id?: string;
  totalClientVisits: number; // Conteo de veces que vecinos/clientes usaron la app
  uniqueClientsCount: number; // Conteo de clientes únicos aproximados (dispositivos distintos)
  totalWhatsAppContacts: number; // Vecinos que contactaron a prestadores vía WhatsApp
  totalRequestsCreated: number; // Solicitudes o pedidos de presupuestos enviados por vecinos
  lastClientVisitAt?: string; // Fecha y hora del último cliente que ingresó
  firstRecordedAt?: string;
}

export interface DeviceAccessLog {
  id: string; // ID único del dispositivo e.g. DEV-LERMA-XXXX-XXXX
  deviceId: string;
  firstSeen: string;
  lastSeen: string;
  visitCount: number;
  phone?: string; // Teléfono opcional ingresado para asociar dispositivo
  nickname?: string;
  neighborhood?: string;
  deviceType: string; // 'Móvil Android' | 'iPhone' | 'Tablet' | 'Computadora'
  browser: string; // 'Chrome', 'Safari', etc.
  screenResolution: string; // e.g. '390x844'
  platform: string;
  favoritesCount: number;
  favoriteProIds?: string[];
  lastAction?: string;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  requestTitle?: string;
  senderId: string; // deviceId del vecino o proId del prestador
  senderName: string;
  senderRole: 'vecino' | 'prestador' | 'admin';
  senderAvatar?: string;
  text: string;
  createdAt: string; // Fecha y hora ISO
  expiresAt: string; // Vencimiento del log de seguridad a los 30 días
  securityLogHash?: string;
  read?: boolean;
  deviceId?: string; // Identificador único de dispositivo del remitente o solicitud
}

export interface UserFeedback {
  id: string; // Identificador único e.g. REC-2026-ABCD
  type: 'reclamo' | 'sugerencia' | 'felicitacion' | 'consulta';
  title: string;
  description: string;
  deviceId: string; // ID del dispositivo que originó el reclamo
  userName?: string;
  userPhone?: string;
  userNeighborhood?: string;
  relatedRequestId?: string;
  relatedRequestTitle?: string;
  relatedProId?: string;
  relatedProName?: string;
  status: 'pendiente' | 'en_revision' | 'resuelto';
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}


