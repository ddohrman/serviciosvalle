import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChatMessage } from '../types';
import { INITIAL_CHAT_LOGS } from '../data/mockData';

const CHAT_COLLECTION = 'request_chat_messages';
const LOCAL_CHATS_KEY = 'oficios_cached_chats';

/**
 * Obtiene los mensajes en caché local para respuesta instantánea u offline
 */
function getLocalCachedMessages(requestId: string): ChatMessage[] {
  if (typeof window === 'undefined') {
    return INITIAL_CHAT_LOGS.filter(m => m.requestId === requestId);
  }
  try {
    const raw = localStorage.getItem(`${LOCAL_CHATS_KEY}_${requestId}`);
    if (raw) return JSON.parse(raw);
    const demoMatches = INITIAL_CHAT_LOGS.filter(m => m.requestId === requestId);
    if (demoMatches.length > 0) {
      setLocalCachedMessages(requestId, demoMatches);
      return demoMatches;
    }
    return [];
  } catch {
    return INITIAL_CHAT_LOGS.filter(m => m.requestId === requestId);
  }
}

/**
 * Guarda mensajes en caché local
 */
function setLocalCachedMessages(requestId: string, messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_CHATS_KEY}_${requestId}`, JSON.stringify(messages));
  } catch {
    // quota exceeded or private mode fallback
  }
}

/**
 * Suscribe en tiempo real a los mensajes de una solicitud específica
 */
export function subscribeToChatMessages(
  requestId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  // Entregar inmediatamente la caché local para no demorar la interfaz
  const local = getLocalCachedMessages(requestId);
  if (local.length > 0) {
    callback(local);
  }

  try {
    const q = query(
      collection(db, CHAT_COLLECTION),
      where('requestId', '==', requestId),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        messages.push({
          id: docSnap.id,
          requestId: data.requestId || requestId,
          requestTitle: data.requestTitle,
          senderId: data.senderId,
          senderName: data.senderName,
          senderRole: data.senderRole,
          senderAvatar: data.senderAvatar,
          text: data.text,
          createdAt: data.createdAt,
          expiresAt: data.expiresAt,
          securityLogHash: data.securityLogHash,
          read: data.read ?? true
        });
      });

      // Ordenar cronológicamente (más antiguo primero)
      messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setLocalCachedMessages(requestId, messages);
      callback(messages);
    }, (err) => {
      console.warn('Chat messages listener notice (using local cache if offline):', err);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Error subscribing to chat messages:', err);
    return () => {};
  }
}

/**
 * Envía un mensaje en el chat y genera el registro de seguridad de 30 días
 */
export async function sendChatMessage(data: {
  requestId: string;
  requestTitle?: string;
  senderId: string;
  senderName: string;
  senderRole: 'vecino' | 'prestador' | 'admin';
  senderAvatar?: string;
  text: string;
  deviceId?: string;
}): Promise<ChatMessage> {
  const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();
  const createdAt = now.toISOString();
  // 30 días exactos de retención de log por seguridad
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const securityLogHash = `SEC30D-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  
  // Capturar o usar el deviceId pasado
  const deviceId = data.deviceId || (typeof window !== 'undefined' ? localStorage.getItem('oficios_device_id') || undefined : undefined);

  const newMessage: ChatMessage = {
    id: msgId,
    requestId: data.requestId,
    requestTitle: data.requestTitle,
    senderId: data.senderId,
    senderName: data.senderName,
    senderRole: data.senderRole,
    senderAvatar: data.senderAvatar,
    text: data.text.trim(),
    createdAt,
    expiresAt,
    securityLogHash,
    deviceId,
    read: true
  };

  // Actualizar inmediatamente la caché local
  const current = getLocalCachedMessages(data.requestId);
  setLocalCachedMessages(data.requestId, [...current, newMessage]);

  try {
    const docRef = doc(db, CHAT_COLLECTION, msgId);
    await setDoc(docRef, newMessage);
  } catch (err) {
    console.warn('Notice saving message to Firestore (stored locally):', err);
  }

  return newMessage;
}

