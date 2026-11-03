import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ExploreScreen } from './components/ExploreScreen';
import { SolicitudesScreen } from './components/SolicitudesScreen';
import { SerProScreen } from './components/SerProScreen';
import { MiCuentaScreen } from './components/MiCuentaScreen';
import { WorkerDetailModal } from './components/WorkerDetailModal';
import { WhatsAppContactModal } from './components/WhatsAppContactModal';
import { EmergencyModal } from './components/EmergencyModal';
import { FilterModal, FilterState } from './components/FilterModal';
import { TrialExpiredModal } from './components/TrialExpiredModal';
import { AdvertisementModal } from './components/AdvertisementModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ReclamosSugerenciasModal } from './components/ReclamosSugerenciasModal';
import { QuickGuideModal } from './components/QuickGuideModal';
import { RequestNotificationToast } from './components/RequestNotificationToast';
import { InternalContactModal } from './components/InternalContactModal';
import { 
  INITIAL_PROFESSIONALS, 
  SERVICE_CATEGORIES, 
  NEIGHBORHOODS, 
  INITIAL_REQUESTS, 
  INITIAL_USER_PROFILE,
  DEFAULT_ADVERTISEMENT,
  DEFAULT_ADVERTISEMENTS,
  isAdScheduledForDay,
  isWorkerInNeighborhood,
  isWorkerMatchingSearch
} from './data/mockData';
import { Professional, ServiceRequest, UserProfile, CompletedJob, ProAccount, AppAdvertisement, AppAnalytics, ServiceCategory, Neighborhood } from './types';
import { CheckCircle2, Cloud, CloudCheck } from 'lucide-react';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { SystemVersionFooter } from './components/SystemVersionFooter';
import { logDeviceAccess } from './utils/deviceTracker';
import { 
  seedFirestoreIfEmpty, 
  subscribeToAdvertisements, 
  saveAdvertisementsToFirestore,
  subscribeToProfessionals,
  saveProfessionalToFirestore,
  subscribeToProAccounts,
  saveProAccountToFirestore,
  subscribeToServiceRequests,
  saveServiceRequestToFirestore,
  subscribeToCategories,
  saveCategoriesToFirestore,
  subscribeToNeighborhoods,
  saveNeighborhoodsToFirestore,
  subscribeToAnalytics,
  recordClientAppUsage,
  recordWhatsAppContact,
  recordServiceRequestCreated,
  DEFAULT_ANALYTICS
} from './lib/firebase';

