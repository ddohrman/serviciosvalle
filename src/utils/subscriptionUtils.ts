import { Professional, TrialRecord } from '../types';

/**
 * Normaliza números de teléfono argentinos eliminando símbolos, espacios,
 * prefijos de país (+54 / 54), prefijos de celular (9) y prefijos de discado (0 / 15).
 * Ejemplo: "+54 9 387 528-6914" -> "3875286914"
 * Ejemplo: "0387-15-5286914" -> "3875286914"
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  // Eliminar todo caracter que no sea dígito
  let digits = rawPhone.replace(/\D/g, '');

  // Eliminar prefijo de país 54
  if (digits.startsWith('54')) {
    digits = digits.slice(2);
  }

  // Eliminar prefijo móvil internacional '9' (después de 54) si la longitud es >= 10
  if (digits.startsWith('9') && digits.length >= 10) {
    digits = digits.slice(1);
  }

  // Eliminar prefijo interurbano '0'
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Eliminar prefijo local '15' si está después de la característica de Salta/Cerrillos (387 o 3877)
  if (digits.startsWith('387') && digits.slice(3).startsWith('15')) {
    digits = '387' + digits.slice(5);
  } else if (digits.startsWith('3877') && digits.slice(4).startsWith('15')) {
    digits = '3877' + digits.slice(6);
  }

  return digits;
}

export interface SubscriptionCalculation {
  isExpired: boolean;
  plan: 'prueba_gratuita' | 'abono_mensual' | 'abono_anual';
  status: 'activa' | 'caducada';
  daysRemaining: number;
  daysPassed: number;
  statusLabel: string;
  badgeText: string;
  badgeVariant: 'active-green' | 'warning-amber' | 'expired-red' | 'paid-blue' | 'paid-purple';
  paymentDateFormatted?: string;
  cutoffDateFormatted: string;
  isPaidPlan: boolean;
  canAccess: boolean;
}

/**
 * Calcula con precisión los días restantes y el corte automático
 * tanto para prestadores en período de prueba gratuita (30 días)
 * como para prestadores con abono mensual pago (corte a los 30 días de la fecha de pago)
 * o abono anual (corte a los 365 días).
 */
