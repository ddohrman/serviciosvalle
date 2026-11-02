import { doc, getDoc, setDoc, updateDoc, increment, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DeviceAccessLog } from '../types';

const DEVICE_ID_KEY = 'oficios_device_id';
const DEVICE_PHONE_KEY = 'oficios_user_phone';
const DEVICE_NICKNAME_KEY = 'oficios_user_nickname';
const DEVICE_LOGS_COLLECTION = 'device_access_logs';

/**
 * Retorna o crea un ID único y persistente para este dispositivo (celular, tablet o computadora)
 * Simula de forma segura y estándar un identificador único sin requerir permisos de hardware como IMEI
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'DEV-UNKNOWN';
  
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timeHex = Date.now().toString(36).slice(-4).toUpperCase();
    deviceId = `DEV-LERMA-${randomHex}-${timeHex}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Detecta características del dispositivo (tipo, sistema operativo, navegador y resolución)
 */
export function detectDeviceCharacteristics() {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'Desconocido',
      browser: 'Desconocido',
      platform: 'Desconocido',
      screenResolution: 'N/A'
    };
  }

  const ua = navigator.userAgent || '';
  let deviceType = 'Computadora';
  if (/Android/i.test(ua)) {
    deviceType = /Tablet|Nexus 7|Nexus 9/i.test(ua) ? 'Tablet Android' : 'Móvil Android';
  } else if (/iPad|PlayBook/i.test(ua)) {
    deviceType = 'iPad / Tablet';
  } else if (/iPhone/i.test(ua)) {
    deviceType = 'Apple iPhone';
  } else if (/Mobile/i.test(ua)) {
    deviceType = 'Móvil';
  }

  let browser = 'Navegador Web';
  if (/SamsungBrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/Chrome|CriOS/i.test(ua) && !/Edge|Edg|OPR/i.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox|FxiOS/i.test(ua)) {
    browser = 'Firefox';
  } else if (/Edg|Edge/i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/OPR|Opera/i.test(ua)) {
    browser = 'Opera';
  }

  let platform = 'Web';
  if (/Android/i.test(ua)) platform = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) platform = 'iOS';
  else if (/Windows/i.test(ua)) platform = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) platform = 'MacOS';
  else if (/Linux/i.test(ua)) platform = 'Linux';

  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  return {
    deviceType,
    browser,
    platform,
    screenResolution
  };
}

/**
 * Obtiene el teléfono opcional asociado a este dispositivo
 */
export function getStoredDevicePhone(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(DEVICE_PHONE_KEY) || '';
}

/**
 * Obtiene el apodo opcional asociado a este dispositivo
 */
export function getStoredDeviceNickname(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(DEVICE_NICKNAME_KEY) || '';
}

/**
 * Guarda o actualiza el teléfono opcional del usuario para sincronizar estadísticas y favoritos
 */
export async function saveDevicePhone(phone: string, nickname?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const cleanPhone = phone.trim();
  localStorage.setItem(DEVICE_PHONE_KEY, cleanPhone);
  if (nickname) {
    localStorage.setItem(DEVICE_NICKNAME_KEY, nickname.trim());
  }

  const deviceId = getOrCreateDeviceId();
  try {
    const docRef = doc(db, DEVICE_LOGS_COLLECTION, deviceId);
    await updateDoc(docRef, {
      phone: cleanPhone,
      ...(nickname ? { nickname: nickname.trim() } : {}),
      lastSeen: new Date().toISOString()
    });
  } catch (err) {
    // Si aún no existe el documento, se creará en el próximo logDeviceAccess
    console.warn('Notice updating device phone in Firestore:', err);
  }
}

/**
 * Registra o actualiza el acceso del dispositivo en Firestore
 * Guarda el ID persistente, cantidad de visitas, fecha, favoritos guardados y acción realizada
 */