const OLD_MOCK_IDS = new Set([
  'juan-cruz-valdiviezo',
  'jorge-tolaba',
  'lucas-saravia',
  'marcela-choque',
  'esteban-canizares',
  'nelson-guanca',
  'walter-sarapura',
  'daniela-villagran',
  'felipe-alvarez',
  'sergio-romero',
  'cristian-farfan',
  'pro-uber-1',
  'pro-ventas-1',
  'pro-otros-1',
  'pro-caducado-demo'
]);

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<'explorar' | 'solicitudes' | 'ser-profesional' | 'mi-cuenta'>('explorar');

  // Provider Accounts & Login State
  const [proAccounts, setProAccounts] = useState<ProAccount[]>(() => {
    const saved = localStorage.getItem('oficios_pro_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    // Default demo accounts for instant testing
    return [
      { proId: 'roberto-gomez', username: 'roberto', password: '123', createdAt: new Date().toISOString(), trialDaysTotal: 30 },
      { proId: 'carlos-mamani', username: 'carlos', password: '123', createdAt: new Date().toISOString(), trialDaysTotal: 30 },
      { proId: 'pro-caducado-demo', username: 'marcos.demo', password: '123', createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), trialDaysTotal: 30 }
    ];
  });

  const [loggedInProId, setLoggedInProId] = useState<string | null>(() => {
    return localStorage.getItem('oficios_logged_in_pro_id') || null;
  });

  // Modal for Expired Trial Notice (Contact 3875286914 for payment)
  const [isTrialExpiredModalOpen, setIsTrialExpiredModalOpen] = useState(false);
  const [trialExpiredPro, setTrialExpiredPro] = useState<Professional | null>(null);
  const [serProInitialView, setSerProInitialView] = useState<'registro' | 'login' | 'panel-aprobacion'>('registro');
  const [adminTrigger, setAdminTrigger] = useState(0);

  // Dev Admin State (Jorge Lopez) - persistent in localStorage
  const [isDevAdmin, setIsDevAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'jorge' || urlParams.get('dev') === 'true') {
        localStorage.setItem('oficios_dev_admin_unlocked', 'true');
        return true;
      }
      return localStorage.getItem('oficios_dev_admin_unlocked') === 'true' ||
             sessionStorage.getItem('oficios_dev_admin_unlocked') === 'true';
    }
    return false;
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Reclamos y Sugerencias de Vecinos y Prestadores
  const [isReclamosModalOpen, setIsReclamosModalOpen] = useState(false);
  const [reclamosInitialRequest, setReclamosInitialRequest] = useState<ServiceRequest | null>(null);

  const handleOpenReclamos = (req?: ServiceRequest | null) => {
    setReclamosInitialRequest(req || null);
    setIsReclamosModalOpen(true);
  };

  // App Usage & Provider Statistics for Administrator
  const [analytics, setAnalytics] = useState<AppAnalytics>(DEFAULT_ANALYTICS);

  // Advertisement State (Configurable by Admin, shown upon opening app according to day of week schedule)
  const [advertisements, setAdvertisements] = useState<AppAdvertisement[]>(() => {
    const saved = localStorage.getItem('oficios_ads');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing stored advertisements', e);
      }
    }
    // Fallback: check if single ad was previously stored
    const single = localStorage.getItem('oficios_ad');
    if (single) {
      try {
        const parsedSingle = JSON.parse(single);
        if (parsedSingle && typeof parsedSingle === 'object') {
          return [parsedSingle, ...DEFAULT_ADVERTISEMENTS.slice(1)];
        }
      } catch (e) {}
    }
    return DEFAULT_ADVERTISEMENTS;
  });

  const [activeAdForDisplay, setActiveAdForDisplay] = useState<AppAdvertisement | null>(null);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [isAdPreview, setIsAdPreview] = useState(false);

  // Modal de Guía Rápida al iniciar la app (se muestra si el usuario no la descartó previamente)
  const [isQuickGuideOpen, setIsQuickGuideOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('oficios_guia_vista') !== 'true';
    } catch (e) {
      return true;
    }
  });

  // Show advertisement upon opening the app according to today's day of week
  useEffect(() => {
    const todayDayIndex = new Date().getDay(); // 0 = Dom, 1 = Lun, 2 = Mar, 3 = Mié, 4 = Jue, 5 = Vie, 6 = Sáb
    
    // Find all active ads scheduled for today
    const scheduledAdsForToday = advertisements.filter(ad => isAdScheduledForDay(ad, todayDayIndex));

    if (scheduledAdsForToday.length > 0) {
      // If multiple match today, choose one (random or rotating)
      const selected = scheduledAdsForToday[Math.floor(Math.random() * scheduledAdsForToday.length)];
      setActiveAdForDisplay(selected);
      setIsAdOpen(true);
    }
  }, []);

  const handleSaveAdvertisements = (updatedList: AppAdvertisement[]) => {
    setAdvertisements(updatedList);
    localStorage.setItem('oficios_ads', JSON.stringify(updatedList));
    if (updatedList[0]) {
      localStorage.setItem('oficios_ad', JSON.stringify(updatedList[0]));
    }
    // Sincronizar en la nube con Firebase Firestore para todos los dispositivos
    saveAdvertisementsToFirestore(updatedList).catch(err => {
      console.warn('Advertisements firestore sync:', err);
    });
  };

  const handleSaveSingleAdvertisement = (updated: AppAdvertisement) => {
    const updatedList = advertisements.map(ad => ad.id === updated.id ? updated : ad);
    if (!updatedList.some(ad => ad.id === updated.id)) {
      updatedList.push(updated);
    }
    handleSaveAdvertisements(updatedList);
  };

  const handleTestAdvertisement = (specificAd?: AppAdvertisement) => {
    const adToTest = specificAd || activeAdForDisplay || advertisements[0] || DEFAULT_ADVERTISEMENT;
    setActiveAdForDisplay(adToTest);
    setIsAdPreview(true);
    setIsAdOpen(true);
  };

  const handleCloseAd = () => {
    setIsAdOpen(false);
    setIsAdPreview(false);
  };

  const handleOpenAdminPanel = () => {
    if (!isDevAdmin) {
      setIsAdminAuthModalOpen(true);
      return;
    }
    setSerProInitialView('panel-aprobacion');
    setAdminTrigger(Date.now());
    setCurrentTab('ser-profesional');
  };

  const handleAdminUnlockSuccess = () => {
    setIsDevAdmin(true);
    setIsAdminAuthModalOpen(false);
    setSerProInitialView('panel-aprobacion');
    setAdminTrigger(Date.now());
    setCurrentTab('ser-profesional');
    showToast('¡Modo Administrador activado! El botón Jorge (Dev) ahora está disponible en este teléfono.');
  };

  const handleLockAdmin = () => {
    setIsDevAdmin(false);
    localStorage.removeItem('oficios_dev_admin_unlocked');
    sessionStorage.removeItem('oficios_dev_admin_unlocked');
    if (currentTab === 'ser-profesional' && serProInitialView === 'panel-aprobacion') {
      setCurrentTab('explorar');
    }
    showToast('Modo Administrador desactivado. El botón ha sido ocultado de este teléfono.');
  };

  // App Data with local storage persistence fallback & automatic catalog synchronization
  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem('oficios_pros');
    if (saved) {
      try {
        const parsed: Professional[] = JSON.parse(saved);
        // Exclude all legacy demo professionals from previous test versions
        const cleaned = parsed.filter(p => !OLD_MOCK_IDS.has(p.id));
        const existingIds = new Set(cleaned.map(p => p.id));
        // Ensure our 2 example catalog professionals are always present
        const missingFromInitial = INITIAL_PROFESSIONALS.filter(p => !existingIds.has(p.id));

        const updatedParsed = cleaned.map(p => {
          const init = INITIAL_PROFESSIONALS.find(i => i.id === p.id);
          if (init) {
            return {
              ...init,
              ...p,
              isExample: true,
              categoryId: init.categoryId,
              approvalStatus: p.approvalStatus || 'aprobado',
              completedJobs: (p.completedJobs && p.completedJobs.length > 0) ? p.completedJobs : init.completedJobs
            };
          }
          return {
            ...p,
            approvalStatus: p.approvalStatus || 'aprobado'
          };
        });

        const merged = [...updatedParsed, ...missingFromInitial];
        localStorage.setItem('oficios_pros', JSON.stringify(merged));
        return merged;
      } catch (e) {
        return INITIAL_PROFESSIONALS;
      }
    }
    return INITIAL_PROFESSIONALS;
  });

  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem('oficios_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_REQUESTS.length) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_REQUESTS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('oficios_user');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('oficios_favs');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE.favorites;
  });

  // Dynamic Categories and Neighborhoods (Configurable by Admin in Cloud & LocalStorage)
  const [categories, setCategories] = useState<ServiceCategory[]>(() => {
    const saved = localStorage.getItem('oficios_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return SERVICE_CATEGORIES;
  });

  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(() => {
    const saved = localStorage.getItem('oficios_neighborhoods');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return NEIGHBORHOODS;
  });

  const handleSaveCategories = (updatedCats: ServiceCategory[]) => {
    setCategories(updatedCats);
    localStorage.setItem('oficios_categories', JSON.stringify(updatedCats));
    saveCategoriesToFirestore(updatedCats).catch(err => console.warn('Categories cloud sync error:', err));
  };

  const handleSaveNeighborhoods = (updatedNeighs: Neighborhood[]) => {
    setNeighborhoods(updatedNeighs);
    localStorage.setItem('oficios_neighborhoods', JSON.stringify(updatedNeighs));
    saveNeighborhoodsToFirestore(updatedNeighs).catch(err => console.warn('Neighborhoods cloud sync error:', err));
  };

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('oficios_pros', JSON.stringify(professionals));
  }, [professionals]);

  // Count pending professionals for Admin badges in Header and BottomNav
  const pendingApprovalsCount = professionals.filter(p => p.approvalStatus === 'pendiente').length;

  useEffect(() => {
    localStorage.setItem('oficios_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('oficios_user', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('oficios_favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('oficios_pro_accounts', JSON.stringify(proAccounts));
  }, [proAccounts]);

  useEffect(() => {
    if (loggedInProId) {
      localStorage.setItem('oficios_logged_in_pro_id', loggedInProId);
    } else {
      localStorage.removeItem('oficios_logged_in_pro_id');
    }
  }, [loggedInProId]);

  // Real-time request and quote notifications (Toast with chime & vibration)
  const [incomingNotification, setIncomingNotification] = useState<{
    type: 'new_request' | 'new_quote';
    request: ServiceRequest;
  } | null>(null);
  const [workerForInternalContact, setWorkerForInternalContact] = useState<Professional | null>(null);
  const [internalContactInitialMsg, setInternalContactInitialMsg] = useState<string | undefined>(undefined);
  const prevRequestIdsRef = useRef<Set<string> | null>(null);
  const prevRequestStatusRef = useRef<Map<string, string>>(new Map());
  const loggedInProIdRef = useRef<string | null>(loggedInProId);
  const professionalsRef = useRef<Professional[]>(professionals);

  useEffect(() => {
    loggedInProIdRef.current = loggedInProId;
  }, [loggedInProId]);

  useEffect(() => {
    professionalsRef.current = professionals;
  }, [professionals]);

  // Firebase Firestore Real-Time Synchronization across all mobile and web devices
  useEffect(() => {
    // 1. Initial seed if cloud collections are newly created and empty
    seedFirestoreIfEmpty().catch(err => {
      console.warn('Firebase seeding notice:', err);
    });

    // 2. Real-time sync for Advertisements
    const unsubAds = subscribeToAdvertisements((remoteAds) => {
      if (remoteAds && remoteAds.length > 0) {
        setAdvertisements(remoteAds);
        localStorage.setItem('oficios_ads', JSON.stringify(remoteAds));
      }
    });

    // 3. Real-time sync for Professionals catalog and approvals
    const unsubPros = subscribeToProfessionals((remotePros) => {
      if (remotePros && remotePros.length > 0) {
        const exampleIds = new Set(INITIAL_PROFESSIONALS.filter(init => init.isExample).map(init => init.id));
        const cleanedRemote = remotePros.filter(p => !OLD_MOCK_IDS.has(p.id)).map(p => {
          if (exampleIds.has(p.id)) {
            return { ...p, isExample: true };
          }
          return p;
        });

        setProfessionals(prev => {
          const remoteIds = new Set(cleanedRemote.map(p => p.id));
          const localOnly = prev.filter(p => !remoteIds.has(p.id) && !OLD_MOCK_IDS.has(p.id));
          const merged = [...cleanedRemote, ...localOnly];
          // Ensure both example professionals exist
          const existingIds = new Set(merged.map(p => p.id));
          for (const init of INITIAL_PROFESSIONALS) {
            if (!existingIds.has(init.id)) {
              merged.push(init);
            }
          }
          localStorage.setItem('oficios_pros', JSON.stringify(merged));
          return merged;
        });
      }
    });

    // 4. Real-time sync for Pro Accounts
    const unsubAccounts = subscribeToProAccounts((remoteAccs) => {
      if (remoteAccs && remoteAccs.length > 0) {
        setProAccounts(prev => {
          const remoteUsernames = new Set(remoteAccs.map(a => a.username));
          const localOnly = prev.filter(a => !remoteUsernames.has(a.username));
          return [...remoteAccs, ...localOnly];
        });
      }
    });

    // 5. Real-time sync for Service Requests with Real-Time Notification Trigger
    const unsubRequests = subscribeToServiceRequests((remoteReqs) => {
      if (remoteReqs && remoteReqs.length > 0) {
        // Detect newly arrived requests or new quotes in real-time
        if (prevRequestIdsRef.current === null) {
          prevRequestIdsRef.current = new Set(remoteReqs.map(r => r.id));
          prevRequestStatusRef.current = new Map(remoteReqs.map(r => [r.id, r.status]));
        } else {
          // Check for brand new requests
          const newRequests = remoteReqs.filter(r => !prevRequestIdsRef.current?.has(r.id));
          if (newRequests.length > 0) {
            const latestNew = newRequests[0];
            const currentProId = loggedInProIdRef.current;
            if (currentProId) {
              const currentPro = professionalsRef.current.find(p => p.id === currentProId);
              const isAssigned = latestNew.assignedWorkerId === currentProId || latestNew.quotedBy === currentPro?.name;
              const matchesTrade = currentPro && latestNew.trade?.toLowerCase() === currentPro.trade?.toLowerCase();
              if (isAssigned || matchesTrade) {
                setIncomingNotification({ type: 'new_request', request: latestNew });
              }
            } else {
              setIncomingNotification({ type: 'new_request', request: latestNew });
            }
          }

          // Check for status updates (e.g. quote received)
          for (const req of remoteReqs) {
            const prevStatus = prevRequestStatusRef.current.get(req.id);
            if (prevStatus && prevStatus !== 'cotizado' && req.status === 'cotizado') {
              setIncomingNotification({ type: 'new_quote', request: req });
              break;
            }
          }

          prevRequestIdsRef.current = new Set(remoteReqs.map(r => r.id));
          prevRequestStatusRef.current = new Map(remoteReqs.map(r => [r.id, r.status]));
        }

        setRequests(prev => {
          const remoteIds = new Set(remoteReqs.map(r => r.id));
          const localOnly = prev.filter(r => !remoteIds.has(r.id));
          const merged = [...remoteReqs, ...localOnly];
          localStorage.setItem('oficios_requests', JSON.stringify(merged));
          return merged;
        });
      }
    });

    // 6. Client usage tracking and Real-time sync for App Analytics
    recordClientAppUsage().catch(err => {
      console.warn('Record client usage notice:', err);
    });
    logDeviceAccess({ action: 'Apertura de la aplicación', favoriteProIds: favorites }).catch(err => {
      console.warn('Device log notice:', err);
    });

    const unsubAnalytics = subscribeToAnalytics((remoteStats) => {
      if (remoteStats) {
        setAnalytics(remoteStats);
      }
    });

    // 7. Real-time sync for Categories & Neighborhoods
    const unsubCats = subscribeToCategories((remoteCats) => {
      if (remoteCats && remoteCats.length > 0) {
        setCategories(remoteCats);
        localStorage.setItem('oficios_categories', JSON.stringify(remoteCats));
      }
    });

    const unsubNeighs = subscribeToNeighborhoods((remoteNeighs) => {
      if (remoteNeighs && remoteNeighs.length > 0) {
        setNeighborhoods(remoteNeighs);
        localStorage.setItem('oficios_neighborhoods', JSON.stringify(remoteNeighs));
      }
    });

    return () => {
      unsubAds();
      unsubPros();
      unsubAccounts();
      unsubRequests();
      unsubAnalytics();
      unsubCats();
      unsubNeighs();
    };
  }, []);

  // Current Logged In Provider Memo
  const loggedInPro = useMemo(() => {
    if (!loggedInProId) return null;
    return professionals.find(p => p.id === loggedInProId) || null;
  }, [loggedInProId, professionals]);

  // Filters and search
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('todos');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    onlyVerified: false,
    onlyCertified: false,
    onlyEmergencyDuty: false,
    onlyFreeQuote: false,
    sortBy: 'rating',
    selectedNeighborhood: 'todos'
  });

  // Modals state
  const [selectedWorkerForDetail, setSelectedWorkerForDetail] = useState<Professional | null>(null);
  const [selectedWorkerForWhatsApp, setSelectedWorkerForWhatsApp] = useState<Professional | null>(null);
  const [whatsAppInitialMessage, setWhatsAppInitialMessage] = useState<string | undefined>(undefined);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync barrio filter with selectedNeighborhood
  const handleSelectNeighborhood = (id: string) => {
    setSelectedNeighborhood(id);
    setFilters(prev => ({ ...prev, selectedNeighborhood: id }));
  };

  const handleUpdateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setSelectedNeighborhood(newFilters.selectedNeighborhood);
  };

  const handleResetFilters = () => {
    setFilters({
      onlyVerified: false,
      onlyCertified: false,
      onlyEmergencyDuty: false,
      onlyFreeQuote: false,
      sortBy: 'rating',
      selectedNeighborhood: 'todos'
    });
    setSelectedNeighborhood('todos');
    setSelectedCategory(null);
    setSearchQuery('');
  };

  // Favorite toggle
  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      const updated = isFav ? prev.filter(item => item !== id) : [...prev, id];
      const targetWorker = professionals.find(p => p.id === id);
      const actionName = isFav 
        ? `Quitó de favoritos a ${targetWorker?.name || id}`
        : `Guardó como favorito a ${targetWorker?.name || id} (${targetWorker?.trade || ''})`;
      logDeviceAccess({ action: actionName, favoriteProIds: updated }).catch(() => {});
      showToast(isFav ? 'Quitado de tus favoritos' : '¡Guardado en tus favoritos!');
      return updated;
    });
  };

  // Contact WhatsApp handler
  const handleContactWhatsApp = (worker: Professional, customMsg?: string) => {
    recordWhatsAppContact().catch(() => {});
    logDeviceAccess({ 
      action: `Contactó por WhatsApp a ${worker.name} (${worker.trade})`,
      favoriteProIds: favorites
    }).catch(() => {});
    setSelectedWorkerForWhatsApp(worker);
    setWhatsAppInitialMessage(customMsg);
  };

  // Create new request
  const handleCreateRequest = (newReqData: Omit<ServiceRequest, 'id' | 'createdAt'>) => {
    recordServiceRequestCreated().catch(() => {});
    logDeviceAccess({
      action: `Publicó solicitud: ${newReqData.title} (${newReqData.trade})`,
      favoriteProIds: favorites,
      neighborhood: newReqData.neighborhood
    }).catch(() => {});
    const newReq: ServiceRequest = {
      ...newReqData,
      id: `req-${Date.now()}`,
      createdAt: 'Recién publicado'
    };
    setRequests(prev => [newReq, ...prev]);
    saveServiceRequestToFirestore(newReq).catch(e => console.warn('Firestore save request error:', e));
    showToast('¡Solicitud publicada! Los profesionales te contactarán a la brevedad.');
  };

  // Accept quote and issue official contract
  const handleAcceptQuote = (reqId: string) => {
    let proName = '';
    const contractNum = `ORD-VALLE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    let updatedReq: ServiceRequest | null = null;

    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        proName = r.quotedBy || '';
        const matchingPro = professionals.find(p => p.name === r.quotedBy);
        const u: ServiceRequest = { 
          ...r, 
          status: 'contratado' as const,
          contractNumber: contractNum,
          assignedWorkerId: matchingPro ? matchingPro.id : r.assignedWorkerId,
          clientName: userProfile.name || 'Vecino del Valle'
        };
        updatedReq = u;
        return u;
      }
      return r;
    }));
    if (updatedReq) {
      saveServiceRequestToFirestore(updatedReq).catch(e => console.warn('Firestore accept quote error:', e));
    }
    showToast(`¡Presupuesto aceptado y contrato #${contractNum} emitido! ${proName ? proName.split(' ')[0] : 'El profesional'} ya está habilitado para certificar la obra.`);
  };

  // Handle upload of certified photo for a contracted request
  const handleUploadJobPhotoForRequest = (reqId: string, photoUrl: string, comment?: string) => {
    let targetWorkerId = '';
    let completedJobData: CompletedJob | null = null;

    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        const matchingPro = professionals.find(p => p.id === r.assignedWorkerId || p.name === r.quotedBy);
        targetWorkerId = matchingPro?.id || r.assignedWorkerId || '';
        const contractNumber = r.contractNumber || `ORD-VALLE-2026-${r.id.replace('req-', '')}`;
        
        completedJobData = {
          id: `job-${Date.now()}`,
          serviceRequestId: r.id,
          contractNumber: contractNumber,
          clientName: r.clientName || 'Vecino del Valle',
          title: r.title,
          imageUrl: photoUrl,
          neighborhood: r.neighborhood,
          date: 'Hoy',
          comment: comment,
          verifiedByApp: true
        };

        return {
          ...r,
          status: 'completado',
          completedJobPhoto: photoUrl,
          completedJobComment: comment
        };
      }
      return r;
    }));

    if (targetWorkerId && completedJobData) {
      const jobToAdd = completedJobData;
      setProfessionals(prev => prev.map(p => {
        if (p.id === targetWorkerId) {
          return {
            ...p,
            completedJobs: [jobToAdd, ...p.completedJobs]
          };
        }
        return p;
      }));

      setSelectedWorkerForDetail(prev => {
        if (prev && prev.id === targetWorkerId) {
          return {
            ...prev,
            completedJobs: [jobToAdd, ...prev.completedJobs]
          };
        }
        return prev;
      });
    }

    showToast('¡Foto de obra certificada subida con éxito y visible en el perfil del profesional!');
  };

  // Simulate an official contract for testing the anti-fraud verified upload flow
  const handleSimulateContract = (worker: Professional) => {
    const contractNum = `ORD-VALLE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReq: ServiceRequest = {
      id: `req-${Date.now()}`,
      title: `Servicio oficial contratado: ${worker.trade}`,
      trade: worker.trade,
      neighborhood: worker.neighborhood,
      description: `Contratación formal y orden de servicio expedida a ${worker.name} en ${worker.neighborhood}. Cuenta con garantía comunitaria de Oficios Valle de Lerma.`,
      createdAt: 'Hoy, hace instantes',
      status: 'contratado',
      quotedBy: worker.name,
      quotedByAvatar: worker.avatar,
      quotedByTrade: worker.trade,
      quoteAmount: 45000,
      assignedWorkerId: worker.id,
      contractNumber: contractNum,
      clientName: `${userProfile.name} (${userProfile.neighborhood})`,
      phoneContact: worker.phone
    };

    setRequests(prev => [newReq, ...prev]);
    saveServiceRequestToFirestore(newReq).catch(e => console.warn('Save contract error:', e));
    showToast(`¡Contrato #${contractNum} emitido con éxito para ${worker.name}! Ya podés subir la foto.`);
  };

  // Open WhatsApp from quote
  const handleOpenWhatsAppQuote = (req: ServiceRequest) => {
    if (!req.quotedBy) return;
    const pro = professionals.find(p => p.name === req.quotedBy);
    if (pro) {
      handleContactWhatsApp(pro, `Hola ${pro.name.split(' ')[0]}, te escribo por el presupuesto de "$${req.quoteAmount?.toLocaleString('es-AR')}" que me enviaste para "${req.title}".`);
    } else {
      const cleanPhone = (req.phoneContact || '').replace(/[^0-9]/g, '');
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola, te escribo por la solicitud de ${req.title}`)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Direct quick quote from worker detail
  const handleRequestQuoteFromWorker = (worker: Professional, desc: string) => {
    const newReq: ServiceRequest = {
      id: `req-${Date.now()}`,
      title: `Consulta directa a ${worker.name}`,
      trade: worker.trade,
      neighborhood: worker.neighborhood,
      description: desc,
      createdAt: 'Hoy, hace instantes',
      status: 'en_espera',
      quotedBy: worker.name,
      quotedByAvatar: worker.avatar,
      quotedByTrade: worker.trade,
      phoneContact: worker.phone
    };
    setRequests(prev => [newReq, ...prev]);
    saveServiceRequestToFirestore(newReq).catch(e => console.warn('Save direct quote error:', e));
    recordServiceRequestCreated().catch(() => {});
    showToast(`Consulta enviada a ${worker.name.split(' ')[0]}. Revisala en "Solicitudes".`);
  };

  // Provider sends quote to a request
  const handleSendQuote = (reqId: string, quoteAmount: number, quoteNote?: string) => {
    if (!loggedInPro) return;
    let updatedRequest: ServiceRequest | null = null;
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        const u = {
          ...r,
          status: 'cotizado' as const,
          quotedBy: loggedInPro.name,
          quotedByAvatar: loggedInPro.avatar,
          quotedByTrade: loggedInPro.trade,
          assignedWorkerId: loggedInPro.id,
          quoteAmount: quoteAmount,
          phoneContact: loggedInPro.phone,
          completedJobComment: quoteNote || r.completedJobComment
        };
        updatedRequest = u;
        return u;
      }
      return r;
    }));
    if (updatedRequest) {
      saveServiceRequestToFirestore(updatedRequest).catch(e => console.warn('Send quote sync error:', e));
    }
    showToast(`¡Presupuesto de $${quoteAmount.toLocaleString('es-AR')} enviado con éxito al cliente!`);
  };

  // Confirm payment for contracted / completed work with audit logging
  const handleConfirmPayment = (reqId: string, method: 'efectivo' | 'transferencia' | 'mercado_pago' = 'efectivo') => {
    const receiptNum = `REC-VALLE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    let updatedReq: ServiceRequest | null = null;

    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        const u: ServiceRequest = {
          ...r,
          paymentStatus: 'confirmado',
          paymentMethod: method,
          paymentConfirmedAt: new Date().toISOString(),
          paymentConfirmedBy: loggedInPro ? loggedInPro.name : (userProfile.name || 'Vecino del Valle'),
          paymentReceiptNumber: receiptNum
        };
        updatedReq = u;
        return u;
      }
      return r;
    }));

    if (updatedReq) {
      saveServiceRequestToFirestore(updatedReq).catch(e => console.warn('Firestore payment confirm error:', e));
      logDeviceAccess({
        action: `Confirmó pago de trabajo #${(updatedReq as ServiceRequest).contractNumber || reqId} (${method.toUpperCase()}) - Recibo #${receiptNum}`,
        favoriteProIds: favorites
      }).catch(() => {});
    }

    showToast(`¡Pago de obra registrado y confirmado con éxito! Recibo #${receiptNum}`);
  };

  // Open internal contact modal
  const handleStartInternalContact = (worker: Professional, defaultMsg?: string) => {
    logDeviceAccess({
      action: `Inició consulta interna con ${worker.name} (${worker.trade})`,
      favoriteProIds: favorites
    }).catch(() => {});
    setWorkerForInternalContact(worker);
    setInternalContactInitialMsg(defaultMsg);
  };

  // Submit internal contact request and save in Firestore
  const handleSubmitInternalContact = (worker: Professional, description: string, title?: string) => {
    const reqTitle = title || `Consulta de ${worker.trade}`;
    const newReq: ServiceRequest = {
      id: `req-${Date.now()}`,
      title: reqTitle,
      trade: worker.trade,
      neighborhood: worker.neighborhood,
      description: description,
      createdAt: 'Hoy, hace instantes',
      status: 'en_espera',
      quotedBy: worker.name,
      quotedByAvatar: worker.avatar,
      quotedByTrade: worker.trade,
      assignedWorkerId: worker.id,
      phoneContact: worker.phone,
      clientName: userProfile.name || 'Vecino del Valle',
      deviceId: localStorage.getItem('oficios_device_uuid') || `DEV-${Date.now().toString(36).toUpperCase()}`
    };

    setRequests(prev => [newReq, ...prev]);
    saveServiceRequestToFirestore(newReq).catch(e => console.warn('Save internal contact error:', e));
    recordServiceRequestCreated().catch(() => {});
    logDeviceAccess({
      action: `Publicó consulta interna a ${worker.name}: ${reqTitle}`,
      favoriteProIds: favorites,
      neighborhood: worker.neighborhood
    }).catch(() => {});

    showToast(`¡Consulta enviada a ${worker.name.split(' ')[0]} con resguardo seguro de 30 días!`);
    setCurrentTab('solicitudes');
  };

  // Provider contacts neighbor client directly via internal chat or WhatsApp fallback
  const handleContactClientWhatsApp = (phone: string, clientName: string, requestTitle: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const proName = loggedInPro ? loggedInPro.name.split(' ')[0] : 'Prestador';
    const proTrade = loggedInPro ? loggedInPro.trade : 'Oficios Valle de Lerma';
    const text = `Hola ${clientName}, te escribe ${proName} (${proTrade}) de Oficios Valle de Lerma por tu pedido de "${requestTitle}". ¿Cómo estás?`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Register new professional (with credentials and 30-day trial)
  const handleRegisterProfessionalWithCredentials = (newPro: Professional, username: string, password?: string) => {
    setProfessionals(prev => [newPro, ...prev]);
    const newAccount: ProAccount = {
      proId: newPro.id,
      username: username.toLowerCase().trim(),
      password: password || '123',
      createdAt: new Date().toISOString(),
      trialDaysTotal: 30
    };
    setProAccounts(prev => [...prev.filter(a => a.username !== newAccount.username), newAccount]);
    setLoggedInProId(newPro.id);
    showToast(`¡Bienvenido ${newPro.name.split(' ')[0]}! Tu cuenta fue creada y tus 30 días de prueba gratuita están activos.`);

    // Sincronizar nuevo profesional y credenciales en Firebase Firestore
    saveProfessionalToFirestore(newPro).catch(e => console.warn('Firebase pro sync error:', e));
    saveProAccountToFirestore(newAccount).catch(e => console.warn('Firebase account sync error:', e));
  };

  const handleRegisterProfessional = (newPro: Professional) => {
    setProfessionals(prev => [newPro, ...prev]);
    showToast('¡Solicitud enviada! En proceso de validación y aprobación comunitaria.');
    // Sincronizar en Firebase Firestore
    saveProfessionalToFirestore(newPro).catch(e => console.warn('Firebase pro sync error:', e));
  };

  // Helper to determine if a professional's 30-day trial has expired and requires subscription payment
  const isProfessionalTrialExpired = (pro: Professional): boolean => {
    // If active paid subscription (monthly or annual), NEVER expired
    if (
      (pro.subscriptionPlan === 'abono_mensual' || pro.subscriptionPlan === 'abono_anual') &&
      pro.subscriptionStatus === 'activa'
    ) {
      return false;
    }

    // Explicitly marked as expired or inactive
    if (pro.isTrialExpired || pro.subscriptionStatus === 'caducada' || pro.trialActive === false) {
      return true;
    }

    // Check by trialEndDate
    if (pro.trialEndDate && new Date(pro.trialEndDate).getTime() < Date.now()) {
      return true;
    }

    // Check by account creation date (over 30 days)
    const matchingAcc = proAccounts.find(a => a.proId === pro.id || a.username === pro.username);
    if (matchingAcc?.createdAt) {
      const createdTime = new Date(matchingAcc.createdAt).getTime();
      const daysPassed = (Date.now() - createdTime) / (1000 * 60 * 60 * 24);
      if (daysPassed > 30) {
        return true;
      }
    }

    if (pro.trialStartDate) {
      const startTime = new Date(pro.trialStartDate).getTime();
      const daysPassed = (Date.now() - startTime) / (1000 * 60 * 60 * 24);
      if (daysPassed > 30) {
        return true;
      }
    }

    return false;
  };

  // Admin Subscription Management: unblock provider with monthly or annual subscription after payment
  const handleUpdateSubscription = (
    proId: string, 
    plan: 'prueba_gratuita' | 'abono_mensual' | 'abono_anual', 
    status: 'activa' | 'caducada'
  ) => {
    setProfessionals(prev => prev.map(p => {
      if (p.id === proId) {
        const isExpired = status === 'caducada';
        const updated: Professional = {
          ...p,
          subscriptionPlan: plan,
          subscriptionStatus: status,
          isTrialExpired: isExpired,
          trialActive: plan === 'prueba_gratuita' ? !isExpired : true
        };
        saveProfessionalToFirestore(updated).catch(e => console.warn('Sync sub error:', e));
        return updated;
      }
      return p;
    }));

    const proName = professionals.find(p => p.id === proId)?.name.split(' ')[0] || 'Prestador';
    if (status === 'activa') {
      const planText = plan === 'abono_mensual' ? 'Abono Mensual' : plan === 'abono_anual' ? 'Abono Anual' : '30 Días de Prueba';
      showToast(`¡Ingreso permitido para ${proName}! ${planText} activado con éxito.`);
    } else {
      showToast(`Acceso bloqueado para ${proName}. Período marcado como caducado.`);
    }
  };

  // Provider Login with 30-Day Trial Expiration Block
  const handleLoginProfessional = (user: string, pass?: string): boolean => {
    const cleanUser = user.toLowerCase().trim();
    let targetPro: Professional | undefined;

    // 1. Search in proAccounts
    const account = proAccounts.find(a => a.username === cleanUser);
    if (account) {
      targetPro = professionals.find(p => p.id === account.proId);
    }
    // 2. Search in professionals by username or first name
    if (!targetPro) {
      targetPro = professionals.find(p => 
        p.username?.toLowerCase() === cleanUser || 
        p.name.toLowerCase().startsWith(cleanUser)
      );
    }

    if (targetPro) {
      // Check if trial has expired and no paid subscription
      if (isProfessionalTrialExpired(targetPro)) {
        setTrialExpiredPro(targetPro);
        setIsTrialExpiredModalOpen(true);
        showToast('Tu período de prueba ha caducado. Contactate al 3875286914 para abonar.');
        return false;
      }

      setLoggedInProId(targetPro.id);
      showToast(`¡Hola ${targetPro.name.split(' ')[0]}! Has iniciado sesión de prestador.`);
      return true;
    }

    return false;
  };

  // Provider Logout
  const handleLogoutProfessional = () => {
    setLoggedInProId(null);
    showToast('Has cerrado sesión de prestador. Ahora estás en modo vecino (acceso libre).');
  };

  // Update Provider Profile
  const handleUpdateProfessionalProfile = (updated: Professional) => {
    setProfessionals(prev => prev.map(p => p.id === updated.id ? updated : p));
    saveProfessionalToFirestore(updated).catch(e => console.warn('Profile sync error:', e));
    showToast('Perfil profesional actualizado.');
  };

  // Approve professional
  const handleApproveProfessional = (proId: string) => {
    setProfessionals(prev => prev.map(p => {
      if (p.id === proId) {
        const updated: Professional = {
          ...p,
          approvalStatus: 'aprobado',
          verified: true,
          verifiedLabel: p.matricula ? 'Matriculado Oficial' : 'Verificado Valle de Lerma'
        };
        saveProfessionalToFirestore(updated).catch(e => console.warn('Approve pro sync error:', e));
        return updated;
      }
      return p;
    }));
    showToast('¡Profesional aprobado y publicado con éxito en el Valle de Lerma!');
  };

  // Reject professional
  const handleRejectProfessional = (proId: string, reason?: string) => {
    setProfessionals(prev => prev.map(p => {
      if (p.id === proId) {
        const updated: Professional = {
          ...p,
          approvalStatus: 'rechazado',
          rejectionReason: reason || 'Documentación incompleta'
        };
        saveProfessionalToFirestore(updated).catch(e => console.warn('Reject pro sync error:', e));
        return updated;
      }
      return p;
    }));
    showToast('Solicitud de profesional rechazada.');
  };

  // Add completed job with photo and comment
  const handleAddCompletedJob = (proId: string, job: CompletedJob) => {
    setProfessionals(prev => prev.map(p => {
      if (p.id === proId) {
        const updated: Professional = {
          ...p,
          completedJobs: [job, ...p.completedJobs]
        };
        saveProfessionalToFirestore(updated).catch(e => console.warn('Completed job sync error:', e));
        return updated;
      }
      return p;
    }));
    setSelectedWorkerForDetail(prev => {
      if (prev && prev.id === proId) {
        return {
          ...prev,
          completedJobs: [job, ...prev.completedJobs]
        };
      }
      return prev;
    });
    showToast('¡Trabajo con foto y comentario agregado a la galería!');
  };

  // Filtered professionals list
  const filteredProfessionals = useMemo(() => {
    return professionals.filter(worker => {
      // Approval status filter: only show approved or grandfathered professionals to the public
      if (worker.approvalStatus && worker.approvalStatus !== 'aprobado') {
        return false;
      }

      // Department / Localidad filter (Strict combined match: provider must belong to the selected department)
      if (selectedNeighborhood && selectedNeighborhood !== 'todos') {
        if (!isWorkerInNeighborhood(worker.neighborhood, selectedNeighborhood, neighborhoods)) {
          return false;
        }
      }

      // Search query (Strict combined match: matches query against trade, category, services, name, bio, keywords)
      if (searchQuery.trim()) {
        if (!isWorkerMatchingSearch(worker, searchQuery, categories)) {
          return false;
        }
      }

      // Category filter (Matches categoryId or related category trade keywords)
      if (selectedCategory) {
        const matchesCatId = worker.categoryId?.toLowerCase() === selectedCategory.toLowerCase();
        const catObj = categories.find(c => c.id === selectedCategory);
        const matchesCatName = catObj ? isWorkerMatchingSearch(worker, catObj.name, categories) : false;
        if (!matchesCatId && !matchesCatName) {
          return false;
        }
      }

      // Certified toggle
      if (filters.onlyCertified && !worker.matricula) {
        return false;
      }

      // Emergency duty toggle
      if (filters.onlyEmergencyDuty && !worker.emergencyDuty) {
        return false;
      }

      // Free quote toggle
      if (filters.onlyFreeQuote && !worker.quoteWithoutCharge) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (filters.sortBy === 'reviews') {
        return b.reviewCount - a.reviewCount;
      }
      if (filters.sortBy === 'experience') {
        return b.experienceYears - a.experienceYears;
      }
      return 0;
    });
  }, [professionals, selectedNeighborhood, selectedCategory, searchQuery, filters, categories, neighborhoods]);

  // Emergency workers
  const emergencyPros = useMemo(() => {
    return professionals.filter(p => p.emergencyDuty);
  }, [professionals]);

  // Favorite workers
  const favoritePros = useMemo(() => {
    return professionals.filter(p => favorites.includes(p.id));
  }, [professionals, favorites]);

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col antialiased overflow-x-hidden w-full max-w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-22 sm:top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#001428] text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#a3f69c] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Real-Time Request / Quote Audio & Visual Toast Notification */}
      <RequestNotificationToast
        notification={incomingNotification}
        onClose={() => setIncomingNotification(null)}
        onViewRequest={(req) => {
          setIncomingNotification(null);
          setCurrentTab('solicitudes');
        }}
      />

      {/* Top Header */}
      <Header
        currentTab={currentTab}
        userAvatar={userProfile.avatar}
        onNavigate={(tab) => {
          if (tab === 'admin') {
            handleOpenAdminPanel();
          } else {
            setCurrentTab(tab as any);
          }
        }}
        favoritesCount={favorites.length}
        loggedInPro={loggedInPro}
        onLogoutPro={handleLogoutProfessional}
        onOpenAdmin={handleOpenAdminPanel}
        pendingApprovalsCount={pendingApprovalsCount}
        isAdminActive={currentTab === 'ser-profesional' && serProInitialView === 'panel-aprobacion'}
        isDevAdmin={isDevAdmin}
        onTriggerAdminUnlock={() => setIsAdminAuthModalOpen(true)}
        onOpenQuickGuide={() => setIsQuickGuideOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden pt-19 sm:pt-22">
        {currentTab === 'explorar' && (
          <ExploreScreen
            professionals={filteredProfessionals}
            allProfessionals={professionals}
            categories={categories}
            neighborhoods={neighborhoods}
            selectedNeighborhood={selectedNeighborhood}
            onSelectNeighborhood={handleSelectNeighborhood}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            onSelectWorker={setSelectedWorkerForDetail}
            onContactWhatsApp={(w) => handleContactWhatsApp(w)}
            onStartInternalChat={handleStartInternalContact}
            onNavigateToSerPro={() => setCurrentTab('ser-profesional')}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            loggedInPro={loggedInPro}
            isDevAdmin={isDevAdmin}
            onTriggerAdminUnlock={() => setIsAdminAuthModalOpen(true)}
          />
        )}

        {currentTab === 'solicitudes' && (
          <SolicitudesScreen
            requests={requests}
            categories={categories}
            neighborhoods={neighborhoods}
            onCreateRequest={handleCreateRequest}
            onAcceptQuote={handleAcceptQuote}
            onOpenWhatsAppQuote={handleOpenWhatsAppQuote}
            onUploadJobPhoto={handleUploadJobPhotoForRequest}
            loggedInPro={loggedInPro}
            userProfile={userProfile}
            onSendQuote={handleSendQuote}
            onContactClientWhatsApp={handleContactClientWhatsApp}
            onConfirmPayment={handleConfirmPayment}
            onNavigateToSerPro={() => setCurrentTab('ser-profesional')}
            onOpenReport={handleOpenReclamos}
          />
        )}

        {currentTab === 'ser-profesional' && (
          <SerProScreen
            categories={categories}
            neighborhoods={neighborhoods}
            professionals={professionals}
            analytics={analytics}
            loggedInPro={loggedInPro}
            initialView={serProInitialView}
            adminTrigger={adminTrigger}
            advertisements={advertisements}
            onSaveAdvertisements={handleSaveAdvertisements}
            advertisement={advertisements[0]}
            onSaveAdvertisement={handleSaveSingleAdvertisement}
            onTestAdvertisement={handleTestAdvertisement}
            onRegisterProfessionalWithCredentials={handleRegisterProfessionalWithCredentials}
            onLoginProfessional={handleLoginProfessional}
            onLogoutProfessional={handleLogoutProfessional}
            onUpdateProfessionalProfile={handleUpdateProfessionalProfile}
            onRegisterProfessional={handleRegisterProfessional}
            onApproveProfessional={handleApproveProfessional}
            onRejectProfessional={handleRejectProfessional}
            onAddCompletedJob={handleAddCompletedJob}
            onContactWhatsApp={(w, msg) => handleContactWhatsApp(w, msg)}
            onNavigateToExplorar={() => setCurrentTab('explorar')}
            onSelectWorkerForDetail={setSelectedWorkerForDetail}
            onUpdateSubscription={handleUpdateSubscription}
            onShowExpiredModal={(pro) => {
              setTrialExpiredPro(pro);
              setIsTrialExpiredModalOpen(true);
            }}
            isDevAdmin={isDevAdmin}
            onTriggerAdminUnlock={() => setIsAdminAuthModalOpen(true)}
            onLockAdmin={handleLockAdmin}
            onSaveCategories={handleSaveCategories}
            onSaveNeighborhoods={handleSaveNeighborhoods}
            requests={requests}
          />
        )}

        {currentTab === 'mi-cuenta' && (
          <MiCuentaScreen
            userProfile={userProfile}
            onUpdateProfile={(updated) => {
              setUserProfile(prev => ({ ...prev, ...updated }));
              showToast('¡Datos de tu perfil guardados con éxito!');
            }}
            favoritePros={favoritePros}
            neighborhoods={neighborhoods}
            onUpdateNeighborhood={(barrio) => {
              setUserProfile(prev => ({ ...prev, neighborhood: barrio }));
              showToast(`Barrio preferido actualizado a ${barrio}`);
            }}
            onSelectWorker={setSelectedWorkerForDetail}
            onContactWhatsApp={(w) => handleContactWhatsApp(w)}
            onRemoveFavorite={handleToggleFavorite}
            onOpenAdminPanel={handleOpenAdminPanel}
            isDevAdmin={isDevAdmin}
            onTriggerAdminUnlock={() => setIsAdminAuthModalOpen(true)}
            onLockAdmin={handleLockAdmin}
            onOpenReclamosModal={() => handleOpenReclamos(null)}
          />
        )}

        {/* Footer con versión del sistema, fecha de última modificación e ID de dispositivo */}
        <SystemVersionFooter
          onOpenAdminAuth={() => setIsAdminAuthModalOpen(true)}
          isDevAdmin={isDevAdmin}
        />
      </main>

      {/* Worker Detail Profile Modal */}
      {selectedWorkerForDetail && (
        <WorkerDetailModal
          worker={selectedWorkerForDetail}
          requests={requests}
          onClose={() => setSelectedWorkerForDetail(null)}
          onContactWhatsApp={(w, customMsg) => handleContactWhatsApp(w, customMsg)}
          onStartInternalChat={(w, customMsg) => {
            setSelectedWorkerForDetail(null);
            handleStartInternalContact(w, customMsg);
          }}
          isFavorite={favorites.includes(selectedWorkerForDetail.id)}
          onToggleFavorite={handleToggleFavorite}
          onRequestQuote={handleRequestQuoteFromWorker}
          onAddCompletedJob={handleAddCompletedJob}
          onSimulateContract={handleSimulateContract}
          onNavigateToSolicitudes={() => {
            setSelectedWorkerForDetail(null);
            setCurrentTab('solicitudes');
          }}
          onUploadJobPhotoForRequest={handleUploadJobPhotoForRequest}
        />
      )}

      {/* Internal Contact Modal with 30-Day Traceability & Logs */}
      <InternalContactModal
        isOpen={Boolean(workerForInternalContact)}
        onClose={() => {
          setWorkerForInternalContact(null);
          setInternalContactInitialMsg(undefined);
        }}
        worker={workerForInternalContact}
        userProfile={userProfile}
        initialMessage={internalContactInitialMsg}
        onSubmitRequest={handleSubmitInternalContact}
      />

      {/* WhatsApp Message Composer Modal */}
      {selectedWorkerForWhatsApp && (
        <WhatsAppContactModal
          worker={selectedWorkerForWhatsApp}
          initialMessage={whatsAppInitialMessage}
          onClose={() => {
            setSelectedWorkerForWhatsApp(null);
            setWhatsAppInitialMessage(undefined);
          }}
        />
      )}

      {/* Emergency Assistance Modal */}
      {isEmergencyModalOpen && (
        <EmergencyModal
          emergencyPros={emergencyPros}
          onClose={() => setIsEmergencyModalOpen(false)}
          onContactWhatsApp={(w, msg) => {
            setIsEmergencyModalOpen(false);
            handleContactWhatsApp(w, msg);
          }}
          onSelectWorker={(w) => {
            setIsEmergencyModalOpen(false);
            setSelectedWorkerForDetail(w);
          }}
        />
      )}

      {/* Advanced Filter Modal */}
      {isFilterModalOpen && (
        <FilterModal
          filters={filters}
          neighborhoods={neighborhoods}
          onUpdateFilters={handleUpdateFilters}
          onReset={handleResetFilters}
          onClose={() => setIsFilterModalOpen(false)}
        />
      )}

      {/* Trial Expired Modal / Cartel de Caducidad con contacto al 3875286914 */}
      <TrialExpiredModal
        isOpen={isTrialExpiredModalOpen}
        onClose={() => setIsTrialExpiredModalOpen(false)}
        professional={trialExpiredPro}
        onSimulateAdminPayment={(proId, plan) => {
          handleUpdateSubscription(proId, plan, 'activa');
          setLoggedInProId(proId);
        }}
      />

      {/* Advertisement Modal on App Launch / Preview */}
      <AdvertisementModal
        ad={activeAdForDisplay}
        isOpen={isAdOpen}
        onClose={handleCloseAd}
        isPreview={isAdPreview}
      />

      {/* Bottom Sticky Navigation */}
      <BottomNav
        currentTab={currentTab === 'ser-profesional' && serProInitialView === 'panel-aprobacion' ? 'admin' : currentTab}
        onNavigate={(tab) => {
          if (tab === 'admin') {
            handleOpenAdminPanel();
          } else {
            if (tab === 'ser-profesional' && currentTab !== 'ser-profesional') {
              setSerProInitialView('registro');
            }
            setCurrentTab(tab as any);
          }
        }}
        requestsCount={
          loggedInPro
            ? requests.filter(r => r.status === 'en_espera').length
            : requests.filter(r => r.status === 'cotizado').length
        }
        isProLoggedIn={Boolean(loggedInPro)}
        pendingApprovalsCount={pendingApprovalsCount}
        isDevAdmin={isDevAdmin}
      />

      {/* Modal de Autenticación de Administrador / Desarrollador Jorge Lopez */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminUnlockSuccess}
      />

      {/* Modal de Reclamos y Sugerencias de Vecinos y Prestadores */}
      <ReclamosSugerenciasModal
        isOpen={isReclamosModalOpen}
        onClose={() => setIsReclamosModalOpen(false)}
        userProfile={userProfile}
        initialRequest={reclamosInitialRequest}
        requests={requests}
        onFeedbackSubmitted={() => {
          showToast('¡Reclamo / sugerencia registrado con éxito! La administración lo revisará a la brevedad.');
        }}
      />

      {/* Guía Rápida de Uso (Carrusel Informativo al Iniciar) */}
      <QuickGuideModal
        isOpen={isQuickGuideOpen}
        onClose={() => setIsQuickGuideOpen(false)}
      />

      {/* Cartel de Instalación Móvil (PWA) */}
      <InstallPwaBanner />
    </div>
  );
}
