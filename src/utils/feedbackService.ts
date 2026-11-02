import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserFeedback } from '../types';
import { INITIAL_FEEDBACKS } from '../data/mockData';

const FEEDBACK_COLLECTION = 'user_feedback';
const LOCAL_FEEDBACK_KEY = 'oficios_user_feedbacks';

/**
 * Obtiene los reclamos y sugerencias guardados en el almacenamiento local
 */
export function getLocalUserFeedbacks(filterDeviceId?: string): UserFeedback[] {
  if (typeof window === 'undefined') return INITIAL_FEEDBACKS;
  try {
    const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    const list: UserFeedback[] = raw ? JSON.parse(raw) : INITIAL_FEEDBACKS;
    if (!raw && INITIAL_FEEDBACKS.length > 0) {
      saveLocalFeedbacks(INITIAL_FEEDBACKS);
    }
    if (filterDeviceId) {
      return list.filter(f => f.deviceId === filterDeviceId);
    }
    return list;
  } catch {
    return INITIAL_FEEDBACKS;
  }
}

/**
 * Guarda reclamos en el almacenamiento local
 */
function saveLocalFeedbacks(feedbacks: UserFeedback[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(feedbacks));
  } catch (err) {
    console.warn('Notice saving local feedback cache:', err);
  }
}

/**
 * Registra un nuevo reclamo, queja, sugerencia o consulta de un vecino
 */
export async function submitUserFeedback(data: {
  type: 'reclamo' | 'sugerencia' | 'felicitacion' | 'consulta';
  title: string;
  description: string;
  deviceId: string;
  userName?: string;
  userPhone?: string;
  userNeighborhood?: string;
  relatedRequestId?: string;
  relatedRequestTitle?: string;
  relatedProId?: string;
  relatedProName?: string;
}): Promise<UserFeedback> {
  const codeSuffix = Math.floor(1000 + Math.random() * 9000);
  const id = `REC-${new Date().getFullYear()}-${codeSuffix}`;
  const now = new Date().toISOString();

  const newFeedback: UserFeedback = {
    id,
    type: data.type,
    title: data.title.trim(),
    description: data.description.trim(),
    deviceId: data.deviceId,
    userName: data.userName?.trim(),
    userPhone: data.userPhone?.trim(),
    userNeighborhood: data.userNeighborhood?.trim(),
    relatedRequestId: data.relatedRequestId,
    relatedRequestTitle: data.relatedRequestTitle,
    relatedProId: data.relatedProId,
    relatedProName: data.relatedProName,
    status: 'pendiente',
    createdAt: now
  };

  // Guardar inmediatamente en caché local
  const currentLocal = getLocalUserFeedbacks();
  const updatedLocal = [newFeedback, ...currentLocal.filter(f => f.id !== id)];
  saveLocalFeedbacks(updatedLocal);

  // Sincronizar en Firebase Firestore
  try {
    const docRef = doc(db, FEEDBACK_COLLECTION, id);
    await setDoc(docRef, newFeedback);
  } catch (err) {
    console.warn('Notice storing feedback in Firestore (persisted locally):', err);
  }

  return newFeedback;
}

/**
 * Suscripción en tiempo real a la bandeja de reclamos y sugerencias para el Administrador
 */
export function subscribeToUserFeedbacks(
  callback: (feedbacks: UserFeedback[]) => void
): () => void {
  // Inicialmente enviar la caché local para no demorar la pantalla
  const localList = getLocalUserFeedbacks();
  if (localList.length > 0) {
    callback(localList);
  }

  try {
    const q = query(
      collection(db, FEEDBACK_COLLECTION),
      limit(150)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UserFeedback[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          type: d.type || 'reclamo',
          title: d.title || 'Reclamo de usuario',
          description: d.description || '',
          deviceId: d.deviceId || 'DEV-UNKNOWN',
          userName: d.userName,
          userPhone: d.userPhone,
          userNeighborhood: d.userNeighborhood,
          relatedRequestId: d.relatedRequestId,
          relatedRequestTitle: d.relatedRequestTitle,
          relatedProId: d.relatedProId,
          relatedProName: d.relatedProName,
          status: d.status || 'pendiente',
          adminNotes: d.adminNotes,
          createdAt: d.createdAt || new Date().toISOString(),
          resolvedAt: d.resolvedAt
        });
      });

      // Ordenar por fecha descendente (más nuevos primero)
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Combinar con locales si hay offline
      const localIds = new Set(list.map(f => f.id));
      const combined = [...list];
      for (const loc of localList) {
        if (!localIds.has(loc.id)) {
          combined.push(loc);
        }
      }
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      saveLocalFeedbacks(combined);
      callback(combined);
    }, (err) => {
      console.warn('User feedback listener notice (using local storage):', err);
      callback(getLocalUserFeedbacks());
    });

    return unsubscribe;
  } catch (err) {
    console.error('Error subscribing to user feedbacks:', err);
    return () => {};
  }
}

/**
 * Actualiza el estado y respuesta de un reclamo por parte del Administrador
 */
export async function updateFeedbackStatus(
  feedbackId: string, 
  status: 'pendiente' | 'en_revision' | 'resuelto', 
  adminNotes?: string
): Promise<void> {
  const now = new Date().toISOString();
  
  // Actualizar localmente
  const current = getLocalUserFeedbacks();
  const updated = current.map(f => {
    if (f.id === feedbackId) {
      return {
        ...f,
        status,
        ...(adminNotes ? { adminNotes } : {}),
        ...(status === 'resuelto' ? { resolvedAt: now } : {})
      };
    }
    return f;
  });
  saveLocalFeedbacks(updated);

  // Actualizar en Firestore
  try {
    const docRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
    await updateDoc(docRef, {
      status,
      ...(adminNotes ? { adminNotes } : {}),
      ...(status === 'resuelto' ? { resolvedAt: now } : {})
    });
  } catch (err) {
    console.warn('Notice updating feedback in Firestore:', err);
  }
}