export async function logDeviceAccess(options?: {
  action?: string;
  favoriteProIds?: string[];
  neighborhood?: string;
  phone?: string;
  nickname?: string;
}): Promise<void> {
  if (typeof window === 'undefined') return;

  const deviceId = getOrCreateDeviceId();
  const phone = options?.phone || getStoredDevicePhone();
  const nickname = options?.nickname || getStoredDeviceNickname();
  const characteristics = detectDeviceCharacteristics();
  const now = new Date().toISOString();

  // Guardar en localStorage para disponibilidad offline inmediata
  const localVisitCount = parseInt(localStorage.getItem('oficios_device_visits') || '0', 10) + 1;
  localStorage.setItem('oficios_device_visits', localVisitCount.toString());
  localStorage.setItem('oficios_device_last_seen', now);

  try {
    const docRef = doc(db, DEVICE_LOGS_COLLECTION, deviceId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      const newLog: DeviceAccessLog = {
        id: deviceId,
        deviceId,
        firstSeen: now,
        lastSeen: now,
        visitCount: 1,
        phone: phone || undefined,
        nickname: nickname || undefined,
        neighborhood: options?.neighborhood || undefined,
        deviceType: characteristics.deviceType,
        browser: characteristics.browser,
        screenResolution: characteristics.screenResolution,
        platform: characteristics.platform,
        favoritesCount: options?.favoriteProIds ? options.favoriteProIds.length : 0,
        favoriteProIds: options?.favoriteProIds || [],
        lastAction: options?.action || 'Ingreso a la app'
      };
      await setDoc(docRef, newLog);
    } else {
      const data = snap.data();
      const currentVisits = (data.visitCount || 0) + 1;
      await updateDoc(docRef, {
        lastSeen: now,
        visitCount: increment(1),
        deviceType: characteristics.deviceType,
        browser: characteristics.browser,
        screenResolution: characteristics.screenResolution,
        platform: characteristics.platform,
        ...(phone ? { phone } : {}),
        ...(nickname ? { nickname } : {}),
        ...(options?.neighborhood ? { neighborhood: options.neighborhood } : {}),
        ...(options?.favoriteProIds !== undefined ? {
          favoritesCount: options.favoriteProIds.length,
          favoriteProIds: options.favoriteProIds
        } : {}),
        lastAction: options?.action || 'Uso de la aplicación'
      });
    }
  } catch (err) {
    console.warn('Notice recording device access log (offline or pending):', err);
  }
}

export const DEFAULT_DEMO_DEVICE_LOGS: DeviceAccessLog[] = [
  {
    id: 'DEV-LERMA-8841-9920',
    deviceId: 'DEV-LERMA-8841-9920',
    firstSeen: '2026-10-20T10:00:00.000Z',
    lastSeen: '2026-10-30T09:45:00.000Z',
    visitCount: 6,
    phone: '+54 387 499-1304',
    nickname: 'Familia Morales',
    neighborhood: 'El Carril',
    deviceType: 'Móvil Android',
    browser: 'Chrome Mobile',
    screenResolution: '412x915',
    platform: 'Android',
    favoritesCount: 2,
    favoriteProIds: ['carlos-mamani', 'roberto-gomez'],
    lastAction: 'Envió mensaje en chat de cañería'
  },
  {
    id: 'DEV-LERMA-4412-3301',
    deviceId: 'DEV-LERMA-4412-3301',
    firstSeen: '2026-10-22T14:30:00.000Z',
    lastSeen: '2026-10-29T16:20:00.000Z',
    visitCount: 9,
    phone: '+54 387 512-4490',
    nickname: 'Lucas Pastrana',
    neighborhood: 'Cerrillos',
    deviceType: 'Móvil Android',
    browser: 'Samsung Internet',
    screenResolution: '384x854',
    platform: 'Android',
    favoritesCount: 1,
    favoriteProIds: ['roberto-gomez'],
    lastAction: 'Presentó reclamo de escombros'
  },
  {
    id: 'DEV-LERMA-1092-7744',
    deviceId: 'DEV-LERMA-1092-7744',
    firstSeen: '2026-10-15T09:00:00.000Z',
    lastSeen: '2026-10-29T11:15:00.000Z',
    visitCount: 14,
    phone: '+54 387 455-8910',
    nickname: 'Juan Martín López',
    neighborhood: 'Cerrillos',
    deviceType: 'Computadora',
    browser: 'Chrome',
    screenResolution: '1920x1080',
    platform: 'Windows',
    favoritesCount: 3,
    favoriteProIds: ['carlos-mamani', 'roberto-gomez'],
    lastAction: 'Consultó cotización de térmicas'
  },
  {
    id: 'DEV-LERMA-3319-5562',
    deviceId: 'DEV-LERMA-3319-5562',
    firstSeen: '2026-10-18T18:00:00.000Z',
    lastSeen: '2026-10-27T14:00:00.000Z',
    visitCount: 7,
    phone: '+54 387 499-8812',
    nickname: 'Estela Morales',
    neighborhood: 'Cerrillos',
    deviceType: 'Apple iPhone',
    browser: 'Safari',
    screenResolution: '390x844',
    platform: 'iOS',
    favoritesCount: 2,
    favoriteProIds: ['carlos-mamani', 'roberto-gomez'],
    lastAction: 'Visualizó obra terminada de asador'
  },
  {
    id: 'DEV-LERMA-6650-1288',
    deviceId: 'DEV-LERMA-6650-1288',
    firstSeen: '2026-10-12T11:20:00.000Z',
    lastSeen: '2026-10-28T14:45:00.000Z',
    visitCount: 8,
    phone: '+54 387 566-7788',
    nickname: 'Silvia Albarracín',
    neighborhood: 'Rosario de Lerma',
    deviceType: 'Móvil Android',
    browser: 'Chrome Mobile',
    screenResolution: '360x800',
    platform: 'Android',
    favoritesCount: 2,
    favoriteProIds: ['carlos-mamani'],
    lastAction: 'Envió sugerencia de fletes'
  },
  {
    id: 'DEV-LERMA-7740-9912',
    deviceId: 'DEV-LERMA-7740-9912',
    firstSeen: '2026-10-10T16:00:00.000Z',
    lastSeen: '2026-10-28T18:40:00.000Z',
    visitCount: 5,
    phone: '+54 387 411-9933',
    nickname: 'Fabián Colque',
    neighborhood: 'Campo Quijano',
    deviceType: 'Móvil Android',
    browser: 'Chrome Mobile',
    screenResolution: '412x915',
    platform: 'Android',
    favoritesCount: 1,
    favoriteProIds: ['carlos-mamani'],
    lastAction: 'Publicó pedido de plomero gasista'
  }
];