export function getProSubscriptionDetails(pro: Professional): SubscriptionCalculation {
  const plan = pro.subscriptionPlan || 'prueba_gratuita';
  const isPaidPlan = plan === 'abono_mensual' || plan === 'abono_anual';
  const now = Date.now();

  // 1. CASO ABONO MENSUAL (PAGO)
  if (plan === 'abono_mensual') {
    // Si no tiene fecha de pago registrada, se asume la fecha de submissionDate o hace 0 días
    const paymentDateStr = pro.lastPaymentDate || pro.submissionDate || new Date().toISOString().split('T')[0];
    const paymentTime = new Date(paymentDateStr).getTime();
    
    // El corte es a los 30 días exactos de la fecha de pago
    let cutoffTime: number;
    if (pro.paymentValidUntil) {
      cutoffTime = new Date(pro.paymentValidUntil).getTime();
    } else {
      cutoffTime = paymentTime + 30 * 24 * 60 * 60 * 1000;
    }

    const diffMs = cutoffTime - now;
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const daysPassed = Math.floor((now - paymentTime) / (1000 * 60 * 60 * 24));

    // Si pasaron 30 días o está marcado explícitamente como caducado: SE CORTA EL INGRESO AUTOMÁTICAMENTE
    const isExpired = daysRemaining <= 0 || pro.subscriptionStatus === 'caducada';

    const paymentDateFormatted = new Date(paymentTime).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const cutoffDateFormatted = new Date(cutoffTime).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (isExpired) {
      return {
        isExpired: true,
        canAccess: false,
        plan,
        status: 'caducada',
        daysRemaining: 0,
        daysPassed,
        statusLabel: `Abono Mensual Vencido hace ${Math.abs(daysRemaining)} días`,
        badgeText: `Vencido (${cutoffDateFormatted})`,
        badgeVariant: 'expired-red',
        paymentDateFormatted,
        cutoffDateFormatted,
        isPaidPlan: true
      };
    }

    return {
      isExpired: false,
      canAccess: true,
      plan,
      status: 'activa',
      daysRemaining,
      daysPassed,
      statusLabel: `Abono Mensual Activo • Quedan ${daysRemaining} días de servicio`,
      badgeText: `Abonado (Quedan ${daysRemaining}d)`,
      badgeVariant: daysRemaining <= 5 ? 'warning-amber' : 'paid-blue',
      paymentDateFormatted,
      cutoffDateFormatted,
      isPaidPlan: true
    };
  }

  // 2. CASO ABONO ANUAL (PAGO)
  if (plan === 'abono_anual') {
    const paymentDateStr = pro.lastPaymentDate || pro.submissionDate || new Date().toISOString().split('T')[0];
    const paymentTime = new Date(paymentDateStr).getTime();
    const cutoffTime = pro.paymentValidUntil
      ? new Date(pro.paymentValidUntil).getTime()
      : paymentTime + 365 * 24 * 60 * 60 * 1000;

    const diffMs = cutoffTime - now;
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining <= 0 || pro.subscriptionStatus === 'caducada';

    const paymentDateFormatted = new Date(paymentTime).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const cutoffDateFormatted = new Date(cutoffTime).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    if (isExpired) {
      return {
        isExpired: true,
        canAccess: false,
        plan,
        status: 'caducada',
        daysRemaining: 0,
        daysPassed: Math.floor((now - paymentTime) / (1000 * 60 * 60 * 24)),
        statusLabel: 'Abono Anual Vencido',
        badgeText: 'Anual Vencido',
        badgeVariant: 'expired-red',
        paymentDateFormatted,
        cutoffDateFormatted,
        isPaidPlan: true
      };
    }

    return {
      isExpired: false,
      canAccess: true,
      plan,
      status: 'activa',
      daysRemaining,
      daysPassed: Math.floor((now - paymentTime) / (1000 * 60 * 60 * 24)),
      statusLabel: `Abono Anual Activo • Quedan ${daysRemaining} días`,
      badgeText: `Anual (${daysRemaining}d)`,
      badgeVariant: 'paid-purple',
      paymentDateFormatted,
      cutoffDateFormatted,
      isPaidPlan: true
    };
  }

  // 3. CASO PERÍODO DE PRUEBA GRATUITA (30 DÍAS)
  let startTime = now;
  if (pro.trialStartDate) {
    startTime = new Date(pro.trialStartDate).getTime();
  } else if (pro.submissionDate) {
    startTime = new Date(pro.submissionDate).getTime();
  }

  let endTime: number;
  if (pro.trialEndDate) {
    endTime = new Date(pro.trialEndDate).getTime();
  } else {
    endTime = startTime + 30 * 24 * 60 * 60 * 1000;
  }

  const diffMs = endTime - now;
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const daysPassed = Math.floor((now - startTime) / (1000 * 60 * 60 * 24));

  // Si pasaron los 30 días, o está marcado isTrialExpired: SE CORTA EL ACCESO AUTOMÁTICAMENTE
  const isExpired = 
    daysRemaining <= 0 || 
    pro.isTrialExpired === true || 
    pro.trialActive === false || 
    pro.subscriptionStatus === 'caducada';

  const cutoffDateFormatted = new Date(endTime).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  if (isExpired) {
    const passedDaysCount = Math.max(1, Math.abs(daysRemaining));
    return {
      isExpired: true,
      canAccess: false,
      plan: 'prueba_gratuita',
      status: 'caducada',
      daysRemaining: 0,
      daysPassed,
      statusLabel: `Prueba Gratuita Caducada hace ${passedDaysCount} días`,
      badgeText: `Prueba Caducada (${cutoffDateFormatted})`,
      badgeVariant: 'expired-red',
      cutoffDateFormatted,
      isPaidPlan: false
    };
  }

  return {
    isExpired: false,
    canAccess: true,
    plan: 'prueba_gratuita',
    status: 'activa',
    daysRemaining,
    daysPassed,
    statusLabel: `Prueba Gratuita Activa • Le quedan ${daysRemaining} días`,
    badgeText: `Prueba: ${daysRemaining} días restantes`,
    badgeVariant: daysRemaining <= 7 ? 'warning-amber' : 'active-green',
    cutoffDateFormatted,
    isPaidPlan: false
  };
}

/**
 * Calcula la fecha de corte sumando una cantidad de días a una fecha base (YYYY-MM-DD)
 */
export function calculateCutoffDate(baseDateStr: string, daysToAdd: number = 30): string {
  const baseDate = new Date(baseDateStr);
  const cutoff = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return cutoff.toISOString().split('T')[0];
}

/**
 * Verifica si un número de teléfono ya ha sido registrado en el padrón de pruebas gratuitas
 */
export function hasPhoneUsedTrial(
  rawPhone: string, 
  trialRecords: TrialRecord[], 
  existingPros: Professional[], 
  currentProId?: string
): { used: boolean; reason?: string; matchingRecord?: TrialRecord; matchingPro?: Professional } {
  const normalized = normalizePhoneNumber(rawPhone);
  if (!normalized || normalized.length < 6) {
    return { used: false };
  }

  // 1. Verificar en trialRecords
  const matchedRecord = trialRecords.find(r => {
    if (currentProId && r.proId === currentProId) return false;
    return r.normalizedPhone === normalized || normalizePhoneNumber(r.phone) === normalized;
  });

  if (matchedRecord) {
    return {
      used: true,
      reason: `El celular ${rawPhone} ya utilizó la prueba gratuita de 30 días para ${matchedRecord.name} (${matchedRecord.trade}).`,
      matchingRecord: matchedRecord
    };
  }

  // 2. Verificar en profesionales existentes
  const matchedPro = existingPros.find(p => {
    if (currentProId && p.id === currentProId) return false;
    const proNorm = p.phoneNormalized || normalizePhoneNumber(p.phone);
    return proNorm === normalized;
  });

  if (matchedPro) {
    return {
      used: true,
      reason: `El celular ${rawPhone} ya está registrado a nombre de ${matchedPro.name} (${matchedPro.trade}).`,
      matchingPro: matchedPro
    };
  }

  return { used: false };
}
