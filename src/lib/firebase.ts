import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocFromServer,
  updateDoc,
  increment,
  getDocs, 
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { AppAdvertisement, Professional, ProAccount, AppAnalytics, ServiceRequest, ServiceCategory, Neighborhood, TrialRecord } from '../types';
import { DEFAULT_ADVERTISEMENTS, INITIAL_PROFESSIONALS, INITIAL_ACCOUNTS, INITIAL_REQUESTS, INITIAL_FEEDBACKS, INITIAL_CHAT_LOGS } from '../data/mockData';
import firebaseConfigRaw from '../../firebase-applet-config.json';

export const firebaseConfig = firebaseConfigRaw;

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific databaseId provided in user configuration
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate Connection to Firestore on startup
 */
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'analytics', 'general'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or pending network connection:', error.message);
    }
  }
}
testConnection().catch(() => {});

const ADS_COLLECTION = 'advertisements';
const PROS_COLLECTION = 'professionals';
const ACCOUNTS_COLLECTION = 'proAccounts';
const REQUESTS_COLLECTION = 'serviceRequests';
const ANALYTICS_COLLECTION = 'analytics';
const STATS_DOC_ID = 'general';

let isSeeding = false;

/**
 * Seeds initial mock data into Firestore if collections are empty.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  if (isSeeding) return;
  isSeeding = true;

  try {
    // 1. Check advertisements
    const adsSnapshot = await getDocs(collection(db, ADS_COLLECTION)).catch(err => {
      console.warn('Check ads error (offline or initializing):', err);
      return null;
    });

    if (adsSnapshot && adsSnapshot.empty) {
      console.log('Seeding initial advertisements to Firestore...');
      const batch = writeBatch(db);
      for (const ad of DEFAULT_ADVERTISEMENTS) {
        const adRef = doc(db, ADS_COLLECTION, ad.id);
        batch.set(adRef, { ...ad, updatedAt: new Date().toISOString() });
      }
      await batch.commit();
      console.log('Advertisements seeded successfully.');
    }

    // 2. Check professionals
    const prosSnapshot = await getDocs(collection(db, PROS_COLLECTION)).catch(err => {
      console.warn('Check pros error (offline or initializing):', err);
      return null;
    });

    if (prosSnapshot && prosSnapshot.empty) {
      console.log('Seeding initial professionals to Firestore...');
      const batch = writeBatch(db);
      for (const pro of INITIAL_PROFESSIONALS) {
        const proRef = doc(db, PROS_COLLECTION, pro.id);
        batch.set(proRef, pro);
      }
      await batch.commit();
      console.log('Professionals seeded successfully.');
    }

    // 3. Check pro accounts
    const accSnapshot = await getDocs(collection(db, ACCOUNTS_COLLECTION)).catch(err => {
      console.warn('Check accounts error (offline or initializing):', err);
      return null;
    });

    if (accSnapshot && accSnapshot.empty) {
      console.log('Seeding initial pro accounts to Firestore...');
      const batch = writeBatch(db);
      for (const acc of INITIAL_ACCOUNTS) {
        const accRef = doc(db, ACCOUNTS_COLLECTION, acc.id || acc.proId || acc.username);
        batch.set(accRef, acc);
      }
      await batch.commit();
      console.log('Pro accounts seeded successfully.');
    }

    // 4. Check service requests
    const reqSnapshot = await getDocs(collection(db, REQUESTS_COLLECTION)).catch(err => {
      console.warn('Check requests error (offline or initializing):', err);
      return null;
    });

    if (reqSnapshot && reqSnapshot.empty) {
      console.log('Seeding initial requests to Firestore...');
      const batch = writeBatch(db);
      for (const req of INITIAL_REQUESTS) {
        const reqRef = doc(db, REQUESTS_COLLECTION, req.id);
        batch.set(reqRef, req);
      }
      await batch.commit();
      console.log('Service requests seeded successfully.');
    }

    // 5. Check user feedbacks (reclamos y sugerencias)
    const feedbackSnapshot = await getDocs(collection(db, 'user_feedback')).catch(err => {
      console.warn('Check feedback error:', err);
      return null;
    });

    if (feedbackSnapshot && feedbackSnapshot.empty) {
      console.log('Seeding initial feedbacks to Firestore...');
      const batch = writeBatch(db);
      for (const fb of INITIAL_FEEDBACKS) {
        const fbRef = doc(db, 'user_feedback', fb.id);
        batch.set(fbRef, fb);
      }
      await batch.commit();
      console.log('User feedbacks seeded successfully.');
    }

    // 6. Check chat logs
    const chatSnapshot = await getDocs(collection(db, 'request_chat_messages')).catch(err => {
      console.warn('Check chat logs error:', err);
      return null;
    });

    if (chatSnapshot && chatSnapshot.empty) {
      console.log('Seeding initial chat logs to Firestore...');
      const batch = writeBatch(db);
      for (const msg of INITIAL_CHAT_LOGS) {
        const msgRef = doc(db, 'request_chat_messages', msg.id);
        batch.set(msgRef, msg);
      }
      await batch.commit();
      console.log('Chat logs seeded successfully.');
    }
  } catch (error) {
    console.warn('Firebase seeding notice (safe to ignore if offline or during setup):', error);
  } finally {
    isSeeding = false;
  }
}

/**
 * Carga o fuerza la recarga de todos los modelos de prueba (solicitudes con fechas varias,
 * reclamos, sugerencias, trabajos realizados y chats de 30 días)
 */
