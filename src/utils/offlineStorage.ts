import { UserProfile, ServiceRequest } from '../types';

export const OFICIOS_OFFLINE_PROFILE_KEY = 'oficios_offline_profile_snapshot';
export const OFICIOS_OFFLINE_HIRING_KEY = 'oficios_offline_hiring_snapshot';
export const OFICIOS_LAST_SYNC_KEY = 'oficios_last_online_sync_at';

export interface OfflineProfileSnapshot {
  profile: UserProfile;
  syncedAt: string;
}

export interface OfflineHiringSnapshot {
  contracts: ServiceRequest[];
  syncedAt: string;
}

/**
 * Guarda una instantánea local del perfil y del historial de contrataciones
 * para que estén disponibles cuando no haya conexión a internet.
 */
export const saveOfflineSnapshot = (
  profile: UserProfile,
  requests: ServiceRequest[]
) => {
  try {
    const nowIso = new Date().toISOString();
    
    // Guardar snapshot de perfil
    const profileSnapshot: OfflineProfileSnapshot = {
      profile,
      syncedAt: nowIso
    };
    localStorage.setItem(OFICIOS_OFFLINE_PROFILE_KEY, JSON.stringify(profileSnapshot));

    // Guardar snapshot de contrataciones (filtrando contratados y completados)
    const hiringContracts = requests.filter(
      r => r.status === 'contratado' || r.status === 'completado'
    );
    const hiringSnapshot: OfflineHiringSnapshot = {
      contracts: hiringContracts,
      syncedAt: nowIso
    };
    localStorage.setItem(OFICIOS_OFFLINE_HIRING_KEY, JSON.stringify(hiringSnapshot));

    // Guardar marca de última sincronización
    localStorage.setItem(OFICIOS_LAST_SYNC_KEY, nowIso);
  } catch (error) {
    console.warn('Error guardando snapshot offline:', error);
  }
};

/**
 * Obtiene el perfil guardado localmente junto con la fecha de sincronización
 */
export const getOfflineUserProfile = (fallbackProfile: UserProfile): OfflineProfileSnapshot => {
  try {
    const saved = localStorage.getItem(OFICIOS_OFFLINE_PROFILE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.profile) {
        return parsed;
      }
    }
  } catch (e) {}

  return {
    profile: fallbackProfile,
    syncedAt: localStorage.getItem(OFICIOS_LAST_SYNC_KEY) || new Date().toISOString()
  };
};

/**
 * Obtiene el historial de contrataciones guardado localmente
 */
export const getOfflineHiringHistory = (fallbackRequests: ServiceRequest[] = []): OfflineHiringSnapshot => {
  try {
    const saved = localStorage.getItem(OFICIOS_OFFLINE_HIRING_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.contracts)) {
        return parsed;
      }
    }
  } catch (e) {}

  const hiringOnly = fallbackRequests.filter(
    r => r.status === 'contratado' || r.status === 'completado'
  );

  return {
    contracts: hiringOnly,
    syncedAt: localStorage.getItem(OFICIOS_LAST_SYNC_KEY) || new Date().toISOString()
  };
};

/**
 * Formatea la fecha de sincronización en formato legible argentino
 */
export const formatOfflineSyncTime = (dateStr?: string | null): string => {
  if (!dateStr) return 'Fecha no registrada';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const hoy = new Date();
    const esHoy = 
      date.getDate() === hoy.getDate() &&
      date.getMonth() === hoy.getMonth() &&
      date.getFullYear() === hoy.getFullYear();

    const hora = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    if (esHoy) {
      return `Hoy a las ${hora} hs`;
    }

    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' hs';
  } catch {
    return dateStr;
  }
};

/**
 * Suscripción a eventos de red online / offline
 */
export const subscribeToNetworkStatus = (callback: (isOnline: boolean) => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