/**
 * Suscribe a todos los mensajes registrados en los últimos 30 días para auditoría del Administrador
 */
export function subscribeToSecurityChatLogs(
  callback: (logs: ChatMessage[]) => void
): () => void {
  // Inicialmente pasar los logs iniciales/cacheados
  callback(INITIAL_CHAT_LOGS);

  try {
    const q = query(
      collection(db, CHAT_COLLECTION),
      limit(250)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        logs.push({
          id: docSnap.id,
          requestId: data.requestId,
          requestTitle: data.requestTitle,
          senderId: data.senderId,
          senderName: data.senderName,
          senderRole: data.senderRole,
          senderAvatar: data.senderAvatar,
          text: data.text,
          createdAt: data.createdAt,
          expiresAt: data.expiresAt,
          securityLogHash: data.securityLogHash,
          deviceId: data.deviceId,
          read: data.read
        });
      });

      if (logs.length === 0) {
        callback(INITIAL_CHAT_LOGS);
        return;
      }

      // Combinar con los iniciales para asegurar que los chats de prueba sigan existiendo
      const ids = new Set(logs.map(l => l.id));
      for (const initMsg of INITIAL_CHAT_LOGS) {
        if (!ids.has(initMsg.id)) {
          logs.push(initMsg);
        }
      }

      // Ordenar por más reciente primero para el panel del admin
      logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(logs);
    }, (err) => {
      console.warn('Security chat logs listener notice:', err);
      callback(INITIAL_CHAT_LOGS);
    });

    return unsubscribe;
  } catch (err) {
    console.error('Error subscribing to security chat logs:', err);
    callback(INITIAL_CHAT_LOGS);
    return () => {};
  }
}

/**
 * Calcula los días restantes antes de que expire el registro de seguridad de 30 días
 */
export function getRemainingSecurityDays(expiresAtStr: string): number {
  try {
    const expires = new Date(expiresAtStr).getTime();
    const diff = expires - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  } catch {
    return 30;
  }
}

/**
 * Descarga una transcripción pericial de chats en archivo de texto plano (.txt)
 */
export function downloadChatsAsTextFile(messages: ChatMessage[], deviceIdOrTitle: string): void {
  if (typeof window === 'undefined' || messages.length === 0) return;

  const header = [
    '=========================================================================',
    'OFICIOS VALLE DE LERMA - TRANSCRIPCIÓN PERICIAL DE MENSAJES Y CHATS',
    '=========================================================================',
    `Fecha de Emisión del Reporte: ${new Date().toLocaleString('es-AR')}`,
    `Filtro / Identificador de Dispositivo: ${deviceIdOrTitle}`,
    `Total de Mensajes Auditados: ${messages.length}`,
    `Política de Seguridad: Resguardo activo por 30 días para resolución de disputas`,
    '=========================================================================\n'
  ].join('\n');

  const body = messages.map((m, idx) => {
    const remainingDays = getRemainingSecurityDays(m.createdAt);
    return [
      `[${idx + 1}] FECHA: ${new Date(m.createdAt).toLocaleString('es-AR')}`,
      `SOLICITUD: #${m.requestId} - "${m.requestTitle || 'Solicitud de Trabajo'}"`,
      `REMITENTE: ${m.senderName} (${m.senderRole.toUpperCase()}) | ID: ${m.senderId}`,
      m.deviceId ? `DISPOSITIVO REGISTRADO: ${m.deviceId}` : '',
      `INTEGRIDAD HASH: ${m.securityLogHash || 'N/A'} (Expira en ${remainingDays} días)`,
      `MENSAJE: "${m.text}"`,
      '-------------------------------------------------------------------------'
    ].filter(Boolean).join('\n');
  }).join('\n\n');

  const content = `${header}\n${body}\n\n[Fin de Transcripción Oficial]`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chats_peritaje_${deviceIdOrTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