export async function seedAllDemoData(force: boolean = false): Promise<void> {
  // 1. Guardar en localStorage para disponibilidad inmediata y offline
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('oficios_requests', JSON.stringify(INITIAL_REQUESTS));
      localStorage.setItem('oficios_user_feedbacks', JSON.stringify(INITIAL_FEEDBACKS));
      localStorage.setItem('oficios_pros', JSON.stringify(INITIAL_PROFESSIONALS));
      for (const msg of INITIAL_CHAT_LOGS) {
        const key = `oficios_cached_chats_${msg.requestId}`;
        const existingRaw = localStorage.getItem(key);
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        if (!existing.some((m: any) => m.id === msg.id)) {
          existing.push(msg);
          localStorage.setItem(key, JSON.stringify(existing));
        }
      }
    } catch (e) {
      console.warn('Notice caching demo data locally:', e);
    }
  }

  // 2. Sincronizar en Firestore
  try {
    const batch = writeBatch(db);

    // Solicitudes
    for (const req of INITIAL_REQUESTS) {
      const reqRef = doc(db, REQUESTS_COLLECTION, req.id);
      batch.set(reqRef, req, { merge: true });
    }

    // Reclamos y sugerencias
    for (const fb of INITIAL_FEEDBACKS) {
      const fbRef = doc(db, 'user_feedback', fb.id);
      batch.set(fbRef, fb, { merge: true });
    }

    // Chats
    for (const msg of INITIAL_CHAT_LOGS) {
      const msgRef = doc(db, 'request_chat_messages', msg.id);
      batch.set(msgRef, msg, { merge: true });
    }

    // Prestadores
    for (const pro of INITIAL_PROFESSIONALS) {
      const proRef = doc(db, PROS_COLLECTION, pro.id);
      batch.set(proRef, pro, { merge: true });
    }

    await batch.commit();
    console.log('All demo models populated in Firestore successfully.');
  } catch (err) {
    console.warn('Notice saving demo data to Firestore (local storage active):', err);
  }
}

/**
 * Real-time listener for Advertisements
 */
