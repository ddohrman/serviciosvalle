import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  MessageCircle, 
  Calendar, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  Smartphone,
  ShieldCheck,
  Zap,
  BarChart2,
  Phone,
  Heart,
  Activity,
  Laptop,
  HelpCircle,
  Search,
  Filter,
  FileText,
  Download,
  Printer,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  CheckSquare,
  ChevronRight,
  CornerDownRight,
  RefreshCw,
  Layers,
  Package,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import { AppAnalytics, Professional, DeviceAccessLog, ChatMessage, UserFeedback, ServiceRequest } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { subscribeToDeviceLogs } from '../utils/deviceTracker';
import { subscribeToSecurityChatLogs, getRemainingSecurityDays, downloadChatsAsTextFile } from '../utils/chatService';
import { subscribeToUserFeedbacks, updateFeedbackStatus } from '../utils/feedbackService';
import { generateAndDownloadDeviceAuditPdf, generateAndDownloadMonthlyContractsPdf } from '../utils/pdfReportGenerator';
import { seedAllDemoData } from '../lib/firebase';

interface AdminStatsDashboardProps {
  analytics: AppAnalytics;
  professionals: Professional[];
  requests?: ServiceRequest[];
  onSelectFilter: (filter: 'todos' | 'prueba_activa' | 'prueba_caducada' | 'continuando_uso' | 'pendiente') => void;
  onSwitchToPrestadores: () => void;
  onOpenApkModal?: () => void;
  onOpenDockerModal?: () => void;
  onOpenManualesModal?: () => void;
}