/**
 * Suscripción en tiempo real a la lista de dispositivos registrados para el Panel de Administrador
 */
export function subscribeToDeviceLogs(
  callback: (logs: DeviceAccessLog[]) => void
): () => void {
  // Inicialmente pasar los de demostración
  callback(DEFAULT_DEMO_DEVICE_LOGS);

  try {
    const q = query(
      collection(db, DEVICE_LOGS_COLLECTION),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs: DeviceAccessLog[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        logs.push({
          id: docSnap.id,
          deviceId: data.deviceId || docSnap.id,
          firstSeen: data.firstSeen || new Date().toISOString(),
          lastSeen: data.lastSeen || new Date().toISOString(),
          visitCount: data.visitCount || 1,
          phone: data.phone,
          nickname: data.nickname,
          neighborhood: data.neighborhood,
          deviceType: data.deviceType || 'Móvil',
          browser: data.browser || 'Navegador Web',
          screenResolution: data.screenResolution || 'N/A',
          platform: data.platform || 'Web',
          favoritesCount: data.favoritesCount || (data.favoriteProIds ? data.favoriteProIds.length : 0),
          favoriteProIds: data.favoriteProIds || [],
          lastAction: data.lastAction || 'Actividad en la app'
        });
      });

      // Si la base no tiene registros aún, usar los demo
      if (logs.length === 0) {
        callback(DEFAULT_DEMO_DEVICE_LOGS);
        return;
      }

      // Combinar para que los de prueba sigan apareciendo para facilitar pruebas
      const ids = new Set(logs.map(l => l.deviceId));
      for (const d of DEFAULT_DEMO_DEVICE_LOGS) {
        if (!ids.has(d.deviceId)) {
          logs.push(d);
        }
      }

      // Ordenar por última visita descendente
      logs.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
      callback(logs);
    }, (err) => {
      console.warn('Device logs listener warning:', err);
      callback(DEFAULT_DEMO_DEVICE_LOGS);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to device logs:', err);
    callback(DEFAULT_DEMO_DEVICE_LOGS);
    return () => {};
  }
}