export function subscribeToAdvertisements(
  callback: (ads: AppAdvertisement[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const adsRef = collection(db, ADS_COLLECTION);
    const unsubscribe = onSnapshot(adsRef, (snapshot) => {
      if (!snapshot.empty) {
        const ads: AppAdvertisement[] = [];
        snapshot.forEach(docSnap => {
          ads.push({ id: docSnap.id, ...docSnap.data() } as AppAdvertisement);
        });
        callback(ads);
      } else {
        seedFirestoreIfEmpty();
      }
    }, (err) => {
      console.warn('Advertisements listener warning:', err);
      if (onError) onError(err);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to advertisements:', err);
    return () => {};
  }
}

/**
 * Save advertisements list to Firestore (syncs to all devices)
 */
export async function saveAdvertisementsToFirestore(ads: AppAdvertisement[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const ad of ads) {
      const adRef = doc(db, ADS_COLLECTION, ad.id);
      batch.set(adRef, { ...ad, updatedAt: new Date().toISOString() }, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, ADS_COLLECTION);
  }
}

/**
 * Real-time listener for Professionals (workers / oficios)
 */
export function subscribeToProfessionals(
  callback: (pros: Professional[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const prosRef = collection(db, PROS_COLLECTION);
    const unsubscribe = onSnapshot(prosRef, (snapshot) => {
      if (!snapshot.empty) {
        const pros: Professional[] = [];
        snapshot.forEach(docSnap => {
          pros.push({ id: docSnap.id, ...docSnap.data() } as Professional);
        });
        callback(pros);
      } else {
        seedFirestoreIfEmpty();
      }
    }, (err) => {
      console.warn('Professionals listener warning:', err);
      if (onError) onError(err);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to professionals:', err);
    return () => {};
  }
}

/**
 * Save or update a single professional (registration, profile edit or approval)
 */
export async function saveProfessionalToFirestore(pro: Professional): Promise<void> {
  try {
    const proRef = doc(db, PROS_COLLECTION, pro.id);
    await setDoc(proRef, pro, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${PROS_COLLECTION}/${pro.id}`);
  }
}

/**
 * Save multiple professionals (e.g. bulk approval or import)
 */
export async function saveProfessionalsBatchToFirestore(pros: Professional[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const pro of pros) {
      const proRef = doc(db, PROS_COLLECTION, pro.id);
      batch.set(proRef, pro, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, PROS_COLLECTION);
  }
}

/**
 * Real-time listener for Pro Accounts
 */
export function subscribeToProAccounts(
  callback: (accounts: ProAccount[]) => void
): () => void {
  try {
    const accRef = collection(db, ACCOUNTS_COLLECTION);
    const unsubscribe = onSnapshot(accRef, (snapshot) => {
      if (!snapshot.empty) {
        const accounts: ProAccount[] = [];
        snapshot.forEach(docSnap => {
          accounts.push({ id: docSnap.id, ...docSnap.data() } as ProAccount);
        });
        callback(accounts);
      }
    }, (err) => {
      console.warn('Pro accounts listener warning:', err);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to pro accounts:', err);
    return () => {};
  }
}

/**
 * Save a new pro account (username / password / subscription status)
 */
export async function saveProAccountToFirestore(account: ProAccount): Promise<void> {
  const accountDocId = account.id || account.proId || account.username;
  try {
    const accRef = doc(db, ACCOUNTS_COLLECTION, accountDocId);
    await setDoc(accRef, account, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${ACCOUNTS_COLLECTION}/${accountDocId}`);
  }
}

/**
 * Real-time listener for Service Requests (solicitudes y presupuestos de vecinos)
 */
export function subscribeToServiceRequests(
  callback: (requests: ServiceRequest[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const reqRef = collection(db, REQUESTS_COLLECTION);
    const unsubscribe = onSnapshot(reqRef, (snapshot) => {
      if (!snapshot.empty) {
        const requests: ServiceRequest[] = [];
        snapshot.forEach(docSnap => {
          requests.push({ id: docSnap.id, ...docSnap.data() } as ServiceRequest);
        });
        callback(requests);
      } else {
        seedFirestoreIfEmpty();
      }
    }, (err) => {
      console.warn('Service requests listener warning:', err);
      if (onError) onError(err);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to service requests:', err);
    return () => {};
  }
}

/**
 * Save or update a service request in Firestore
 */
export async function saveServiceRequestToFirestore(request: ServiceRequest): Promise<void> {
  try {
    const reqRef = doc(db, REQUESTS_COLLECTION, request.id);
    await setDoc(reqRef, request, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${REQUESTS_COLLECTION}/${request.id}`);
  }
}

export const DEFAULT_ANALYTICS: AppAnalytics = {
  id: STATS_DOC_ID,
  totalClientVisits: 142,
  uniqueClientsCount: 89,
  totalWhatsAppContacts: 64,
  totalRequestsCreated: 18,
  lastClientVisitAt: new Date().toISOString(),
  firstRecordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
};

/**
 * Real-time listener for general App Analytics
 */
export function subscribeToAnalytics(
  callback: (analytics: AppAnalytics) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const statsDocRef = doc(db, ANALYTICS_COLLECTION, STATS_DOC_ID);
    const unsubscribe = onSnapshot(statsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as AppAnalytics);
      } else {
        setDoc(statsDocRef, DEFAULT_ANALYTICS).catch(() => {});
        callback(DEFAULT_ANALYTICS);
      }
    }, (err) => {
      console.warn('Analytics listener warning:', err);
      if (onError) onError(err);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to analytics:', err);
    return () => {};
  }
}

/**
 * Record a client/neighbor visit session and track unique client
 */
export async function recordClientAppUsage(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const statsDocRef = doc(db, ANALYTICS_COLLECTION, STATS_DOC_ID);
    
    // Check unique client
    let isNewClient = false;
    let clientId = localStorage.getItem('oficios_client_id');
    if (!clientId) {
      clientId = 'cli_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem('oficios_client_id', clientId);
      isNewClient = true;
    }

    // Throttle session count (1 session recorded per 15 minutes per device)
    const lastSession = localStorage.getItem('oficios_last_session');
    const now = Date.now();
    const shouldCountSession = !lastSession || (now - parseInt(lastSession, 10) > 15 * 60 * 1000);

    if (shouldCountSession) {
      localStorage.setItem('oficios_last_session', now.toString());
      
      const snap = await getDoc(statsDocRef);
      if (!snap.exists()) {
        await setDoc(statsDocRef, {
          ...DEFAULT_ANALYTICS,
          totalClientVisits: DEFAULT_ANALYTICS.totalClientVisits + 1,
          uniqueClientsCount: DEFAULT_ANALYTICS.uniqueClientsCount + (isNewClient ? 1 : 0),
          lastClientVisitAt: new Date().toISOString()
        });
      } else {
        await updateDoc(statsDocRef, {
          totalClientVisits: increment(1),
          ...(isNewClient ? { uniqueClientsCount: increment(1) } : {}),
          lastClientVisitAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.warn('Analytics recording notice (safe to ignore if offline):', err);
  }
}

/**
 * Record a WhatsApp contact action by a client to a professional
 */
export async function recordWhatsAppContact(): Promise<void> {
  try {
    const statsDocRef = doc(db, ANALYTICS_COLLECTION, STATS_DOC_ID);
    const snap = await getDoc(statsDocRef);
    if (!snap.exists()) {
      await setDoc(statsDocRef, {
        ...DEFAULT_ANALYTICS,
        totalWhatsAppContacts: DEFAULT_ANALYTICS.totalWhatsAppContacts + 1
      });
    } else {
      await updateDoc(statsDocRef, {
        totalWhatsAppContacts: increment(1)
      });
    }
  } catch (err) {
    console.warn('Analytics WhatsApp click notice:', err);
  }
}

/**
 * Record when a client creates a new service request / pedido de presupuesto
 */
export async function recordServiceRequestCreated(): Promise<void> {
  try {
    const statsDocRef = doc(db, ANALYTICS_COLLECTION, STATS_DOC_ID);
    const snap = await getDoc(statsDocRef);
    if (!snap.exists()) {
      await setDoc(statsDocRef, {
        ...DEFAULT_ANALYTICS,
        totalRequestsCreated: DEFAULT_ANALYTICS.totalRequestsCreated + 1
      });
    } else {
      await updateDoc(statsDocRef, {
        totalRequestsCreated: increment(1)
      });
    }
  } catch (err) {
    console.warn('Analytics request created notice:', err);
  }
}

const CONFIG_COLLECTION = 'appConfig';
const CATEGORIES_DOC_ID = 'categories';
const NEIGHBORHOODS_DOC_ID = 'neighborhoods';

/**
 * Real-time listener for Service Categories configured by the Administrator
 */
export function subscribeToCategories(
  callback: (categories: ServiceCategory[]) => void
): () => void {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CATEGORIES_DOC_ID);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          callback(data.items as ServiceCategory[]);
        }
      }
    }, (err) => {
      console.warn('Categories listener warning:', err);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to categories:', err);
    return () => {};
  }
}

/**
 * Save custom service categories to Firestore
 */
export async function saveCategoriesToFirestore(categories: ServiceCategory[]): Promise<void> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CATEGORIES_DOC_ID);
    await setDoc(docRef, { items: categories, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${CONFIG_COLLECTION}/${CATEGORIES_DOC_ID}`);
  }
}

/**
 * Real-time listener for Localities / Neighborhoods configured by the Administrator
 */
export function subscribeToNeighborhoods(
  callback: (neighborhoods: Neighborhood[]) => void
): () => void {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, NEIGHBORHOODS_DOC_ID);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          callback(data.items as Neighborhood[]);
        }
      }
    }, (err) => {
      console.warn('Neighborhoods listener warning:', err);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to neighborhoods:', err);
    return () => {};
  }
}

/**
 * Save custom neighborhoods / localities to Firestore
 */
export async function saveNeighborhoodsToFirestore(neighborhoods: Neighborhood[]): Promise<void> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, NEIGHBORHOODS_DOC_ID);
    await setDoc(docRef, { items: neighborhoods, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${CONFIG_COLLECTION}/${NEIGHBORHOODS_DOC_ID}`);
  }
}

export const TRIAL_RECORDS_COLLECTION = 'trialRecords';

/**
 * Guarda o actualiza un registro de período de prueba y número de teléfono en Firestore
 * para evitar registros gratuitos duplicados (padrón antifraude).
 */
export async function saveTrialRecordToFirestore(record: TrialRecord): Promise<void> {
  try {
    const docRef = doc(db, TRIAL_RECORDS_COLLECTION, record.id);
    await setDoc(docRef, record, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${TRIAL_RECORDS_COLLECTION}/${record.id}`);
  }
}

/**
 * Escucha en tiempo real el padrón de números de teléfono y períodos de prueba registrados
 */
export function subscribeToTrialRecords(
  callback: (records: TrialRecord[]) => void
): () => void {
  try {
    const colRef = collection(db, TRIAL_RECORDS_COLLECTION);
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const records: TrialRecord[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as TrialRecord);
      });
      callback(records);
    }, (err) => {
      console.warn('Trial records listener warning:', err);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to trial records:', err);
    return () => {};
  }
}

/**
 * Obtiene todos los registros del padrón de pruebas gratuitas
 */
export async function getTrialRecordsFromFirestore(): Promise<TrialRecord[]> {
  try {
    const colRef = collection(db, TRIAL_RECORDS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const records: TrialRecord[] = [];
    snapshot.forEach((docSnap) => {
      records.push(docSnap.data() as TrialRecord);
    });
    return records;
  } catch (err) {
    console.warn('Error reading trial records from firestore:', err);
    return [];
  }
}