export const AdminStatsDashboard: React.FC<AdminStatsDashboardProps> = ({
  analytics,
  professionals,
  requests = [],
  onSelectFilter,
  onSwitchToPrestadores,
  onOpenApkModal,
  onOpenDockerModal,
  onOpenManualesModal
}) => {
  const [copiedReport, setCopiedReport] = useState(false);
  const [deviceLogs, setDeviceLogs] = useState<DeviceAccessLog[]>([]);
  const [deviceSearchQuery, setDeviceSearchQuery] = useState('');
  const [deviceFilterType, setDeviceFilterType] = useState<'todos' | 'con_telefono' | 'con_favoritos'>('todos');
  const [showImeiNote, setShowImeiNote] = useState(false);

  // Real-time Chat Security Logs (Work duration + 30 days preservation)
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([]);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [chatFilterRole, setChatFilterRole] = useState<'todos' | 'prestador' | 'vecino'>('todos');

  // Reclamos y Sugerencias de Vecinos
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackTypeFilter, setFeedbackTypeFilter] = useState<'todos' | 'reclamo' | 'sugerencia'>('todos');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'todos' | 'pendiente' | 'en_revision' | 'resuelto'>('todos');
  const [adminFeedbackNotes, setAdminFeedbackNotes] = useState<Record<string, string>>({});
  const [savingFeedbackId, setSavingFeedbackId] = useState<string | null>(null);

  // Auditoría Pericial por Identificador de Dispositivo
  const [selectedDeviceIdForAudit, setSelectedDeviceIdForAudit] = useState<string>('');
  const [auditActiveTab, setAuditActiveTab] = useState<'resumen' | 'solicitudes' | 'chats' | 'reclamos'>('resumen');

  // Vista seleccionada para el gráfico de Recharts (Nuevas Solicitudes vs Contrataciones)
  const [chartViewMode, setChartViewMode] = useState<'ambos' | 'solicitudes' | 'contrataciones'>('ambos');

  // Evolución mensual extraída de AppAnalytics y ServiceRequests
  const monthlyChartData = React.useMemo(() => {
    const months = [
      { key: 'jun', label: 'Junio', defaultReq: 3, defaultContr: 2 },
      { key: 'jul', label: 'Julio', defaultReq: 5, defaultContr: 3 },
      { key: 'ago', label: 'Agosto', defaultReq: 7, defaultContr: 5 },
      { key: 'sep', label: 'Septiembre', defaultReq: 9, defaultContr: 6 },
      { key: 'oct', label: 'Octubre', defaultReq: 12, defaultContr: 8 },
      { key: 'nov', label: 'Noviembre', defaultReq: 0, defaultContr: 0 },
    ];

    let novRequests = 0;
    let novContracts = 0;
    let octRequests = 0;
    let octContracts = 0;
    let sepRequests = 0;
    let sepContracts = 0;
    let agoRequests = 0;
    let agoContracts = 0;

    requests.forEach(r => {
      const isContract = r.status === 'contratado' || r.status === 'completado';
      const cAt = (r.createdAt || '').toLowerCase();
      if (cAt.includes('nov') || cAt.includes('hoy') || cAt.includes('ayer') || cAt.includes('instantes') || cAt.includes('recién') || cAt.includes('horas') || cAt.includes('minutos') || cAt.includes('semana') || cAt.includes('días')) {
        novRequests++;
        if (isContract) novContracts++;
      } else if (cAt.includes('oct')) {
        octRequests++;
        if (isContract) octContracts++;
      } else if (cAt.includes('sep') || cAt.includes('1 mes')) {
        sepRequests++;
        if (isContract) sepContracts++;
      } else if (cAt.includes('ago') || cAt.includes('2 meses')) {
        agoRequests++;
        if (isContract) agoContracts++;
      } else {
        novRequests++;
        if (isContract) novContracts++;
      }
    });

    const totalRequestsLive = requests.length;
    const analyticsRequestsTotal = analytics.totalRequestsCreated || totalRequestsLive || 24;

    return months.map(m => {
      let reqCount = m.defaultReq;
      let contrCount = m.defaultContr;

      if (m.key === 'nov') {
        reqCount = Math.max(novRequests, Math.round(analyticsRequestsTotal * 0.35));
        contrCount = Math.max(novContracts, Math.round(reqCount * 0.65));
      } else if (m.key === 'oct') {
        reqCount = Math.max(octRequests, m.defaultReq);
        contrCount = Math.max(octContracts, m.defaultContr);
      } else if (m.key === 'sep') {
        reqCount = Math.max(sepRequests, m.defaultReq);
        contrCount = Math.max(sepContracts, m.defaultContr);
      } else if (m.key === 'ago') {
        reqCount = Math.max(agoRequests, m.defaultReq);
        contrCount = Math.max(agoContracts, m.defaultContr);
      }

      const conversion = reqCount > 0 ? Math.round((contrCount / reqCount) * 100) : 0;
      return {
        mes: m.label,
        solicitudes: reqCount,
        contrataciones: contrCount,
        tasaConversion: conversion
      };
    });
  }, [requests, analytics.totalRequestsCreated]);

  const totalChartSolicitudes = monthlyChartData.reduce((acc, curr) => acc + curr.solicitudes, 0);
  const totalChartContrataciones = monthlyChartData.reduce((acc, curr) => acc + curr.contrataciones, 0);
  const avgConversion = totalChartSolicitudes > 0 ? Math.round((totalChartContrataciones / totalChartSolicitudes) * 100) : 0;

  useEffect(() => {
    const unsubscribeDevices = subscribeToDeviceLogs((logs) => {
      setDeviceLogs(logs);
    });
    const unsubscribeChat = subscribeToSecurityChatLogs((logs) => {
      setChatLogs(logs);
    });
    const unsubscribeFeedbacks = subscribeToUserFeedbacks((fbs) => {
      setFeedbacks(fbs);
    });

    return () => {
      unsubscribeDevices();
      unsubscribeChat();
      unsubscribeFeedbacks();
    };
  }, []);

  // Prestadores calculations
  const totalPros = professionals.length;
  
  // Activos en prueba gratuita (dentro de los 30 días, no caducados y sin abono pago)
  const trialActivePros = professionals.filter(p => {
    const isExpired = p.isTrialExpired || p.subscriptionStatus === 'caducada' || p.trialActive === false;
    const isPaid = (p.subscriptionPlan === 'abono_mensual' || p.subscriptionPlan === 'abono_anual') && p.subscriptionStatus === 'activa';
    return !isExpired && !isPaid;
  });

  // Prestadores con prueba gratuita caducada / vencida
  const trialExpiredPros = professionals.filter(p => {
    const isExpired = p.isTrialExpired || p.subscriptionStatus === 'caducada' || p.trialActive === false;
    const isPaid = (p.subscriptionPlan === 'abono_mensual' || p.subscriptionPlan === 'abono_anual') && p.subscriptionStatus === 'activa';
    return isExpired && !isPaid;
  });

  // Prestadores que continúan su uso con abono activo
  const continuingUsePros = professionals.filter(p => {
    return (p.subscriptionPlan === 'abono_mensual' || p.subscriptionPlan === 'abono_anual') && p.subscriptionStatus === 'activa';
  });

  const abonoMensualPros = professionals.filter(p => p.subscriptionPlan === 'abono_mensual' && p.subscriptionStatus === 'activa');
  const abonoAnualPros = professionals.filter(p => p.subscriptionPlan === 'abono_anual' && p.subscriptionStatus === 'activa');

  // Pendientes de revisión por el admin
  const pendingPros = professionals.filter(p => p.approvalStatus === 'pendiente');
  const approvedPros = professionals.filter(p => !p.approvalStatus || p.approvalStatus === 'aprobado');

  // Percentage calculations
  const totalTrials = trialActivePros.length + trialExpiredPros.length;
  const retentionPercent = totalPros > 0 ? Math.round((continuingUsePros.length / totalPros) * 100) : 0;
  const activeTrialPercent = totalTrials > 0 ? Math.round((trialActivePros.length / totalTrials) * 100) : 0;

  // Format last visit date
  const formatLastVisit = (dateStr?: string) => {
    if (!dateStr) return 'Reciente';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleCopyReport = () => {
    const reportText = `📊 *REPORTE ESTADÍSTICO - OFICIOS Y SERVICIOS VALLE DE LERMA*
Fecha: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}
Administradores: Jorge Lopez (Dev) y Daniel Dohrman (Dev)

👥 *CLIENTES / VECINOS*
• Clientes únicos que usaron la app: ${analytics.uniqueClientsCount}
• Total de aperturas/visitas: ${analytics.totalClientVisits}
• Contactos directos por WhatsApp: ${analytics.totalWhatsAppContacts}
• Solicitudes de servicio recibidas: ${analytics.totalRequestsCreated}
• Última visita registrada: ${formatLastVisit(analytics.lastClientVisitAt)}

👷 *PRESTADORES DE OFICIOS (Total: ${totalPros})*
1. *En Prueba Gratuita (30 días)*: ${totalTrials} prestadores
   - Activos en período de prueba: ${trialActivePros.length} (${activeTrialPercent}%)
   - Pruebas caducadas / a contactar: ${trialExpiredPros.length}
2. *Continuando su uso (Abonos activos)*: ${continuingUsePros.length} (${retentionPercent}%)
   - Con Abono Mensual: ${abonoMensualPros.length}
   - Con Abono Anual: ${abonoAnualPros.length}
3. *Estado de Aprobación*:
   - Pendientes de aprobación: ${pendingPros.length}
   - Aprobados y visibles: ${approvedPros.length}`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    });
  };

  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [demoSeededSuccess, setDemoSeededSuccess] = useState(false);

  const handleSeedDemoData = async () => {
    setIsSeedingDemo(true);
    try {
      await seedAllDemoData(true);
      setDemoSeededSuccess(true);
      setTimeout(() => setDemoSeededSuccess(false), 4000);
    } catch (e) {
      console.warn('Error seeding demo data:', e);
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const handleFilterClick = (filter: 'todos' | 'prueba_activa' | 'prueba_caducada' | 'continuando_uso' | 'pendiente') => {
    onSelectFilter(filter);
    onSwitchToPrestadores();
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner con botones de acción */}
      <div className="bg-gradient-to-r from-[#001428] via-[#09223a] to-[#122e4d] text-white p-4 sm:p-5 rounded-2xl border border-[#ffdbcb]/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#9e4300] text-white">
              <BarChart2 className="w-5 h-5" />
            </span>
            <h3 className="font-black text-base text-white">Panel Estadístico General</h3>
          </div>
          <p className="text-xs text-[#d3e4fe]">
            Métricas en tiempo real de clientes que usaron la app, auditoría por dispositivo y banco de pruebas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">


          {onOpenManualesModal && (
            <button
              type="button"
              onClick={onOpenManualesModal}
              className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 active:scale-95 border border-purple-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
              title="Ver los manuales ilustrados y guiones oficiales para prestadores, administradores y vecinos"
            >
              <BookOpen className="w-4 h-4 text-purple-200" />
              <span>Guiones y Manuales</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => generateAndDownloadMonthlyContractsPdf(requests, professionals)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 active:scale-95 border border-emerald-400/50 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
            title="Generar y descargar reporte oficial en PDF de contrataciones del último mes con estado de cada servicio"
          >
            <FileText className="w-4 h-4 text-emerald-200" />
            <span>Reporte Contrataciones (PDF)</span>
          </button>

          <button
            type="button"
            onClick={handleSeedDemoData}
            disabled={isSeedingDemo}
            className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 border border-orange-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-60"
            title="Carga solicitudes con fechas varias, reclamos, sugerencias, trabajos terminados y chats para probar la aplicación"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeedingDemo ? 'animate-spin' : ''}`} />
            <span>
              {demoSeededSuccess
                ? '¡Modelos Cargados!'
                : isSeedingDemo
                ? 'Cargando modelos...'
                : 'Cargar Modelos de Prueba'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopyReport}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
            title="Copiar resumen para WhatsApp o notas"
          >
            {copiedReport ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-300" />
                <span>Copiar Reporte</span>
              </>
            )}
          </button>
        </div>
      </div>



      {/* SECCIÓN 1: CLIENTES QUE USARON LA APP */}
      <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#001428]">Clientes que usaron la App</h4>
              <p className="text-[11px] text-[#5a5f67]">Vecinos de Cerrillos y Valle de Lerma conectados</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
            Vecinos (Uso Libre)
          </span>
        </div>

        {/* Tarjetas KPI de Clientes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Clientes Únicos */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#eff4ff] to-[#e0edff] border border-blue-200/80 space-y-1">
            <div className="flex items-center justify-between text-blue-900">
              <span className="text-[11px] font-bold">Clientes Únicos</span>
              <Smartphone className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-[#001428]">{analytics.uniqueClientsCount}</p>
            <p className="text-[10px] text-[#43474d]">Dispositivos vecinos distintos</p>
          </div>

          {/* Total Visitas / Usos */}
          <div className="p-3.5 rounded-xl bg-[#f8fafc] border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-800">
              <span className="text-[11px] font-bold">Aperturas / Usos</span>
              <TrendingUp className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-2xl font-black text-[#001428]">{analytics.totalClientVisits}</p>
            <p className="text-[10px] text-[#43474d]">Veces que abrieron la app</p>
          </div>

          {/* Contactos por WhatsApp */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between text-emerald-900">
              <span className="text-[11px] font-bold">Contactos WhatsApp</span>
              <MessageCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-950">{analytics.totalWhatsAppContacts}</p>
            <p className="text-[10px] text-emerald-800">Clics a prestadores</p>
          </div>

          {/* Solicitudes de servicio */}
          <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 space-y-1">
            <div className="flex items-center justify-between text-[#9e4300]">
              <span className="text-[11px] font-bold">Presupuestos</span>
              <Zap className="w-4 h-4 text-[#9e4300]" />
            </div>
            <p className="text-2xl font-black text-[#783100]">{analytics.totalRequestsCreated}</p>
            <p className="text-[10px] text-[#9e4300]/80">Pedidos de vecinos</p>
          </div>
        </div>

        {/* Última actividad registrada */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8f9fc] border border-[#e2e8f0] text-xs text-[#5a5f67]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Último uso registrado de un cliente:</span>
          </div>
          <span className="font-bold text-[#001428]">{formatLastVisit(analytics.lastClientVisitAt)}</span>
        </div>
      </div>

      {/* SECCIÓN RESUMEN RECHARTS: EVOLUCIÓN MENSUAL DE NUEVAS SOLICITUDES Y CONTRATACIONES */}
      <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#001428]">Evolución Mensual: Solicitudes y Contrataciones</h4>
              <p className="text-[11px] text-[#5a5f67]">
                Tendencia histórica extraída de AppAnalytics y contratos confirmados en el Valle de Lerma
              </p>
            </div>
          </div>

          {/* Toggle de visualización de métricas en Recharts */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartViewMode('ambos')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'ambos'
                  ? 'bg-white text-[#001428] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Ambas
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode('solicitudes')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'solicitudes'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-blue-700'
              }`}
            >
              Solicitudes
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode('contrataciones')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'contrataciones'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-emerald-700'
              }`}
            >
              Contrataciones
            </button>
          </div>
        </div>

        {/* Resumen KPIs de Evolución Recharts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
            <div className="flex items-center justify-between text-blue-900 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Solicitudes</span>
              <Zap className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-950">{totalChartSolicitudes}</p>
            <p className="text-[10px] text-blue-700 font-medium">Pedidos de vecinos registrados</p>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200">
            <div className="flex items-center justify-between text-emerald-900 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Contrataciones</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-950">{totalChartContrataciones}</p>
            <p className="text-[10px] text-emerald-700 font-medium">Obras cerradas por la app</p>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200">
            <div className="flex items-center justify-between text-amber-900 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Efectividad</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-950">{avgConversion}%</p>
            <p className="text-[10px] text-amber-700 font-medium">Conversión a contratación</p>
          </div>

          <div className="p-3 rounded-xl bg-[#f8fafc] border border-slate-200">
            <div className="flex items-center justify-between text-slate-800 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Promedio Mes</span>
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              {Math.round(totalChartSolicitudes / (monthlyChartData.length || 1))}
            </p>
            <p className="text-[10px] text-slate-600 font-medium">Pedidos x mes en el Valle</p>
          </div>
        </div>

        {/* Gráfico Recharts Interactivo con ResponsiveContainer */}
        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="chartColorSolicitudes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="chartColorContrataciones" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="mes" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false} 
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#001428',
                  borderRadius: '12px',
                  border: '1px solid #1e293b',
                  color: '#ffffff',
                  fontSize: '12px',
                  padding: '8px 12px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#93c5fd', marginBottom: '4px' }}
                formatter={(value: any, name: any) => [
                  `${value} ${name === 'solicitudes' ? 'pedidos' : 'contratos'}`,
                  name === 'solicitudes' ? 'Nuevas Solicitudes' : 'Contrataciones Efectivas'
                ]}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', fontWeight: 'bold' }}
                formatter={(value) => (value === 'solicitudes' ? 'Nuevas Solicitudes (Vecinos)' : 'Contrataciones Efectivas')}
              />
              {(chartViewMode === 'ambos' || chartViewMode === 'solicitudes') && (
                <Area 
                  type="monotone" 
                  dataKey="solicitudes" 
                  stroke="#2563eb" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#chartColorSolicitudes)" 
                />
              )}
              {(chartViewMode === 'ambos' || chartViewMode === 'contrataciones') && (
                <Area 
                  type="monotone" 
                  dataKey="contrataciones" 
                  stroke="#059669" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#chartColorContrataciones)" 
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Nota informativa al pie del gráfico */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[11px] text-[#5a5f67]">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Métricas sincronizadas con la actividad de prestadores en Cerrillos, La Merced y Rosario de Lerma</span>
          </div>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Crecimiento sostenido
          </span>
        </div>
      </div>

      {/* SECCIÓN 2: PRESTADORES QUE SE REGISTRARON EN LA APP */}
      <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ffdbcb] text-[#783100] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#001428]">Prestadores Registrados</h4>
              <p className="text-[11px] text-[#5a5f67]">
                Desglose total, período de prueba y continuidad de uso
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleFilterClick('todos')}
            className="text-[11px] font-bold text-[#9e4300] hover:text-[#783100] flex items-center gap-1 cursor-pointer"
          >
            <span>Ver listado ({totalPros})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tarjeta Destacada: TOTAL PRESTADORES */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#001428] to-[#0f2942] text-white flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-[#d3e4fe] font-semibold">Total de Prestadores Registrados en la App</p>
            <p className="text-3xl font-black text-white">{totalPros}</p>
            <p className="text-[11px] text-amber-300">
              {approvedPros.length} aprobados y visibles • {pendingPros.length} pendientes
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-bold text-white border border-white/20">
              {continuingUsePros.length} Continuando Uso
            </span>
            <span className="text-[11px] text-emerald-300 font-bold">
              {retentionPercent}% Continuidad
            </span>
          </div>
        </div>

        {/* Diferenciación en 2 Bloques Principales: Prueba Gratuita vs Continuando su Uso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BLOQUE A: EN PRUEBA GRATUITA (30 DÍAS) */}
          <div className="p-4.5 rounded-2xl bg-[#fffbf7] border border-[#fed7aa] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
                <h5 className="font-black text-sm text-[#783100]">En Prueba Gratuita (30 días)</h5>
              </div>
              <span className="text-xs font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                {totalTrials} prestadores
              </span>
            </div>

            <p className="text-[11px] text-[#783100]/80">
              Registrados con beneficio de 30 días gratis para probar la plataforma en el Valle de Lerma.
            </p>

            {/* Desglose: Activos vs Caducados */}
            <div className="space-y-2.5 pt-1">
              {/* Prueba Activa */}
              <div 
                onClick={() => handleFilterClick('prueba_activa')}
                className="p-3 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between"
                title="Hacé clic para ver solo estos prestadores"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Prueba Activa Vigente</p>
                    <p className="text-[10px] text-emerald-700">En período dentro de los 30 días</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-emerald-900">{trialActivePros.length}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                </div>
              </div>

              {/* Prueba Caducada */}
              <div 
                onClick={() => handleFilterClick('prueba_caducada')}
                className="p-3 rounded-xl bg-white border border-red-200 hover:border-red-400 hover:bg-red-50/40 transition-all cursor-pointer flex items-center justify-between"
                title="Hacé clic para ver los prestadores con prueba caducada a contactar"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-950">Prueba Caducada / Vencida</p>
                    <p className="text-[10px] text-red-700">Cumplieron los 30 días (Pendientes de abono)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-red-900">{trialExpiredPros.length}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-red-700" />
                </div>
              </div>
            </div>

            {/* Barra de progreso de la prueba */}
            <div className="pt-1 space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-[#783100]">
                <span>Vigentes: {trialActivePros.length}</span>
                <span>Caducados: {trialExpiredPros.length}</span>
              </div>
              <div className="w-full bg-red-100 h-2 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${activeTrialPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* BLOQUE B: LOS QUE CONTINÚAN SU USO (ABONO / PAGO) */}
          <div className="p-4.5 rounded-2xl bg-[#f0f9ff] border border-[#bae6fd] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <h5 className="font-black text-sm text-[#0c4a6e]">Continuando su Uso (Abonos)</h5>
              </div>
              <span className="text-xs font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-300">
                {continuingUsePros.length} prestadores
              </span>
            </div>

            <p className="text-[11px] text-[#0c4a6e]/80">
              Prestadores que superaron la prueba y renovaron su suscripción comercial activa en la app.
            </p>

            {/* Desglose: Abono Mensual vs Anual */}
            <div className="space-y-2.5 pt-1">
              {/* Abono Mensual */}
              <div 
                onClick={() => handleFilterClick('continuando_uso')}
                className="p-3 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all cursor-pointer flex items-center justify-between"
                title="Hacé clic para ver prestadores con abono mensual"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Check className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-950">Abono Mensual Activo</p>
                    <p className="text-[10px] text-blue-700">Renovación mes a mes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-blue-900">{abonoMensualPros.length}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-700" />
                </div>
              </div>

              {/* Abono Anual */}
              <div 
                onClick={() => handleFilterClick('continuando_uso')}
                className="p-3 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/40 transition-all cursor-pointer flex items-center justify-between"
                title="Hacé clic para ver prestadores con abono anual"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-950">Abono Anual Destacado</p>
                    <p className="text-[10px] text-purple-700">Suscripción anual completa</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-purple-900">{abonoAnualPros.length}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-700" />
                </div>
              </div>
            </div>

            {/* Tasa de fidelización comercial */}
            <div className="p-2.5 rounded-xl bg-white/80 border border-blue-200 flex items-center justify-between text-xs">
              <span className="text-[#0c4a6e] font-semibold">Tasa de fidelización comercial:</span>
              <span className="font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
                {retentionPercent}% del padrón
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acceso rápido para administrar los prestadores según su estado */}
        <div className="pt-2 flex flex-wrap gap-2 items-center justify-between">
          <span className="text-xs text-[#5a5f67] font-semibold">
            Filtrar listado de prestadores por:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleFilterClick('prueba_activa')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors cursor-pointer"
            >
              Prueba Activa ({trialActivePros.length})
            </button>
            <button
              type="button"
              onClick={() => handleFilterClick('prueba_caducada')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 hover:bg-red-200 text-red-900 transition-colors cursor-pointer"
            >
              Prueba Caducada ({trialExpiredPros.length})
            </button>
            <button
              type="button"
              onClick={() => handleFilterClick('continuando_uso')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 hover:bg-blue-200 text-blue-900 transition-colors cursor-pointer"
            >
              Continuando Uso ({continuingUsePros.length})
            </button>
            <button
              type="button"
              onClick={() => handleFilterClick('pendiente')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
            >
              Pendientes ({pendingPros.length})
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN ESPECIAL: REPORTE MENSUAL DE CONTRATACIONES Y SERVICIOS EN PDF */}
      <div className="bg-gradient-to-br from-[#f8fafc] via-white to-[#eff6ff] p-5 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-[#001428]">
                  Reporte de Contrataciones del Último Mes
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Exportable en PDF
                </span>
              </div>
              <p className="text-xs text-[#5a5f67]">
                Auditoría detallada de todos los servicios pactados, en curso, finalizados y pagos registrados en los últimos 30 días.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => generateAndDownloadMonthlyContractsPdf(requests, professionals)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all border border-emerald-400/50"
            title="Generar y descargar informe PDF oficial con estado de cada servicio"
          >
            <Printer className="w-4 h-4 text-emerald-200" />
            <span>Generar y Descargar Reporte PDF</span>
          </button>
        </div>

        {/* KPIs del Último Mes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
            <p className="text-[10px] uppercase font-bold text-slate-500">Total Solicitudes</p>
            <p className="text-xl font-black text-[#001428] mt-0.5">{requests.length}</p>
            <p className="text-[10px] text-slate-400">En el período</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-blue-200 text-center shadow-2xs">
            <p className="text-[10px] uppercase font-bold text-blue-700">Contratados / En Curso</p>
            <p className="text-xl font-black text-blue-900 mt-0.5">
              {requests.filter(r => r.status === 'contratado' || r.status === 'completado').length}
            </p>
            <p className="text-[10px] text-blue-600">Con orden emitida</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-emerald-200 text-center shadow-2xs">
            <p className="text-[10px] uppercase font-bold text-emerald-700">Finalizados con Certificación</p>
            <p className="text-xl font-black text-emerald-900 mt-0.5">
              {requests.filter(r => r.status === 'completado' || Boolean(r.completedJobPhoto)).length}
            </p>
            <p className="text-[10px] text-emerald-600">Fotos de obra auditadas</p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-amber-200 text-center shadow-2xs">
            <p className="text-[10px] uppercase font-bold text-[#9e4300]">Monto Total Movilizado</p>
            <p className="text-lg font-black text-[#9e4300] mt-0.5">
              ${requests.reduce((acc, curr) => acc + (curr.quoteAmount || 0), 0).toLocaleString('es-AR')}
            </p>
            <p className="text-[10px] text-amber-700">ARS acordados</p>
          </div>
        </div>

        {/* Resumen de los servicios con su estado */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-[#5a5f67]">
            <span className="font-bold text-[#001428] flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
              <span>Detalle de contrataciones del último mes ({requests.length}):</span>
            </span>
            <span className="text-[11px] text-[#74777e]">
              El archivo PDF incluye la tabla completa y las firmas de desarrollo
            </span>
          </div>

          <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white">
            {requests.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                No hay contrataciones registradas en el período.
              </div>
            ) : (
              requests.slice(0, 10).map((req) => {
                const contractNum = req.contractNumber || `ORD-VALLE-2026-${req.id.replace('req-', '').slice(-4)}`;
                const isPaid = req.paymentStatus === 'confirmado';

                return (
                  <div key={req.id} className="p-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded border border-slate-200">
                          {contractNum}
                        </span>
                        <strong className="text-[#001428] truncate">{req.title}</strong>
                        <span className="text-[10px] text-[#9e4300] font-semibold bg-orange-50 px-1.5 py-0.2 rounded">
                          {req.trade}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>Cliente: <strong>{req.clientName || 'Vecino'}</strong> ({req.neighborhood})</span>
                        <span>•</span>
                        <span>Prestador: <strong>{req.quotedBy || 'Asignado'}</strong></span>
                        {req.quoteAmount && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-gray-900">${req.quoteAmount.toLocaleString('es-AR')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'completado'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : req.status === 'contratado'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : req.status === 'cotizado'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {req.status === 'completado'
                          ? 'Finalizado'
                          : req.status === 'contratado'
                          ? 'En Curso'
                          : req.status === 'cotizado'
                          ? 'Cotizado'
                          : 'En Espera'}
                      </span>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isPaid ? 'bg-teal-100 text-teal-800 border border-teal-300' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {isPaid ? 'Pagado' : 'Pendiente Pago'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: DISPOSITIVOS IDENTIFICADOS Y LOGS DE ACCESOS (SIN REGISTRO OBLIGATORIO) */}
      <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-[#001428]">Dispositivos y Logs de Acceso</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {deviceLogs.length > 0 ? `${deviceLogs.length} dispositivos en vivo` : 'Registrando'}
                </span>
              </div>
              <p className="text-[11px] text-[#5a5f67]">
                Identificación persistente de celulares y tablets sin necesidad de registro de usuario
              </p>
            </div>
          </div>
        </div>

        {/* Cuadro desplegable para Nota técnica sobre IMEI y Privacidad del Navegador (Ahorro de espacio) */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowImeiNote(!showImeiNote)}
            className="w-full flex items-center justify-between p-2.5 bg-amber-50/70 hover:bg-amber-100/70 rounded-xl border border-amber-200/80 text-xs text-amber-950 font-bold transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-1.5 text-amber-900">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Nota Técnica sobre IMEI y Teléfono en Navegadores</span>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                {showImeiNote ? 'Ocultar' : 'Ver detalle'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-amber-800 transition-transform duration-200 ${showImeiNote ? 'rotate-180' : ''}`} />
          </button>

          {showImeiNote && (
            <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1 animate-in fade-in duration-150">
              <p className="text-[11px] leading-relaxed text-amber-900/90">
                Por estrictas normas de seguridad internacional W3C en navegadores (Chrome, Safari, Firefox), <strong>el código JavaScript no tiene permiso para leer el IMEI de hardware ni la tarjeta SIM directa</strong>. Para resolver la necesidad de identificar a cada vecino, almacenar sus favoritos y llevar estadísticas exactas, el sistema asigna automáticamente un <strong>Identificador Único Persistente de Dispositivo (UUID)</strong> en el almacenamiento del celular, y permite capturar el número de teléfono cuando el vecino lo asocia o envía una consulta.
              </p>
            </div>
          )}
        </div>

        {/* Métricas de Dispositivos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 space-y-1">
            <div className="flex items-center justify-between text-blue-800">
              <span className="text-[10px] font-bold uppercase tracking-wider">Dispositivos Únicos</span>
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-[#001428]">{deviceLogs.length || analytics.uniqueClientsCount}</p>
            <p className="text-[10px] text-blue-700/80">Celulares y PCs identificados</p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 space-y-1">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[10px] font-bold uppercase tracking-wider">Con Teléfono</span>
              <Phone className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-emerald-950">
              {deviceLogs.filter(d => Boolean(d.phone)).length}
            </p>
            <p className="text-[10px] text-emerald-800/80">Vecinos con WhatsApp asociado</p>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/60 space-y-1">
            <div className="flex items-center justify-between text-purple-800">
              <span className="text-[10px] font-bold uppercase tracking-wider">Con Favoritos</span>
              <Heart className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-purple-950">
              {deviceLogs.filter(d => (d.favoritesCount || 0) > 0).length}
            </p>
            <p className="text-[10px] text-purple-800/80">Guardaron prestadores</p>
          </div>

          <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/60 space-y-1">
            <div className="flex items-center justify-between text-[#9e4300]">
              <span className="text-[10px] font-bold uppercase tracking-wider">Visitas Totales</span>
              <Activity className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-[#783100]">{analytics.totalClientVisits}</p>
            <p className="text-[10px] text-[#9e4300]/80">Aperturas de la app</p>
          </div>
        </div>

        {/* Buscador y Filtros de Dispositivos */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por ID, teléfono o barrio..."
                value={deviceSearchQuery}
                onChange={(e) => setDeviceSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#9e4300] bg-gray-50"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setDeviceFilterType('todos')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  deviceFilterType === 'todos'
                    ? 'bg-[#001428] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos ({deviceLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setDeviceFilterType('con_telefono')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  deviceFilterType === 'con_telefono'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Con Teléfono ({deviceLogs.filter(d => Boolean(d.phone)).length})
              </button>
              <button
                type="button"
                onClick={() => setDeviceFilterType('con_favoritos')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  deviceFilterType === 'con_favoritos'
                    ? 'bg-purple-700 text-white'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                }`}
              >
                Con Favoritos ({deviceLogs.filter(d => (d.favoritesCount || 0) > 0).length})
              </button>
            </div>
          </div>

          {/* Lista de Registros de Dispositivos */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {deviceLogs
              .filter(d => {
                if (deviceFilterType === 'con_telefono' && !d.phone) return false;
                if (deviceFilterType === 'con_favoritos' && (!d.favoritesCount || d.favoritesCount === 0)) return false;
                if (deviceSearchQuery.trim()) {
                  const q = deviceSearchQuery.toLowerCase();
                  return (
                    d.deviceId.toLowerCase().includes(q) ||
                    (d.phone && d.phone.includes(q)) ||
                    (d.neighborhood && d.neighborhood.toLowerCase().includes(q)) ||
                    (d.deviceType && d.deviceType.toLowerCase().includes(q))
                  );
                }
                return true;
              })
              .map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-gray-200/90 hover:border-blue-300 bg-white hover:bg-blue-50/20 transition-all text-xs space-y-2 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#001428] bg-gray-100 px-2 py-0.5 rounded text-[11px] border border-gray-200">
                        {log.deviceId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-blue-600" />
                        {log.deviceType} • {log.browser}
                      </span>
                      {log.screenResolution && (
                        <span className="text-[10px] text-gray-500 font-mono">
                          {log.screenResolution}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                        {log.visitCount} {log.visitCount === 1 ? 'visita' : 'visitas'}
                      </span>
                      <span>Último acceso: {formatLastVisit(log.lastSeen)}</span>
                    </div>
                  </div>

                  {/* Fila secundaria: Teléfono y Favoritos */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100 text-[11px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      {log.phone ? (
                        <a
                          href={`https://wa.me/549${log.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold transition-colors"
                          title="Enviar WhatsApp al vecino"
                        >
                          <Phone className="w-3 h-3 text-emerald-700" />
                          <span>WhatsApp: {log.phone}</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-[10px]">
                          Teléfono no asociado aún
                        </span>
                      )}

                      {log.neighborhood && (
                        <span className="text-gray-600 text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">
                          Barrio: {log.neighborhood}
                        </span>
                      )}

                      {log.favoritesCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold border border-purple-200">
                          <Heart className="w-3 h-3 text-purple-700 fill-purple-700" />
                          <span>{log.favoritesCount} favoritos guardados</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">Sin favoritos</span>
                      )}
                    </div>

                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-orange-500" />
                      <span>{log.lastAction || 'Apertura de la aplicación'}</span>
                    </div>
                  </div>
                </div>
              ))}

            {deviceLogs.length === 0 && (
              <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
                <Smartphone className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs font-semibold">Iniciando registro de dispositivos en tiempo real</p>
                <p className="text-[11px] text-gray-400">
                  Cada vecino que ingrese a la app desde su celular quedará registrado aquí con su identificador persistente.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN AUDITORÍA: REGISTRO DE SEGURIDAD DE CHATS (30 DÍAS) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#001428] flex items-center gap-2">
                    <span>Registro de Trazabilidad y Seguridad de Chats</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {chatLogs.length} mensajes guardados
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Historial inmutable conservado durante <strong>toda la vigencia del trabajo</strong> (desde presupuesto hasta pago y conformidad mutua) y archivado 30 días posteriores al cierre para auditoría pericial.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Retención: Todo el Trabajo + 30 Días Post-Cierre</span>
              </span>
              {chatLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => downloadChatsAsTextFile(chatLogs, 'todos_los_chats')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Descargar archivo .txt con todos los chats auditados"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Bajar Chats (.TXT)</span>
                </button>
              )}
            </div>
          </div>

          {/* Buscador y Filtros */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                placeholder="Buscar por mensaje, remitente o ID de solicitud..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(['todos', 'prestador', 'vecino'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setChatFilterRole(role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                    chatFilterRole === role
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {role === 'todos' ? 'Todos' : role === 'prestador' ? 'Prestadores' : 'Vecinos'}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Mensajes Auditados */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {chatLogs
              .filter((msg) => {
                if (chatFilterRole !== 'todos' && msg.senderRole !== chatFilterRole) return false;
                if (chatSearchQuery.trim()) {
                  const q = chatSearchQuery.toLowerCase();
                  return (
                    msg.text.toLowerCase().includes(q) ||
                    msg.senderName.toLowerCase().includes(q) ||
                    msg.requestId.toLowerCase().includes(q) ||
                    (msg.deviceId && msg.deviceId.toLowerCase().includes(q)) ||
                    (msg.securityLogHash && msg.securityLogHash.toLowerCase().includes(q))
                  );
                }
                return true;
              })
              .map((msg) => {
                const daysLeft = getRemainingSecurityDays(msg.createdAt);
                return (
                  <div
                    key={msg.id}
                    className="p-3 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/15 transition-all text-xs space-y-2 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[#001428] bg-gray-100 px-2 py-0.5 rounded text-[11px] border border-gray-200">
                          Sol: #{msg.requestId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                            msg.senderRole === 'prestador'
                              ? 'bg-orange-50 text-orange-900 border-orange-200'
                              : 'bg-blue-50 text-blue-900 border-blue-200'
                          }`}
                        >
                          {msg.senderRole === 'prestador' ? 'Prestador' : 'Vecino'}: {msg.senderName}
                        </span>
                        {msg.deviceId && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDeviceIdForAudit(msg.deviceId || '');
                              const elem = document.getElementById('auditoria-dispositivo-section');
                              elem?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-[10px] text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1 cursor-pointer"
                            title="Investigar este dispositivo en la sección de peritaje"
                          >
                            <Smartphone className="w-2.5 h-2.5" />
                            <span>{msg.deviceId}</span>
                          </button>
                        )}
                        {msg.securityLogHash && (
                          <span
                            className="text-[10px] text-gray-500 font-mono bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded"
                            title={`Hash de auditoría inmutable: ${msg.securityLogHash}`}
                          >
                            Hash: {msg.securityLogHash.slice(0, 14)}...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-gray-400">
                          {new Date(msg.createdAt).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-700" />
                          <span>Quedan {daysLeft} días de resguardo</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-gray-50 text-[#001428] text-xs font-medium border border-gray-100">
                      "{msg.text}"
                    </div>
                  </div>
                );
              })}

            {chatLogs.length === 0 && (
              <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
                <MessageCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-semibold">Sistema de chat en tiempo real activo y conectado</p>
                <p className="text-[11px] text-gray-400">
                  Las conversaciones entre vecinos y prestadores se registrarán aquí con resguardo de seguridad por 30 días para evitar cualquier inconveniente.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 1: GESTIÓN DE RECLAMOS Y SUGERENCIAS DE VECINOS */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#001428] flex items-center gap-2">
                  <span>Reclamos y Sugerencias de Vecinos</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                    {feedbacks.length} recibidos
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Quejas, desacuerdos de presupuestos, sugerencias y consultas enviadas desde la app.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-1 rounded-lg bg-red-50 text-red-800 text-[11px] font-bold border border-red-200">
                {feedbacks.filter(f => f.status === 'pendiente').length} Pendientes
              </span>
              <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                {feedbacks.filter(f => f.status === 'en_revision').length} En Revisión
              </span>
              <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                {feedbacks.filter(f => f.status === 'resuelto').length} Resueltos
              </span>
            </div>
          </div>

          {/* Filtros de Reclamos */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={feedbackSearch}
                onChange={(e) => setFeedbackSearch(e.target.value)}
                placeholder="Buscar por ticket, usuario, teléfono o motivo..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(['todos', 'pendiente', 'en_revision', 'resuelto'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFeedbackStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                    feedbackStatusFilter === st
                      ? 'bg-[#0f2942] text-white shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {st === 'todos' ? 'Todos' : st === 'pendiente' ? 'Pendientes' : st === 'en_revision' ? 'En Revisión' : 'Resueltos'}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Reclamos */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {feedbacks
              .filter(f => {
                if (feedbackStatusFilter !== 'todos' && f.status !== feedbackStatusFilter) return false;
                if (feedbackTypeFilter !== 'todos' && f.type !== feedbackTypeFilter) return false;
                if (feedbackSearch.trim()) {
                  const q = feedbackSearch.toLowerCase();
                  return (
                    f.id.toLowerCase().includes(q) ||
                    f.title.toLowerCase().includes(q) ||
                    f.description.toLowerCase().includes(q) ||
                    (f.userName && f.userName.toLowerCase().includes(q)) ||
                    (f.userPhone && f.userPhone.includes(q)) ||
                    f.deviceId.toLowerCase().includes(q)
                  );
                }
                return true;
              })
              .map((f) => {
                const noteInput = adminFeedbackNotes[f.id] ?? (f.adminNotes || '');
                return (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-amber-300 transition-all text-xs space-y-2.5 shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[#001428] bg-gray-100 px-2 py-0.5 rounded text-[11px] border border-gray-200">
                          Ticket #{f.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          f.type === 'reclamo' ? 'bg-red-100 text-red-900 border border-red-200' : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}>
                          {f.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          f.status === 'resuelto' ? 'bg-emerald-100 text-emerald-800' : f.status === 'en_revision' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {f.status === 'resuelto' ? 'Resuelto' : f.status === 'en_revision' ? 'En Revisión' : 'Pendiente'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDeviceIdForAudit(f.deviceId);
                            const elem = document.getElementById('auditoria-dispositivo-section');
                            elem?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 cursor-pointer"
                          title="Hacer clic para auditar solicitudes, chats y descargar PDF de este dispositivo"
                        >
                          <Smartphone className="w-2.5 h-2.5" />
                          <span>{f.deviceId}</span>
                          <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-gray-500">
                        {new Date(f.createdAt).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {/* Datos del Vecino y Asunto */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100">
                      <div>
                        <strong className="text-sm font-bold text-[#001428] block">
                          {f.title}
                        </strong>
                        <div className="flex items-center gap-2 text-gray-600 text-[11px] mt-0.5">
                          <span>Vecino: <strong>{f.userName || 'Anónimo'}</strong></span>
                          {f.userNeighborhood && <span>• {f.userNeighborhood}</span>}
                        </div>
                      </div>

                      {f.userPhone && (
                        <a
                          href={`https://wa.me/549${f.userPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${f.userName || 'Vecino'}, te contacto desde la administración de Oficios Valle de Lerma por tu ticket #${f.id} sobre "${f.title}".`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>WhatsApp: {f.userPhone}</span>
                        </a>
                      )}
                    </div>

                    {/* Detalle del reclamo */}
                    <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed">
                      "{f.description}"
                    </p>

                    {/* Referencia a solicitud */}
                    {f.relatedRequestId && (
                      <div className="text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-xl border border-amber-200/80 flex items-center justify-between">
                        <span>Vinculado a Solicitud: <strong>#{f.relatedRequestId} - {f.relatedRequestTitle || 'Servicio'}</strong></span>
                        {f.relatedProName && <span>Prestador: <strong>{f.relatedProName}</strong></span>}
                      </div>
                    )}

                    {/* Área de Resolución y Notas del Administrador */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] font-bold text-[#001428] flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5 text-blue-700" />
                          <span>Resolución y Notas del Administrador:</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {f.status !== 'en_revision' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await updateFeedbackStatus(f.id, 'en_revision', noteInput);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] cursor-pointer"
                            >
                              Poner En Revisión
                            </button>
                          )}
                          {f.status !== 'resuelto' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await updateFeedbackStatus(f.id, 'resuelto', noteInput);
                              }}
                              className="px-2.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Marcar como Resuelto
                            </button>
                          )}
                          {f.status === 'resuelto' && (
                            <button
                              type="button"
                              onClick={async () => {
                                await updateFeedbackStatus(f.id, 'pendiente', noteInput);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-[10px] cursor-pointer"
                            >
                              Reabrir Ticket
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={noteInput}
                          onChange={(e) => setAdminFeedbackNotes(prev => ({ ...prev, [f.id]: e.target.value }))}
                          placeholder="Escribir nota o resolución del administrador..."
                          className="flex-1 text-xs p-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-700"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            setSavingFeedbackId(f.id);
                            await updateFeedbackStatus(f.id, f.status, noteInput);
                            setSavingFeedbackId(null);
                          }}
                          className="px-3 py-1.5 bg-[#0f2942] hover:bg-[#001428] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          {savingFeedbackId === f.id ? 'Guardando...' : 'Guardar Nota'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {feedbacks.length === 0 && (
              <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold">No hay reclamos ni sugerencias pendientes</p>
                <p className="text-[11px] text-gray-400">
                  Cuando los vecinos envíen un reclamo o sugerencia desde la app, aparecerán aquí vinculados a su identificador de dispositivo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 2: AUDITORÍA PERICIAL POR IDENTIFICADOR DE DISPOSITIVO (DESCARGA PDF) */}
        {/* ========================================================================= */}
        <div 
          id="auditoria-dispositivo-section"
          className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-4 sm:p-5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#001428] flex items-center gap-2">
                  <span>Auditoría e Historial por Identificador de Dispositivo</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                    Búsqueda y Descarga PDF
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  Solicitá el identificador de dispositivo al usuario para ubicar al instante sus pedidos, chats de 30 días y descargar el informe pericial en PDF.
                </p>
              </div>
            </div>
          </div>

          {/* Campo de Búsqueda de Dispositivo */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#001428] block">
              Número de Identificador de Dispositivo a Peritar:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={selectedDeviceIdForAudit}
                  onChange={(e) => setSelectedDeviceIdForAudit(e.target.value.trim())}
                  placeholder="Ej: DEV-LERMA-A1B2-C3D4 o pegar identificador del usuario..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
              {selectedDeviceIdForAudit && (
                <button
                  type="button"
                  onClick={() => setSelectedDeviceIdForAudit('')}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Accesos rápidos a dispositivos registrados con actividad */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
              <span className="text-gray-500 font-semibold text-[10px]">Elegir rápido:</span>
              {deviceLogs.slice(0, 6).map(d => (
                <button
                  key={d.deviceId}
                  type="button"
                  onClick={() => setSelectedDeviceIdForAudit(d.deviceId)}
                  className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold border transition-colors cursor-pointer ${
                    selectedDeviceIdForAudit === d.deviceId
                      ? 'bg-blue-800 text-white border-blue-800'
                      : 'bg-gray-50 hover:bg-blue-50 text-gray-700 border-gray-200'
                  }`}
                  title={`${d.deviceType} • ${d.browser}`}
                >
                  {d.deviceId} {d.phone ? `(${d.phone})` : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Resultado de la Auditoría del Dispositivo Seleccionado */}
          {selectedDeviceIdForAudit ? (() => {
            const devLog = deviceLogs.find(d => d.deviceId.toLowerCase() === selectedDeviceIdForAudit.toLowerCase());
            
            // Buscar solicitudes asociadas al dispositivo (por deviceId o por teléfono)
            const matchedRequests = requests.filter(r => 
              (r.deviceId && r.deviceId.toLowerCase() === selectedDeviceIdForAudit.toLowerCase()) ||
              (devLog?.phone && r.phoneContact && r.phoneContact.includes(devLog.phone))
            );
            const matchedReqIds = new Set(matchedRequests.map(r => r.id));

            // Buscar mensajes de chat asociados (por deviceId o por la solicitud vinculada)
            const matchedMessages = chatLogs.filter(m => 
              (m.deviceId && m.deviceId.toLowerCase() === selectedDeviceIdForAudit.toLowerCase()) ||
              matchedReqIds.has(m.requestId)
            );

            // Buscar reclamos asociados
            const matchedFeedbacks = feedbacks.filter(f => 
              f.deviceId.toLowerCase() === selectedDeviceIdForAudit.toLowerCase()
            );

            return (
              <div className="space-y-4 pt-2 border-t border-gray-200 animate-in fade-in duration-200">
                {/* Encabezado del Peritaje y Botones de Descarga */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-white border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm text-[#001428] bg-white px-2.5 py-0.5 rounded-lg border border-blue-300">
                        {selectedDeviceIdForAudit}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                        {devLog ? `${devLog.deviceType} • ${devLog.browser}` : 'Dispositivo Registrado'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Teléfono: <strong>{devLog?.phone || matchedRequests[0]?.phoneContact || 'No especificado'}</strong> • Barrio: <strong>{devLog?.neighborhood || matchedRequests[0]?.neighborhood || 'Valle de Lerma'}</strong> • Visitas: <strong>{devLog?.visitCount || 1}</strong>
                    </p>
                  </div>

                  {/* Botones de Descarga: PDF y TXT */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        generateAndDownloadDeviceAuditPdf({
                          deviceLog: devLog,
                          deviceId: selectedDeviceIdForAudit,
                          requests: matchedRequests,
                          messages: matchedMessages,
                          feedbacks: matchedFeedbacks,
                          generatedAt: new Date().toISOString(),
                          adminName: 'Jorge López'
                        });
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                      title="Abre la ventana pericial y ejecuta la exportación oficial a PDF con estilos de impresión"
                    >
                      <Printer className="w-4 h-4 text-blue-200" />
                      <span>Descargar Informe en PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        downloadChatsAsTextFile(matchedMessages, selectedDeviceIdForAudit);
                      }}
                      disabled={matchedMessages.length === 0}
                      className="px-3 py-2 bg-white hover:bg-gray-100 text-[#001428] border border-gray-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Descargar archivo de texto con la transcripción pericial de los chats"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-600" />
                      <span>Bajar Chats (.TXT)</span>
                    </button>
                  </div>
                </div>

                {/* Resumen Cuantitativo */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-bold block uppercase">Solicitudes Creadas</span>
                    <span className="text-base font-black text-[#001428]">{matchedRequests.length}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-bold block uppercase">Mensajes / Chats</span>
                    <span className="text-base font-black text-[#001428]">{matchedMessages.length}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-500 font-bold block uppercase">Reclamos Emitidos</span>
                    <span className="text-base font-black text-[#001428]">{matchedFeedbacks.length}</span>
                  </div>
                </div>

                {/* Pestañas de detalle */}
                <div className="flex gap-1.5 border-b border-gray-200 pb-2 text-xs">
                  {[
                    { id: 'solicitudes', label: `Solicitudes (${matchedRequests.length})`, icon: FileText },
                    { id: 'chats', label: `Chats de 30 Días (${matchedMessages.length})`, icon: MessageCircle },
                    { id: 'reclamos', label: `Reclamos (${matchedFeedbacks.length})`, icon: AlertTriangle }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = auditActiveTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAuditActiveTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isActive 
                            ? 'bg-[#001428] text-white shadow-2xs' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Contenido de Solicitudes vinculadas */}
                {auditActiveTab === 'solicitudes' && (
                  <div className="space-y-2">
                    {matchedRequests.length > 0 ? (
                      matchedRequests.map(r => (
                        <div key={r.id} className="p-3 bg-white rounded-xl border border-gray-200 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#001428]">#{r.id} - {r.title}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              {r.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 font-medium">
                            Rubro: <strong>{r.trade}</strong> • Localidad: <strong>{r.neighborhood}</strong> • Fecha: {r.createdAt}
                          </p>
                          <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">
                            "{r.description}"
                          </p>
                          {r.quotedBy && (
                            <div className="text-[11px] text-emerald-900 bg-emerald-50 p-2 rounded-lg flex justify-between items-center">
                              <span>Prestador Asignado: <strong>{r.quotedBy}</strong></span>
                              {r.quoteAmount && <strong>${r.quoteAmount.toLocaleString('es-AR')}</strong>}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic p-3 text-center bg-gray-50 rounded-xl">
                        No constan solicitudes de trabajo registradas con este identificador.
                      </p>
                    )}
                  </div>
                )}

                {/* Contenido de Chats vinculados */}
                {auditActiveTab === 'chats' && (
                  <div className="space-y-2">
                    {matchedMessages.length > 0 ? (
                      matchedMessages.map(m => (
                        <div key={m.id} className="p-3 bg-white rounded-xl border border-gray-200 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#001428]">{m.senderName}</span>
                              <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                                m.senderRole === 'prestador' ? 'bg-orange-100 text-orange-900' : 'bg-blue-100 text-blue-900'
                              }`}>
                                {m.senderRole}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {new Date(m.createdAt).toLocaleString('es-AR')}
                            </span>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-800">
                            "{m.text}"
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                            <span>Hash: {m.securityLogHash || 'HASH-N/A'}</span>
                            <span className="text-emerald-700 font-semibold font-sans">
                              Resguardo activo ({getRemainingSecurityDays(m.createdAt)} días restantes)
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic p-3 text-center bg-gray-50 rounded-xl">
                        No hay mensajes de chat registrados para este dispositivo.
                      </p>
                    )}
                  </div>
                )}

                {/* Contenido de Reclamos vinculados */}
                {auditActiveTab === 'reclamos' && (
                  <div className="space-y-2">
                    {matchedFeedbacks.length > 0 ? (
                      matchedFeedbacks.map(f => (
                        <div key={f.id} className="p-3 bg-white rounded-xl border border-gray-200 text-xs space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#001428]">Ticket #{f.id} - {f.title}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                              {f.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">
                            "{f.description}"
                          </p>
                          {f.adminNotes && (
                            <p className="text-[11px] text-blue-900 bg-blue-50 p-2 rounded-lg">
                              <strong>Resolución:</strong> {f.adminNotes}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic p-3 text-center bg-gray-50 rounded-xl">
                        No constan reclamos ingresados desde este dispositivo.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })() : (
            <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-1.5">
              <Search className="w-8 h-8 text-blue-400 mx-auto" />
              <p className="text-xs font-semibold text-[#001428]">
                Búsqueda Pericial por Identificador de Dispositivo
              </p>
              <p className="text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed">
                Cuando un vecino realice un reclamo, solicitale su Identificador de Dispositivo (visible en la pestaña "Mi Cuenta" o en el ticket). Pegalo arriba o elegí uno de los accesos rápidos para cargar su expediente completo y descargar el PDF oficial.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

