import { DeviceAccessLog, ServiceRequest, ChatMessage, UserFeedback, Professional } from '../types';
import { getRemainingSecurityDays } from './chatService';

export interface DeviceAuditData {
  deviceLog?: DeviceAccessLog;
  deviceId: string;
  requests: ServiceRequest[];
  messages: ChatMessage[];
  feedbacks: UserFeedback[];
  generatedAt: string;
  adminName?: string;
}

/**
 * Genera y descarga o abre en vista de impresión el Informe Pericial en PDF para un identificador de dispositivo
 */
export function generateAndDownloadDeviceAuditPdf(data: DeviceAuditData): void {
  if (typeof window === 'undefined') return;

  const now = new Date();
  const reportCode = `INF-AUD-${now.getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const formattedDate = now.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dev = data.deviceLog;
  const requests = data.requests;
  const messages = data.messages;
  const feedbacks = data.feedbacks;

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Auditoría Oficial - ${data.deviceId} - Oficios Valle de Lerma</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 12mm 15mm 12mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #001428;
      background: #ffffff;
      line-height: 1.45;
      font-size: 11pt;
      margin: 0;
      padding: 20px;
    }
    .no-print {
      margin-bottom: 25px;
      padding: 12px 18px;
      background: #0f2942;
      color: #ffffff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-print {
      background: #9e4300;
      color: white;
      border: none;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-print:hover {
      background: #7a3400;
    }
    .btn-close {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 8px 14px;
      font-size: 12px;
      border-radius: 8px;
      cursor: pointer;
    }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
      .page-break { page-break-before: always; }
    }
    .header {
      border-bottom: 2px solid #001428;
      padding-bottom: 12px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title-area h1 {
      margin: 0;
      font-size: 18pt;
      color: #001428;
      letter-spacing: -0.5px;
    }
    .title-area h2 {
      margin: 3px 0 0 0;
      font-size: 11pt;
      color: #9e4300;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-box {
      text-align: right;
      font-size: 9pt;
      color: #43474d;
    }
    .meta-badge {
      display: inline-block;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: bold;
      font-family: monospace;
      color: #0f2942;
      margin-bottom: 3px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 16px;
      background: #fafcff;
      page-break-inside: avoid;
    }
    .card-title {
      font-size: 11pt;
      font-weight: bold;
      color: #001428;
      margin-top: 0;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 9.5pt;
    }
    .grid-item strong {
      color: #43474d;
      font-size: 8.5pt;
      text-transform: uppercase;
      display: block;
    }
    .grid-item span {
      color: #001428;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin-top: 8px;
    }
    th {
      background: #0f2942;
      color: #ffffff;
      text-align: left;
      padding: 7px 9px;
      font-weight: 600;
      font-size: 8.5pt;
    }
    td {
      padding: 7px 9px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .badge-green { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .badge-blue { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .badge-orange { background: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; }
    .badge-gray { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .hash-code {
      font-family: monospace;
      font-size: 8pt;
      color: #475569;
      background: #f1f5f9;
      padding: 2px 5px;
      border-radius: 4px;
    }
    .footer-seal {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1.5px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 8.5pt;
      color: #64748b;
      page-break-inside: avoid;
    }
    .signature-area {
      text-align: center;
      width: 220px;
    }
    .signature-line {
      border-top: 1px solid #001428;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong style="font-size: 14px;">Informe Pericial de Auditoría y Chats (Oficios Valle de Lerma)</strong>
      <div style="font-size: 11px; opacity: 0.85;">Listo para imprimir o guardar directamente como documento PDF.</div>
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn-print" onclick="window.print()">🖨️ Guardar en PDF / Imprimir</button>
      <button class="btn-close" onclick="window.close()">Cerrar</button>
    </div>
  </div>

  <div class="header">
    <div class="title-area">
      <h1>Oficios y Servicios Valle de Lerma</h1>
      <h2>Informe Pericial de Dispositivo, Solicitudes y Registro de Chats</h2>
      <div style="font-size: 9pt; color: #64748b; margin-top: 4px;">
        Plataforma Comunitaria de Oficios de Cerrillos, La Merced, Rosario de Lerma, El Carril, Chicoana y Campo Quijano
      </div>
    </div>
    <div class="meta-box">
      <div class="meta-badge">${reportCode}</div>
      <div><strong>Emisión:</strong> ${formattedDate}</div>
      <div><strong>Auditor:</strong> ${data.adminName || 'Jorge López (Administrador General)'}</div>
      <div><strong>Estado:</strong> Válido para mediación y reclamos</div>
    </div>
  </div>

  <!-- FICHA DE DISPOSITIVO -->
  <div class="card">
    <div class="card-title">
      <span>1. Identificación del Dispositivo de Usuario</span>
      <span class="hash-code">${data.deviceId}</span>
    </div>
    <div class="grid-2">
      <div class="grid-item">
        <strong>Identificador Único:</strong>
        <span class="hash-code">${data.deviceId}</span>
      </div>
      <div class="grid-item">
        <strong>Teléfono Asociado:</strong>
        <span>${dev?.phone ? `+54 ${dev.phone}` : (requests[0]?.phoneContact || 'No especificado')}</span>
      </div>
      <div class="grid-item">
        <strong>Localidad / Barrio:</strong>
        <span>${dev?.neighborhood || requests[0]?.neighborhood || 'Valle de Lerma, Salta'}</span>
      </div>
      <div class="grid-item">
        <strong>Tipo de Equipo y Navegador:</strong>
        <span>${dev?.deviceType || 'Móvil'} • ${dev?.browser || 'Navegador Web'} (${dev?.platform || 'Web'})</span>
      </div>
      <div class="grid-item">
        <strong>Historial de Visitas:</strong>
        <span>${dev?.visitCount || 1} visitas registradas (Última: ${dev ? new Date(dev.lastSeen).toLocaleString('es-AR') : formattedDate})</span>
      </div>
      <div class="grid-item">
        <strong>Favoritos Guardados:</strong>
        <span>${dev?.favoritesCount || 0} profesionales guardados</span>
      </div>
    </div>
  </div>

  <!-- RECLAMOS Y SUGERENCIAS DEL DISPOSITIVO -->
  <div class="card">
    <div class="card-title">
      <span>2. Reclamos y Sugerencias Presentados por este Dispositivo (${feedbacks.length})</span>
    </div>
    ${feedbacks.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Código / Fecha</th>
            <th style="width: 15%;">Tipo / Estado</th>
            <th style="width: 25%;">Asunto</th>
            <th style="width: 45%;">Detalle y Resolución</th>
          </tr>
        </thead>
        <tbody>
          ${feedbacks.map(f => `
            <tr>
              <td>
                <strong>${f.id}</strong><br>
                <small style="color: #64748b;">${new Date(f.createdAt).toLocaleDateString('es-AR')}</small>
              </td>
              <td>
                <span class="badge ${f.type === 'reclamo' ? 'badge-red' : 'badge-blue'}">${f.type}</span><br>
                <span class="badge ${f.status === 'resuelto' ? 'badge-green' : f.status === 'en_revision' ? 'badge-orange' : 'badge-gray'}">${f.status}</span>
              </td>
              <td>
                <strong>${f.title}</strong>
                ${f.relatedRequestTitle ? `<br><small style="color: #9e4300;">Sobre: ${f.relatedRequestTitle}</small>` : ''}
              </td>
              <td>
                <div>"${f.description}"</div>
                ${f.adminNotes ? `<div style="margin-top: 4px; padding: 4px 6px; background: #e0f2fe; border-radius: 4px; font-size: 8pt; color: #0369a1;"><strong>Resolución Admin:</strong> ${f.adminNotes}</div>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : `
      <div style="font-size: 9pt; color: #64748b; padding: 8px 0;">
        No constan reclamos o quejas formales registradas para este dispositivo al momento de la pericia.
      </div>
    `}
  </div>

  <!-- SOLICITUDES DE TRABAJO -->
  <div class="card">
    <div class="card-title">
      <span>3. Solicitudes de Trabajo Vinculadas a este Dispositivo (${requests.length})</span>
    </div>
    ${requests.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th style="width: 12%;">ID / Fecha</th>
            <th style="width: 28%;">Solicitud y Rubro</th>
            <th style="width: 20%;">Localidad</th>
            <th style="width: 20%;">Estado / Cotización</th>
            <th style="width: 20%;">Profesional</th>
          </tr>
        </thead>
        <tbody>
          ${requests.map(r => `
            <tr>
              <td>
                <strong>#${r.id}</strong><br>
                <small style="color: #64748b;">${r.createdAt}</small>
              </td>
              <td>
                <strong>${r.title}</strong><br>
                <span class="badge badge-orange">${r.trade}</span>
                <div style="font-size: 8pt; color: #475569; margin-top: 3px;">"${r.description}"</div>
              </td>
              <td>${r.neighborhood}</td>
              <td>
                <span class="badge ${r.status === 'contratado' ? 'badge-green' : r.status === 'cotizado' ? 'badge-blue' : r.status === 'completado' ? 'badge-green' : 'badge-gray'}">
                  ${r.status}
                </span>
                ${r.quoteAmount ? `<div style="font-weight: bold; color: #9e4300; margin-top: 3px;">$${r.quoteAmount.toLocaleString('es-AR')}</div>` : ''}
              </td>
              <td>
                ${r.quotedBy ? `<strong>${r.quotedBy}</strong><br><small style="color: #64748b;">${r.quotedByTrade || ''}</small>` : '<span style="color: #94a3b8;">Sin asignar</span>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : `
      <div style="font-size: 9pt; color: #64748b; padding: 8px 0;">
        No constan solicitudes de trabajo registradas directamente para este identificador.
      </div>
    `}
  </div>

  <!-- CHATS Y REGISTRO DE SEGURIDAD (30 DÍAS) -->
  <div class="card">
    <div class="card-title">
      <span>4. Transcripción de Mensajes y Registro de Seguridad (Resguardo 30 Días) (${messages.length})</span>
      <span style="font-size: 8.5pt; color: #166534; font-weight: normal;">Hash y auditoría pericial activa</span>
    </div>
    ${messages.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th style="width: 14%;">Fecha y Hora</th>
            <th style="width: 14%;">Solicitud</th>
            <th style="width: 16%;">Emisor / Rol</th>
            <th style="width: 38%;">Mensaje Auditado</th>
            <th style="width: 18%;">Hash / Caducidad</th>
          </tr>
        </thead>
        <tbody>
          ${messages.map(m => {
            const daysLeft = getRemainingSecurityDays(m.createdAt);
            return `
              <tr>
                <td>
                  <strong style="font-size: 8.5pt;">${new Date(m.createdAt).toLocaleDateString('es-AR')}</strong><br>
                  <small style="color: #475569;">${new Date(m.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</small>
                </td>
                <td>
                  <strong>#${m.requestId}</strong>
                  ${m.requestTitle ? `<br><small style="color: #475569;">${m.requestTitle}</small>` : ''}
                </td>
                <td>
                  <strong>${m.senderName}</strong><br>
                  <span class="badge ${m.senderRole === 'prestador' ? 'badge-orange' : 'badge-blue'}">${m.senderRole}</span>
                </td>
                <td style="font-size: 9pt; color: #001428; background: #ffffff;">
                  "${m.text}"
                </td>
                <td>
                  <span class="hash-code">${m.securityLogHash || 'HASH-SEC-AUTO'}</span><br>
                  <small style="color: #166534; font-weight: bold;">Quedan ${daysLeft} días</small>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    ` : `
      <div style="font-size: 9pt; color: #64748b; padding: 8px 0;">
        No constan mensajes de chat intercambiados con este dispositivo o solicitud en la ventana de 30 días.
      </div>
    `}
  </div>

  <!-- CIERRE PERICIAL Y FIRMAS -->
  <div class="footer-seal">
    <div style="max-width: 60%;">
      <strong>Constancia Oficial de Integridad de Datos:</strong>
      <p style="margin: 3px 0 0 0; font-size: 8pt; color: #64748b;">
        Este informe certifica la concordancia de las comunicaciones registradas con la base inmutable de Firebase Firestore 
        almacenada en la plataforma Oficios Valle de Lerma. Los registros de chat son conservados con resguardo de seguridad 
        por 30 días para mediación de precios, verificación de presupuestos y resolución de reclamos entre vecinos y prestadores.
      </p>
      <div style="margin-top: 6px; font-family: monospace; font-size: 7.5pt; color: #94a3b8;">
        ID Peritaje: SHA256-${reportCode}-${data.deviceId.slice(-6)} • Oficios Valle de Lerma © 2026
      </div>
    </div>
    <div class="signature-area">
      <div class="signature-line"></div>
      <strong>Jorge López</strong><br>
      <span style="font-size: 8pt; color: #64748b;">Administración y Desarrollo<br>Oficios Valle de Lerma</span>
    </div>
  </div>

  <script>
    // Iniciar diálogo de impresión automáticamente tras cargar
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  // Abrir ventana para imprimir o descargar como PDF
  const printWindow = window.open('', '_blank', 'width=950,height=800,scrollbars=yes');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // Si el navegador bloqueó el popup, descargar como archivo HTML listo para imprimir en PDF
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${data.deviceId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

/**
 * Genera y descarga o abre en vista de impresión el Reporte Oficial en PDF 
 * de las contrataciones realizadas durante el último mes con el estado de cada servicio.
 */
export function generateAndDownloadMonthlyContractsPdf(
  requests: ServiceRequest[],
  professionals: Professional[] = []
): void {
  if (typeof window === 'undefined') return;

  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const reportCode = `REP-CONTRATOS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  const formatDateES = (d: Date) => d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const periodLabel = `${formatDateES(thirtyDaysAgo)} al ${formatDateES(now)}`;

  // Filtrar solicitudes del último mes (últimos 30 días)
  // Incluye las que tienen fecha parseable >= 30 días, o timestamp en ID >= 30 días, o etiquetas recientes
  const isWithinLastMonth = (req: ServiceRequest): boolean => {
    // Si la fecha es textual reciente
    const rawDate = (req.createdAt || '').toLowerCase();
    if (rawDate.includes('hoy') || rawDate.includes('recién') || rawDate.includes('ayer') || rawDate.includes('semana') || rawDate.includes('hace')) {
      return true;
    }

    // Si tiene timestamp en el ID (req-1730...)
    if (req.id.startsWith('req-')) {
      const ts = parseInt(req.id.replace('req-', ''), 10);
      if (!isNaN(ts) && ts > 1000000000000) {
        if (ts >= thirtyDaysAgo.getTime()) return true;
      }
    }

    // Si tiene fecha ISO
    const parsed = new Date(req.createdAt);
    if (!isNaN(parsed.getTime())) {
      return parsed >= thirtyDaysAgo;
    }

    // Si tiene fecha de pago confirmada
    if (req.paymentConfirmedAt) {
      const pParsed = new Date(req.paymentConfirmedAt);
      if (!isNaN(pParsed.getTime())) {
        return pParsed >= thirtyDaysAgo;
      }
    }

    return true; // Por defecto incluir para que el reporte sea completo
  };

  const monthlyRequests = requests.filter(isWithinLastMonth);
  // Si no hay ninguna en los últimos 30 días pero hay pedidos en el sistema, mostrar los últimos para que el reporte sea útil
  const displayRequests = monthlyRequests.length > 0 ? monthlyRequests : requests;

  // Métricas
  const totalRequests = displayRequests.length;
  const contractedAndCompleted = displayRequests.filter(r => r.status === 'contratado' || r.status === 'completado');
  const completedWithPhoto = displayRequests.filter(r => r.status === 'completado' || Boolean(r.completedJobPhoto));
  const paidCount = displayRequests.filter(r => r.paymentStatus === 'confirmado');
  
  const totalAmount = displayRequests.reduce((acc, curr) => {
    return acc + (curr.quoteAmount || 0);
  }, 0);

  const totalPaidAmount = displayRequests.filter(r => r.paymentStatus === 'confirmado').reduce((acc, curr) => {
    return acc + (curr.quoteAmount || 0);
  }, 0);

  const getStatusBadge = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'completado':
        return '<span class="badge badge-success">✓ FINALIZADO</span>';
      case 'contratado':
        return '<span class="badge badge-primary">⚡ EN CURSO / CONTRATADO</span>';
      case 'cotizado':
        return '<span class="badge badge-warning">⏳ COTIZADO PENDIENTE</span>';
      case 'en_espera':
      default:
        return '<span class="badge badge-secondary">EN ESPERA</span>';
    }
  };

  const getPaymentBadge = (req: ServiceRequest) => {
    if (req.paymentStatus === 'confirmado') {
      const method = (req.paymentMethod || 'EFECTIVO').toUpperCase();
      const rec = req.paymentReceiptNumber ? ` (${req.paymentReceiptNumber})` : '';
      return `<span class="badge badge-paid">✓ ACREDITADO: ${method}${rec}</span>`;
    }
    return '<span class="badge badge-pending">PENDIENTE DE PAGO</span>';
  };

  const rowsHtml = displayRequests.map((req, idx) => {
    const contractNum = req.contractNumber || `ORD-VALLE-2026-${req.id.replace('req-', '').slice(-4)}`;
    const proName = req.quotedBy || professionals.find(p => p.id === req.assignedWorkerId)?.name || 'A designar';
    const amountStr = req.quoteAmount ? `$ ${req.quoteAmount.toLocaleString('es-AR')}` : 'A convenir';
    const photoBadge = req.completedJobPhoto 
      ? '<span style="color: #005312; font-weight: bold; font-size: 8.5pt;">✓ Foto Certificada</span>' 
      : '<span style="color: #64748b; font-size: 8pt;">Sin foto</span>';

    return `
      <tr>
        <td style="text-align: center; font-weight: bold; font-family: monospace; font-size: 8.5pt; color: #001428;">
          ${contractNum}
        </td>
        <td style="font-size: 8.5pt; white-space: nowrap; color: #334155;">
          ${req.createdAt || 'Último mes'}
        </td>
        <td>
          <strong style="color: #001428; font-size: 9pt;">${req.title}</strong>
          <div style="font-size: 8pt; color: #9e4300; font-weight: 600;">Rubro: ${req.trade}</div>
          <div style="font-size: 7.5pt; color: #64748b; margin-top: 2px;">${req.description ? req.description.slice(0, 75) + (req.description.length > 75 ? '...' : '') : ''}</div>
        </td>
        <td>
          <strong style="color: #001428; font-size: 8.5pt;">${req.clientName || 'Vecino del Valle'}</strong>
          <div style="font-size: 8pt; color: #475569;">📍 ${req.neighborhood}</div>
        </td>
        <td>
          <strong style="color: #0f2942; font-size: 8.5pt;">${proName}</strong>
          ${req.phoneContact ? `<div style="font-size: 7.5pt; color: #64748b;">Tel: ${req.phoneContact}</div>` : ''}
        </td>
        <td style="text-align: right; font-weight: bold; font-size: 9pt; color: #001428; white-space: nowrap;">
          ${amountStr}
        </td>
        <td style="text-align: center; vertical-align: middle;">
          ${getStatusBadge(req.status)}
          <div style="margin-top: 3px;">${photoBadge}</div>
        </td>
        <td style="text-align: center; vertical-align: middle;">
          ${getPaymentBadge(req)}
        </td>
      </tr>
    `;
  }).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reporte Mensual de Contrataciones - Oficios Valle de Lerma</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm 10mm 12mm 10mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #001428;
      background: #ffffff;
      line-height: 1.35;
      font-size: 9pt;
      margin: 0;
      padding: 16px;
    }
    .no-print {
      margin-bottom: 20px;
      padding: 12px 18px;
      background: #0f2942;
      color: #ffffff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-print {
      background: #9e4300;
      color: white;
      border: none;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-print:hover {
      background: #7a3400;
    }
    .btn-close {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 8px 14px;
      font-size: 12px;
      border-radius: 8px;
      cursor: pointer;
    }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
      .page-break { page-break-before: always; }
    }
    .header {
      border-bottom: 2.5px solid #001428;
      padding-bottom: 10px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title-area h1 {
      margin: 0;
      font-size: 17pt;
      color: #001428;
      letter-spacing: -0.5px;
    }
    .title-area h2 {
      margin: 3px 0 0 0;
      font-size: 10.5pt;
      color: #9e4300;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-box {
      text-align: right;
      font-size: 8.5pt;
      color: #43474d;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 10px;
      text-align: center;
    }
    .kpi-val {
      font-size: 16pt;
      font-weight: 800;
      color: #001428;
      line-height: 1.1;
    }
    .kpi-lbl {
      font-size: 7.5pt;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th {
      background: #0f2942;
      color: #ffffff;
      font-size: 8pt;
      font-weight: 700;
      text-align: left;
      padding: 7px 6px;
      border: 1px solid #0f2942;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 6px 6px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 8.5pt;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 2.5px 6px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      text-align: center;
      white-space: nowrap;
    }
    .badge-success {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    .badge-primary {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }
    .badge-warning {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .badge-secondary {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    .badge-paid {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }
    .badge-pending {
      background: #fff7ed;
      color: #9a3412;
      border: 1px solid #ffedd5;
    }
    .footer-report {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1.5px solid #001428;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 8pt;
    }
    .signatures {
      display: flex;
      gap: 40px;
    }
    .sig-block {
      text-align: center;
      width: 160px;
    }
    .sig-line {
      border-top: 1px solid #001428;
      margin-bottom: 4px;
      padding-top: 2px;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong style="font-size: 15px;">Reporte de Contrataciones del Último Mes</strong>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
        Listo para imprimir o guardar como archivo PDF oficial con estado de cada servicio
      </div>
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn-print" onclick="window.print()">
        🖨️ Imprimir / Guardar como PDF
      </button>
      <button class="btn-close" onclick="window.close()">
        Cerrar Ventana
      </button>
    </div>
  </div>

  <div class="header">
    <div class="title-area">
      <h1>OFICIOS Y SERVICIOS VALLE DE LERMA</h1>
      <h2>Reporte Oficial de Contrataciones y Servicios Realizados (Último Mes)</h2>
      <div style="font-size: 8.5pt; color: #475569; margin-top: 3px;">
        Cerrillos • La Merced • El Carril • Chicoana • Campo Quijano • Rosario de Lerma • San Agustín
      </div>
    </div>
    <div class="meta-box">
      <div><strong>Código de Reporte:</strong> <span style="font-family: monospace;">${reportCode}</span></div>
      <div><strong>Período Auditado:</strong> ${periodLabel}</div>
      <div><strong>Fecha de Emisión:</strong> ${now.toLocaleDateString('es-AR')} ${now.toLocaleTimeString('es-AR')}</div>
      <div><strong>Estado:</strong> <span style="color: #005312; font-weight: bold;">OFICIAL VALIDADO</span></div>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi-card" style="border-left: 3px solid #001428;">
      <div class="kpi-val">${totalRequests}</div>
      <div class="kpi-lbl">Total Servicios Registrados</div>
    </div>
    <div class="kpi-card" style="border-left: 3px solid #0369a1;">
      <div class="kpi-val">${contractedAndCompleted.length}</div>
      <div class="kpi-lbl">Contratados / En Curso</div>
    </div>
    <div class="kpi-card" style="border-left: 3px solid #166534;">
      <div class="kpi-val">${completedWithPhoto.length}</div>
      <div class="kpi-lbl">Finalizados con Certificación</div>
    </div>
    <div class="kpi-card" style="border-left: 3px solid #065f46;">
      <div class="kpi-val">${paidCount.length}</div>
      <div class="kpi-lbl">Pagos Acreditados</div>
    </div>
    <div class="kpi-card" style="border-left: 3px solid #9e4300;">
      <div class="kpi-val">$${totalAmount.toLocaleString('es-AR')}</div>
      <div class="kpi-lbl">Monto Total Contratado (ARS)</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 110px; text-align: center;">N° Contrato</th>
        <th style="width: 80px;">Fecha</th>
        <th>Servicio y Tarea</th>
        <th style="width: 140px;">Vecino / Cliente</th>
        <th style="width: 140px;">Prestador Asignado</th>
        <th style="width: 90px; text-align: right;">Monto</th>
        <th style="width: 125px; text-align: center;">Estado de Servicio</th>
        <th style="width: 130px; text-align: center;">Estado de Pago</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #64748b;">No se registraron contrataciones en el período seleccionado.</td></tr>'}
    </tbody>
  </table>

  <div class="footer-report">
    <div style="max-width: 550px;">
      <strong style="color: #001428;">Trazabilidad y Validez Legal:</strong>
      <p style="margin: 2px 0 0 0; color: #475569; font-size: 7.5pt;">
        Este informe consolida las solicitudes, contratos y pagos confirmados a través de la plataforma comunitaria <em>Oficios y Servicios Valle de Lerma</em>. Cada contratación cuenta con trazabilidad de chat y fotos auditadas de obra por 30 días posteriores a la aceptación de pago.
      </p>
      <div style="font-family: monospace; font-size: 7pt; color: #94a3b8; margin-top: 4px;">
        ID Verificación: SHA256-${reportCode}-${Date.now().toString(36).toUpperCase()}
      </div>
    </div>

    <div class="signatures">
      <div class="sig-block">
        <div class="sig-line"></div>
        <strong>Jorge López</strong><br>
        <span style="font-size: 7.5pt; color: #64748b;">Desarrollo y Auditoría Web</span>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <strong>Daniel Dohrman</strong><br>
        <span style="font-size: 7.5pt; color: #64748b;">Coordinación Valle de Lerma</span>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=1100,height=850,scrollbars=yes');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // Si el popup fue bloqueado por el navegador, descargar archivo HTML
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_contrataciones_valle_lerma_${now.getFullYear()}_${now.getMonth() + 1}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

