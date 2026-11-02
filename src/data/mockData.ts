import { Professional, ServiceCategory, Neighborhood, ServiceRequest, UserProfile, AppAdvertisement, ProAccount, UserFeedback, ChatMessage } from '../types';

export const APP_LOGO_URL = '/logo-valle-lerma.jpg';

export const USER_AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkRyDruTTB2Ap6-tdRMRNBBsfRfffrD9PzPM9nYoSZjSO7arSpCby1IxyRPYfm9hPjhFz_2RX5vIEBd5mPo-mRXydQQJsvaImlANPoXNAo-59qM6VCeeeSeAgaexoV18D4ionmZ4d9yexIV1O7zARVBf3CkpCPGjimn817yZ1VCrLGudS7X2KmUQqJ_Tpds3EhGf_hQB75tkFWy0JwJZ_vk_0-z4HA4mjUfhM1c8W7m2wXo0EqeVad';

export const NEIGHBORHOODS: Neighborhood[] = [
  { id: 'todos', name: 'Todos' },
  { id: 'cerrillos', name: 'Cerrillos' },
  { id: 'la-merced', name: 'La Merced' },
  { id: 'chicoana', name: 'Chicoana' },
  { id: 'el-carril', name: 'El Carril' },
  { id: 'rosario-de-lerma', name: 'Rosario de Lerma' },
  { id: 'moldes', name: 'Moldes' },
  { id: 'guachipas', name: 'Guachipas' },
  { id: 'la-vina', name: 'La Viña' },
  { id: 'campo-quijano', name: 'Campo Quijano' },
  { id: 'san-agustin', name: 'San Agustín' },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'albanileria',
    name: 'Albañilería y Reformas',
    slug: 'albanileria',
    iconName: 'foundation',
    countText: '24 especialistas activos',
    description: 'Construcción, contrapisos, revoques, colocación de cerámicos y ampliaciones de viviendas.'
  },
  {
    id: 'plomeria',
    name: 'Plomería y Destapes',
    slug: 'plomeria',
    iconName: 'plumbing',
    countText: '18 especialistas activos',
    description: 'Arreglo de fugas, colocación de termotanques, bombas de agua y desobstrucciones cloacales.'
  },
  {
    id: 'electricidad',
    name: 'Electricidad e Instalaciones',
    slug: 'electricidad',
    iconName: 'electrical_services',
    countText: '15 electricistas',
    description: 'Tableros, disyuntores, iluminación LED, cableados nuevos y detección de cortocircuitos.'
  },
  {
    id: 'gasistas',
    name: 'Gasistas Matriculados',
    slug: 'gasistas',
    iconName: 'local_fire_department',
    countText: 'ENARGAS / Gasnor',
    badge: 'Matriculados',
    description: 'Inspecciones técnicas, trámites ante Gasnor, instalación de calefones, estufas y cocinas.'
  },
  {
    id: 'pintura',
    name: 'Pintura e Impermeabilización',
    slug: 'pintura',
    iconName: 'format_paint',
    countText: '12 pintores de obra',
    description: 'Pintura látex interior y exterior, membrana líquida, impermeabilización de techos y texturados.'
  },
  {
    id: 'jardineria',
    name: 'Jardinería y Desmalezado',
    slug: 'jardineria',
    iconName: 'yard',
    countText: '9 cuadrillas locales',
    description: 'Corte de pasto con motoguadaña, poda de árboles frutales, parquizaciones y limpieza de terrenos.'
  },
  {
    id: 'cerrajeria',
    name: 'Cerrajería y Urgencias',
    slug: 'cerrajeria',
    iconName: 'key',
    countText: 'Guardia 24hs',
    badge: '24 Horas',
    description: 'Aperturas de puertas de urgencia, cambio de combinaciones, cerraduras de seguridad.'
  },
  {
    id: 'climatizacion',
    name: 'Aire Acondicionado & Clima',
    slug: 'climatizacion',
    iconName: 'ac_unit',
    countText: 'Instalación y service',
    description: 'Colocación de aires split, carga de gas refrigerante, mantenimiento preventivo y limpieza de filtros.'
  },
  {
    id: 'gastronomia',
    name: 'Comida y Gastronomía',
    slug: 'gastronomia',
    iconName: 'utensils',
    countText: 'Rotiserías, catering y viandas',
    badge: 'Del Valle',
    description: 'Empanadas salteñas al horno de barro, catering para eventos, asadores a domicilio, viandas caseras y repostería artesanal.'
  },
  {
    id: 'automotor',
    name: 'Automotor y Mecánica',
    slug: 'automotor',
    iconName: 'car',
    countText: 'Talleres y auxilio mecánico',
    description: 'Mecánica integral, electricidad automotor, tren delantero, frenos, cambio de aceite y auxilio en ruta 68.'
  },
  {
    id: 'remis',
    name: 'Remis y Traslados',
    slug: 'remis',
    iconName: 'taxi',
    countText: 'Viajes locales y a Salta',
    badge: '24 Horas',
    description: 'Servicio de remis 24hs, traslados a Salta Capital, viajes al Dique Cabra Corral, fletes chicos y encomiendas.'
  },
  {
    id: 'piletas',
    name: 'Limpieza de Piletas',
    slug: 'piletas',
    iconName: 'pool',
    countText: 'Mantenimiento y bombas',
    description: 'Aspirado de fondo, control de cloro y pH, recuperación de agua verde, service de bombas y filtros de arena.'
  },
  {
    id: 'uber',
    name: 'Uber y Chofer Particular',
    slug: 'uber',
    iconName: 'uber',
    countText: 'Viajes inmediatos y coordinados',
    badge: 'En el Valle',
    description: 'Viajes por aplicación, viajes coordinados, traslados al Aeropuerto, Salta Capital y recorridos en todo el Valle de Lerma.'
  },
  {
    id: 'ventas-varias',
    name: 'Ventas Varias',
    slug: 'ventas-varias',
    iconName: 'shopping_bag',
    countText: 'Comercios y productos locales',
    badge: 'Comercio',
    description: 'Artículos para el hogar, calzado, indumentaria, herramientas, bazar, productos regionales y ventas particulares.'
  },
  {
    id: 'otros-servicios',
    name: 'Otros Servicios',
    slug: 'otros-servicios',
    iconName: 'more_horizontal',
    countText: 'Servicios generales y gestoría',
    badge: 'Comunidad',
    description: 'Cuidado de adultos y niños, clases particulares, gestoría y trámites, peluquería a domicilio, informática y reparaciones menores.'
  }
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: 'roberto-gomez',
    name: 'Roberto Gómez',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpq_tkzuBQx2Ou2qFzb63CiAjD0HtMGwGRUGQugoX1X6uxfjdlPdoPz4hZGVk0gpXe4zaZSUO9bDROnwZYEA57LdwmMQLVdKITB7u_fghCDv53bxoRPR_9bn_NgJl2AtDDWKEgqVaKw596ZNsI9NUMxK6Y7tWslswH_JxOfkzy39OSehYmPQQ1JfGZWfqKar0wFElolt5E3pTd5vzDlfAQMGdn0BL3AGV1IASlmRzN2oz5mAkhp9rn',
    trade: 'Albañil y Constructor',
    categoryId: 'albanileria',
    neighborhood: 'Cerrillos',
    rating: 4.9,
    reviewCount: 48,
    verified: true,
    verifiedLabel: 'Verificado',
    availableNow: true,
    emergencyDuty: false,
    quoteWithoutCharge: true,
    isExample: true,
    phone: '+54 387 412-8841',
    whatsappNumber: '5493874128841',
    experienceYears: 18,
    bio: 'Maestro mayor de obras prácticas con más de 18 años edificando en Cerrillos, La Merced y San Agustín. Especialista en losas, contrapisos, colocación fina de porcelanato y ampliaciones de casas familiares. Trabajo serio con cuadrilla propia y referencias comprobables en todo el Valle de Lerma.',
    guaranteeText: 'Garantía vecinal de mano de obra',
    priceTagText: 'Presupuesto sin cargo',
    services: [
      { name: 'Levantado de muros y mampostería tradicional', priceEstimate: 'Desde $12.000 / m2' },
      { name: 'Colocación de cerámicos y porcelanatos', priceEstimate: 'Desde $14.500 / m2' },
      { name: 'Construcción de quinchos y asadores criollos', priceEstimate: 'A convenir con plano' },
      { name: 'Revoques grueso y fino fratasado', priceEstimate: 'Desde $9.500 / m2' }
    ],
    completedJobs: [
      {
        title: 'Ampliación de cocina comedor y galería',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
        neighborhood: 'Cerrillos',
        date: 'Hace 2 semanas',
        comment: 'Se levantaron 35m2 de mampostería con ladrillo cerámico del 18, losa con viguetas pretensadas y contrapiso reforzado para galería.',
        verifiedByApp: true,
        contractNumber: 'ORD-VALLE-2026-004',
        clientName: 'Marcos Vilte'
      },
      {
        title: 'Colocación de porcelanato rústico en patio',
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        neighborhood: 'La Merced',
        date: 'Hace 1 mes',
        comment: 'Nivelación previa de carpeta y colocación de porcelanato 60x60 antideslizante con junta de 3mm y pastina impermeable.',
        verifiedByApp: true,
        contractNumber: 'ORD-VALLE-2026-005',
        clientName: 'Lucas Pastrana'
      },
      {
        title: 'Asador tradicional con campana de ladrillos',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        neighborhood: 'San Agustín',
        date: 'Hace 2 meses',
        comment: 'Construcción integral de quincho y parrilla con ladrillos refractarios en piso y laterales, tiraje con pulmón antihumo.',
        verifiedByApp: true,
        contractNumber: 'ORD-VALLE-2026-006',
        clientName: 'Estela Morales'
      }
    ],
    reviews: [
      {
        id: 'r1',
        author: 'Marcos Vilte',
        date: '14 de Agosto, 2026',
        rating: 5,
        comment: 'Roberto y sus muchachos hicieron la ampliación del fondo de casa. Muy prolijos, puntuales y cuidaron todos los materiales. Lo recomiendo con los ojos cerrados.',
        neighborhood: 'Cerrillos'
      },
      {
        id: 'r2',
        author: 'Estela Morales',
        date: '28 de Julio, 2026',
        rating: 5,
        comment: 'Excelente albañil. Vino en el día a presupuestar sin cobrar un peso y cumplió exactamente los plazos pactados.',
        neighborhood: 'La Merced'
      }
    ]
  },
  {
    id: 'carlos-mamani',
    name: 'Carlos Mamaní',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA54etxC3UaV4NwIOym4E6WHdqN1rk9m2u8BFT0eWuME9sCPPkAG7k5lTum0iDVdN_5XvxkXF_67kOKLWA-Yeif37K-wjp6FgLvEbImqqmGgCNKIRWfiSzWCpGpgWOrbsIhRV04KzQkkrptByXWvPEm9e36xuMBe3wioaJVD0RcYwCl-tex6wQNgR7ZgJpExVQ__8Jg6H-q8-BRUKon4_qRTTiZ8PlojJZ6Ocdnxg2_XWa4PJnG4LD7',
    trade: 'Electricista Domiciliario',
    categoryId: 'electricidad',
    neighborhood: 'Rosario de Lerma',
    rating: 5.0,
    reviewCount: 32,
    verified: true,
    verifiedLabel: 'Disponible ahora',
    availableNow: true,
    emergencyDuty: true,
    quoteWithoutCharge: true,
    isExample: true,
    matricula: 'MP N° 4192 / COPIPA Salta',
    phone: '+54 387 523-9902',
    whatsappNumber: '5493875239902',
    experienceYears: 12,
    bio: 'Técnico electricista matriculado en Salta. Atención inmediata para urgencias domiciliarias en Rosario de Lerma, Campo Quijano y Cerrillos. Instalación de térmicas, disyuntores diferenciales, puesta a tierra (jabalina con medición de resistencia) y cableados aprobados bajo norma IRAM.',
    guaranteeText: 'Matrícula Provincial COPIPA',
    priceTagText: 'Atención de urgencia hoy',
    services: [
      { name: 'Urgencia por corte de luz o disyuntor caído', priceEstimate: '$15.000 visita diagnóstico' },
      { name: 'Armado y recambio de tablero eléctrico general', priceEstimate: 'Desde $35.000 + materiales' },
      { name: 'Instalación de jabalina con protocolo de medición', priceEstimate: '$28.000' },
      { name: 'Iluminación exterior y reflectores solares/LED', priceEstimate: '$12.000 por boca' }
    ],
    completedJobs: [
      {
        title: 'Modernización de tablero con disyuntor bipolar Schneider',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
        neighborhood: 'Rosario de Lerma',
        date: 'Hace 4 días',
        comment: 'Recambio de llaves térmicas antiguas por disyuntor diferencial bipolar de 25A y térmicas seccionales de iluminación y tomas con peines de conexión certificados.',
        verifiedByApp: true,
        contractNumber: 'ORD-VALLE-2026-031',
        clientName: 'Dario Figueroa'
      },
      {
        title: 'Puesta a tierra reglamentaria con protocolo IRAM',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        neighborhood: 'Campo Quijano',
        date: 'Hace 2 semanas',
        comment: 'Hincado de jabalina de cobre con cámara de inspección plástica, cable verde/amarillo de 10mm² y medición de resistencia menor a 5 ohms para habilitación de medidor.',
        verifiedByApp: true,
        contractNumber: 'ORD-VALLE-2026-027',
        clientName: 'Silvia Albarracín'
      },
      {
        title: 'Instalación de luminarias LED exteriores y fotocélulas',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        neighborhood: 'Cerrillos',
        date: 'Hace 1 mes',
        comment: 'Circuito independiente para 6 reflectores LED de 50W perimetrales en quinta con encendido automático crepuscular.',
        verifiedByApp: true,
        contractNumber: 'ORD-VALLE-2026-015',
        clientName: 'Estela Morales'
      }
    ],
    reviews: [
      {
        id: 'r3',
        author: 'Dario Figueroa',
        date: '1 de Septiembre, 2026',
        rating: 5,
        comment: 'Se nos cortó la luz un domingo a las 20hs por un cortocircuito en el enchufe de la heladera. Carlos vino en 20 minutos con tester y repuestos. Un genio total.',
        neighborhood: 'Rosario de Lerma'
      },
      {
        id: 'r4',
        author: 'Silvia Albarracín',
        date: '20 de Agosto, 2026',
        rating: 5,
        comment: 'Muy responsable y educado. Nos dejó certificado de aptitud eléctrica para el trámite del medidor EDESA.',
        neighborhood: 'Cerrillos'
      }
    ]
  },
  {
    id: 'dona-carmen-guaymas',
    name: 'Doña Carmen Guaymas',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    trade: 'Rotisería y Comidas Criollas',
    categoryId: 'gastronomia',
    neighborhood: 'Rosario de Lerma',
    rating: 4.9,
    reviewCount: 46,
    verified: true,
    verifiedLabel: 'Disponible hoy',
    availableNow: true,
    emergencyDuty: false,
    quoteWithoutCharge: true,
    isExample: true,
    phone: '+54 387 493-2190',
    whatsappNumber: '5493874932190',
    experienceYears: 16,
    bio: 'Elaboración artesanal de empanadas salteñas cortadas a cuchillo al horno de barro, locro criollo pulsudo, humitas en chala y catering de comida regional para eventos en Rosario de Lerma.',
    guaranteeText: 'Higiene y sabor tradicional',
    priceTagText: 'Presupuesto y delivery',
    services: [
      { name: 'Empanadas salteñas de carne a cuchillo (docena)', priceEstimate: '$14.000 / docena' },
      { name: 'Locro tradicional salteño en porciones', priceEstimate: '$7.500 por porción' },
      { name: 'Humitas en chala y tamales criollos', priceEstimate: '$12.000 la docena' },
      { name: 'Catering de comidas criollas para eventos', priceEstimate: 'A convenir por cantidad' }
    ],
    completedJobs: [
      {
        title: 'Catering criollo para fiesta familiar',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        neighborhood: 'Rosario de Lerma',
        date: 'Hace 3 días',
        comment: 'Servicio de 15 docenas de empanadas y cazuelas de locro caliente para 50 personas.',
        verifiedByApp: true,
        contractNumber: 'ORD-VALLE-2026-009',
        clientName: 'Raúl Maza'
      }
    ],
    reviews: [
      {
        id: 'r-dona-1',
        author: 'Raúl Maza',
        date: 'Ayer',
        rating: 5,
        comment: 'Las mejores empanadas y comida criolla de Rosario de Lerma. Jugosas, masa casera y excelente atención.',
        neighborhood: 'Rosario de Lerma'
      }
    ]
  },
  {
    id: 'mariana-figueroa',
    name: 'Mariana Figueroa',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    trade: 'Sandwichería, Minutas y Empanadas',
    categoryId: 'gastronomia',
    neighborhood: 'Cerrillos',
    rating: 4.8,
    reviewCount: 38,
    verified: true,
    verifiedLabel: 'Disponible hoy',
    availableNow: true,
    emergencyDuty: false,
    quoteWithoutCharge: true,
    isExample: true,
    phone: '+54 387 512-8877',
    whatsappNumber: '5493875128877',
    experienceYears: 10,
    bio: 'Sandwiches especiales de milanesa, lomitos completos, pizzas a la piedra y viandas de comida casera en Cerrillos.',
    guaranteeText: 'Calidad y rapidez',
    priceTagText: 'Delivery en Cerrillos',
    services: [
      { name: 'Sandwich de milanesa completo con papas', priceEstimate: '$8.500' },
      { name: 'Lomito gourmet en pan casero', priceEstimate: '$9.800' },
      { name: 'Pizzas artesanales y empanadas', priceEstimate: 'Desde $11.000' }
    ],
    completedJobs: [],
    palabrasClave: ['sandwiches', 'lomitos', 'empanadas salteñas', 'pizzas', 'viandas', 'delivery'],
    searchKeywords: ['sandwiches', 'lomitos', 'empanadas salteñas', 'pizzas', 'viandas', 'delivery'],
    searchKeywordsText: 'sandwiches, lomitos, empanadas, pizzas, viandas, papas fritas',
    reviews: [
      {
        id: 'r-mar-1',
        author: 'Joaquín Santos',
        date: 'Hace 2 días',
        rating: 5,
        comment: 'Excelente comida y minutas en Cerrillos. Llegó caliente y super abundante.',
        neighborhood: 'Cerrillos'
      }
    ]
  },
  {
    id: 'corralon-el-valle',
    name: 'Corralón y Ferretería El Valle',
    avatar: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
    trade: 'Corralón de Materiales y Artículos de Pesca',
    categoryId: 'albanileria',
    neighborhood: 'Cerrillos',
    rating: 4.9,
    reviewCount: 42,
    verified: true,
    verifiedLabel: 'Comercio Verificado',
    availableNow: true,
    emergencyDuty: false,
    quoteWithoutCharge: true,
    isExample: true,
    phone: '+54 387 528-6914',
    whatsappNumber: '5493875286914',
    experienceYears: 15,
    bio: 'Venta de materiales gruesos para construcción, herramientas y sección completa de pesca deportiva, camping y tiempo libre en Cerrillos y ruta 68 hacia el Dique Cabra Corral.',
    guaranteeText: 'Entrega directa en obra',
    priceTagText: 'Ventas por mayor y menor',
    palabrasClave: [
      'cañas de pescar',
      'caña de pescar',
      'riles',
      'reels',
      'sillas plegables',
      'pesca',
      'carnada',
      'anzuelos',
      'camping',
      'conservadoras',
      'sombrillas',
      'cemento',
      'áridos',
      'arena'
    ],
    searchKeywords: [
      'cañas de pescar',
      'caña de pescar',
      'riles',
      'reels',
      'sillas plegables',
      'pesca',
      'carnada',
      'anzuelos',
      'camping',
      'conservadoras',
      'sombrillas',
      'cemento',
      'áridos',
      'arena'
    ],
    searchKeywordsText: 'cañas de pescar, riles, reels, sillas plegables, anzuelos, carnada, camping, sombrillas, conservadoras, cemento, ladrillos',
    services: [
      { name: 'Cañas de pescar telescópicas y variada', priceEstimate: 'Desde $24.000' },
      { name: 'Riles frontales y rotativos con nylon', priceEstimate: 'Desde $19.500' },
      { name: 'Sillas plegables reforzadas para camping y dique', priceEstimate: '$18.000' },
      { name: 'Arena fina, cemento y materiales gruesos', priceEstimate: 'Presupuesto con flete' }
    ],
    completedJobs: [],
    reviews: [
      {
        id: 'r-corr-1',
        author: 'Esteban Guanca',
        date: 'Hace 3 días',
        rating: 5,
        comment: 'Tienen de todo en Cerrillos. Fui a cotizar cemento y me llevé cañas y sillas para ir al dique.',
        neighborhood: 'Cerrillos'
      }
    ]
  }
];

/**
 * Normalizes text removing accents, hyphens, underscores and converting to lowercase
 */
export const normalizeFilterText = (str: string | undefined | null): string => {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .trim();
};

/**
 * Checks if a worker's neighborhood strictly matches the selected department/locality
 */
export const isWorkerInNeighborhood = (
  workerNeighborhood: string | undefined | null,
  selectedNeighborhood: string,
  customNeighborhoods?: Neighborhood[]
): boolean => {
  if (!selectedNeighborhood || selectedNeighborhood === 'todos') {
    return true;
  }
  if (!workerNeighborhood || !workerNeighborhood.trim()) {
    return false;
  }

  const list = customNeighborhoods || NEIGHBORHOODS;
  const targetObj = list.find(n => 
    n.id === selectedNeighborhood ||
    normalizeFilterText(n.id) === normalizeFilterText(selectedNeighborhood) ||
    normalizeFilterText(n.name) === normalizeFilterText(selectedNeighborhood)
  );

  const targetName = targetObj ? normalizeFilterText(targetObj.name) : normalizeFilterText(selectedNeighborhood);
  const targetId = targetObj ? normalizeFilterText(targetObj.id) : normalizeFilterText(selectedNeighborhood);
  const workerLoc = normalizeFilterText(workerNeighborhood);

  if (!workerLoc) {
    return false;
  }

  // Exact match or sub-neighborhood match (e.g. "Barrio San Jorge, Rosario de Lerma")
  return (
    workerLoc === targetName ||
    workerLoc === targetId ||
    workerLoc.includes(targetName) ||
    workerLoc.includes(targetId)
  );
};

/**
 * Checks if a worker profile matches a text search query across name, trade, category, services, bio,
 * and custom search keywords (palabras clave configuradas por el prestador, ej. cañas de pescar, riles, sillas plegables)
 */
export const isWorkerMatchingSearch = (
  worker: Professional, 
  query: string, 
  customCategories?: ServiceCategory[]
): boolean => {
  if (!query || !query.trim()) {
    return true;
  }

  const qNorm = normalizeFilterText(query);
  const terms = qNorm.split(/\s+/).filter(Boolean);
  const catList = customCategories || SERVICE_CATEGORIES;

  return terms.every(term => {
    const matchesName = normalizeFilterText(worker.name).includes(term);
    const matchesTrade = normalizeFilterText(worker.trade).includes(term);
    const matchesBarrio = normalizeFilterText(worker.neighborhood).includes(term);
    const matchesBio = normalizeFilterText(worker.bio || '').includes(term);

    // 1. Check custom search keywords (palabras clave del prestador, ej. caña de pescar, riles, sillas plegables)
    const allKeywords = [
      ...(worker.palabrasClave || []),
      ...(worker.searchKeywords || [])
    ];

    const matchesKeywordsArray = allKeywords.some(kw => {
      const kwNorm = normalizeFilterText(kw);
      if (!kwNorm) return false;
      const termStem = term.endsWith('s') && term.length > 3 ? term.slice(0, -1) : term;
      return kwNorm.includes(term) || term.includes(kwNorm) || kwNorm.includes(termStem);
    });

    // Also check if the entire search query is contained in any keyword or vice versa
    const matchesFullQueryKeyword = allKeywords.some(kw => {
      const kwNorm = normalizeFilterText(kw);
      return kwNorm.includes(qNorm) || qNorm.includes(kwNorm);
    });

    const matchesKeywordsText = normalizeFilterText(worker.searchKeywordsText || '').includes(term);
    const matchesKeywords = matchesKeywordsArray || matchesKeywordsText || matchesFullQueryKeyword;

    // 2. Check services offered
    const matchesServices = (worker.services || []).some(s => 
      normalizeFilterText(s.name).includes(term) || 
      normalizeFilterText(s.description || '').includes(term)
    );

    // 3. Check categories
    const catObj = catList.find(c => c.id === worker.categoryId);
    const matchesCategory = catObj ? (
      normalizeFilterText(catObj.name).includes(term) || 
      normalizeFilterText(catObj.slug).includes(term) || 
      normalizeFilterText(catObj.description || '').includes(term)
    ) : false;

    return matchesName || matchesTrade || matchesBarrio || matchesBio || matchesKeywords || matchesServices || matchesCategory;
  });
};

export const INITIAL_REQUESTS: ServiceRequest[] = [
  {
    id: 'req-1',
    title: 'Reparación de cañería y grifería de cocina',
    trade: 'Plomería y Gasista',
    neighborhood: 'El Carril',
    description: 'Tengo una filtración debajo de la bacha de la cocina que moja el bajo mesada. Necesito cambiar flexibles y ajustar la grifería monocomando.',
    createdAt: 'Hoy, hace 3 horas',
    status: 'contratado',
    contractNumber: 'ORD-VALLE-2026-001',
    quotedBy: 'Carlos Mamaní',
    assignedWorkerId: 'carlos-mamani',
    quotedByAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA54etxC3UaV4NwIOym4E6WHdqN1rk9m2u8BFT0eWuME9sCPPkAG7k5lTum0iDVdN_5XvxkXF_67kOKLWA-Yeif37K-wjp6FgLvEbImqqmGgCNKIRWfiSzWCpGpgWOrbsIhRV04KzQkkrptByXWvPEm9e36xuMBe3wioaJVD0RcYwCl-tex6wQNgR7ZgJpExVQ__8Jg6H-q8-BRUKon4_qRTTiZ8PlojJZ6Ocdnxg2_XWa4PJnG4LD7',
    quotedByTrade: 'Electricista & Mantenimiento',
    quoteAmount: 18000,
    phoneContact: '+54 387 499-1304',
    clientName: 'Familia Morales',
    deviceId: 'DEV-LERMA-8841-9920'
  },
  {
    id: 'req-2',
    title: 'Instalación de disyuntor y térmicas nuevas',
    trade: 'Electricidad e Instalaciones',
    neighborhood: 'Cerrillos',
    description: 'Quiero cambiar los tapones viejos por térmicas Schneider nuevas y poner un disyuntor diferencial para mayor seguridad.',
    createdAt: 'Ayer a las 11:15',
    status: 'cotizado',
    contractNumber: 'ORD-VALLE-2026-002',
    quotedBy: 'Carlos Mamaní',
    assignedWorkerId: 'carlos-mamani',
    quotedByAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA54etxC3UaV4NwIOym4E6WHdqN1rk9m2u8BFT0eWuME9sCPPkAG7k5lTum0iDVdN_5XvxkXF_67kOKLWA-Yeif37K-wjp6FgLvEbImqqmGgCNKIRWfiSzWCpGpgWOrbsIhRV04KzQkkrptByXWvPEm9e36xuMBe3wioaJVD0RcYwCl-tex6wQNgR7ZgJpExVQ__8Jg6H-q8-BRUKon4_qRTTiZ8PlojJZ6Ocdnxg2_XWa4PJnG4LD7',
    quotedByTrade: 'Electricista Domiciliario Matriculado',
    quoteAmount: 25000,
    phoneContact: '+54 387 455-8910',
    clientName: 'Juan Martín López',
    deviceId: 'DEV-LERMA-1092-7744'
  },
  {
    id: 'req-3',
    title: 'Construcción de asador y quincho familiar',
    trade: 'Albañilería y Construcción',
    neighborhood: 'Cerrillos',
    description: 'Construcción de parrillero de 2.20m con ladrillos refractarios, mesada auxiliar y losa.',
    createdAt: 'Hace 3 días (27 de Octubre)',
    status: 'completado',
    contractNumber: 'ORD-VALLE-2026-003',
    quotedBy: 'Roberto Gómez',
    assignedWorkerId: 'roberto-gomez',
    quotedByAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    quotedByTrade: 'Maestro Mayor de Obras & Albañil',
    quoteAmount: 140000,
    phoneContact: '+54 387 499-8812',
    clientName: 'Estela Morales',
    completedJobPhoto: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    completedJobComment: 'Construcción integral de quincho y parrilla con ladrillos refractarios en piso y laterales, tiraje con pulmón antihumo.',
    deviceId: 'DEV-LERMA-3319-5562'
  },
  {
    id: 'req-4',
    title: 'Viaje y traslado familiar de Cerrillos a Chicoana',
    trade: 'Uber, Traslados y Fletes',
    neighborhood: 'Cerrillos',
    description: 'Necesitamos traslado ida y vuelta para 4 personas este domingo a un almuerzo familiar en Chicoana. Con espera de 3 horas.',
    createdAt: 'Hoy, hace 15 minutos',
    status: 'en_espera',
    clientName: 'Gonzalo Albornoz',
    phoneContact: '+54 387 544-3211',
    deviceId: 'DEV-LERMA-8841-9920'
  },
  {
    id: 'req-5',
    title: 'Catering de empanadas salteñas para 25 personas',
    trade: 'Gastronomía y Comidas Criollas',
    neighborhood: 'La Merced',
    description: 'Necesitamos 8 docenas de empanadas de carne cortadas a cuchillo y 2 de queso para cumpleaños este sábado por la noche.',
    createdAt: 'Hoy, hace 1 hora',
    status: 'en_espera',
    clientName: 'Mariana Figueroa',
    phoneContact: '+54 387 512-8877',
    deviceId: 'DEV-LERMA-5512-4411'
  },
  {
    id: 'req-6',
    title: 'Cambio de pastillas de freno y afinación de motor',
    trade: 'Mecánica y Auxilio Móvil',
    neighborhood: 'El Carril',
    description: 'Renault Kangoo hace ruido al frenar y tironea en baja. Necesito revisión a domicilio o en taller de la zona.',
    createdAt: 'Ayer a las 18:40',
    status: 'en_espera',
    clientName: 'Héctor Wayar',
    phoneContact: '+54 387 488-9900',
    deviceId: 'DEV-LERMA-7740-9912'
  },
  {
    id: 'req-7',
    title: 'Pintura látex exterior en fachada de dos plantas y rejas',
    trade: 'Pintura y Terminaciones',
    neighborhood: 'Rosario de Lerma',
    description: 'Pintura de frente de casa de 2 pisos, preparación de muros con fijador y esmalte sintético en rejas perimetrales de 12 metros lineales.',
    createdAt: 'Hace 3 días (27 de Octubre)',
    status: 'en_espera',
    clientName: 'Lucas Pastrana',
    phoneContact: '+54 387 512-4490',
    deviceId: 'DEV-LERMA-4412-3301'
  },
  {
    id: 'req-8',
    title: 'Colocación de termotanque solar de 200L con presurizadora',
    trade: 'Plomería y Gasista',
    neighborhood: 'San Agustín',
    description: 'Compramos un termotanque termosifónico de tubos de vacío de 200 litros. Necesitamos armado de estructura en techo y conexión a cañerías existentes.',
    createdAt: 'Hace 5 días (25 de Octubre)',
    status: 'en_espera',
    clientName: 'Estela Morales',
    phoneContact: '+54 387 499-8812',
    deviceId: 'DEV-LERMA-3319-5562'
  },
  {
    id: 'req-9',
    title: 'Fabricación de portón corredizo de chapa plegada y herrería',
    trade: 'Herrería y Estructuras',
    neighborhood: 'Campo Quijano',
    description: 'Portón de 3.20m x 2.10m con guía reforzada al piso, ruedas de fundición con rulemán y puerta de escape peatonal integrada.',
    createdAt: 'Hace 1 semana (23 de Octubre)',
    status: 'en_espera',
    clientName: 'Silvia Albarracín',
    phoneContact: '+54 387 566-7788',
    deviceId: 'DEV-LERMA-6650-1288'
  },
  {
    id: 'req-10',
    title: 'Desmalezado, poda de cercos y nivelación de terreno de 800m2',
    trade: 'Jardinería y Parquización',
    neighborhood: 'La Silleta',
    description: 'Limpieza profunda de lote con motoguadaña, desmalezado y poda de ramas bajas de eucaliptos para posterior alambrado.',
    createdAt: 'Hace 10 días (20 de Octubre)',
    status: 'en_espera',
    clientName: 'Juan Martín López',
    phoneContact: '+54 387 455-8910',
    deviceId: 'DEV-LERMA-1092-7744'
  },
  {
    id: 'req-11',
    title: 'Reparación de fuga en cañería de gas con prueba de hermeticidad',
    trade: 'Plomería y Gasista',
    neighborhood: 'Chicoana',
    description: 'Sentimos olor a gas cerca de la llave de paso de la cocina. Necesitamos revisión técnica matriculada con manómetro de columna.',
    createdAt: 'Hace 4 días (26 de Octubre)',
    status: 'cotizado',
    contractNumber: 'ORD-VALLE-2026-039',
    quotedBy: 'Carlos Mamaní',
    assignedWorkerId: 'carlos-mamani',
    quotedByAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA54etxC3UaV4NwIOym4E6WHdqN1rk9m2u8BFT0eWuME9sCPPkAG7k5lTum0iDVdN_5XvxkXF_67kOKLWA-Yeif37K-wjp6FgLvEbImqqmGgCNKIRWfiSzWCpGpgWOrbsIhRV04KzQkkrptByXWvPEm9e36xuMBe3wioaJVD0RcYwCl-tex6wQNgR7ZgJpExVQ__8Jg6H-q8-BRUKon4_qRTTiZ8PlojJZ6Ocdnxg2_XWa4PJnG4LD7',
    quotedByTrade: 'Técnico Domiciliario Matriculado',
    quoteAmount: 32000,
    phoneContact: '+54 387 411-9933',
    clientName: 'Fabián Colque',
    deviceId: 'DEV-LERMA-7740-9912'
  },
  {
    id: 'req-12',
    title: 'Colocación de membrana geotextil y pintura asfáltica en losa',
    trade: 'Albañilería y Construcción',
    neighborhood: 'Rosario de Lerma',
    description: 'Filtración en losa plana de 45m2 con manchas de humedad en techo de dormitorio. Se requiere impermeabilización con membrana pegada a soplete.',
    createdAt: 'Hace 1 semana (23 de Octubre)',
    status: 'cotizado',
    contractNumber: 'ORD-VALLE-2026-035',
    quotedBy: 'Roberto Gómez',
    assignedWorkerId: 'roberto-gomez',
    quotedByAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpq_tkzuBQx2Ou2qFzb63CiAjD0HtMGwGRUGQugoX1X6uxfjdlPdoPz4hZGVk0gpXe4zaZSUO9bDROnwZYEA57LdwmMQLVdKITB7u_fghCDv53bxoRPR_9bn_NgJl2AtDDWKEgqVaKw596ZNsI9NUMxK6Y7tWslswH_JxOfkzy39OSehYmPQQ1JfGZWfqKar0wFElolt5E3pTd5vzDlfAQMGdn0BL3AGV1IASlmRzN2oz5mAkhp9rn',
    quotedByTrade: 'Maestro Mayor de Obras & Albañil',
    quoteAmount: 85000,
    phoneContact: '+54 387 512-4490',
    clientName: 'Lucas Pastrana',
    deviceId: 'DEV-LERMA-4412-3301'
  },
  {
    id: 'req-13',
    title: 'Construcción de contrapiso reforzado para cochera de 30m2',
    trade: 'Albañilería y Construcción',
    neighborhood: 'Cerrillos',
    description: 'Excavación, nivelación de suelo con tosca compactada, colocación de nylon de 200 micrones, malla cima del 6 y colado de hormigón elaborado.',
    createdAt: 'Hace 6 días (24 de Octubre)',
    status: 'contratado',
    contractNumber: 'ORD-VALLE-2026-042',
    quotedBy: 'Roberto Gómez',
    assignedWorkerId: 'roberto-gomez',
    quotedByAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpq_tkzuBQx2Ou2qFzb63CiAjD0HtMGwGRUGQugoX1X6uxfjdlPdoPz4hZGVk0gpXe4zaZSUO9bDROnwZYEA57LdwmMQLVdKITB7u_fghCDv53bxoRPR_9bn_NgJl2AtDDWKEgqVaKw596ZNsI9NUMxK6Y7tWslswH_JxOfkzy39OSehYmPQQ1JfGZWfqKar0wFElolt5E3pTd5vzDlfAQMGdn0BL3AGV1IASlmRzN2oz5mAkhp9rn',
    quotedByTrade: 'Maestro Mayor de Obras & Albañil',
    quoteAmount: 115000,
    phoneContact: '+54 387 512-4490',
    clientName: 'Lucas Pastrana',
    deviceId: 'DEV-LERMA-4412-3301'
  },
  {
    id: 'req-14',
    title: 'Cableado de circuito especial para 3 aires acondicionados',
    trade: 'Electricidad e Instalaciones',
    neighborhood: 'La Merced',
    description: 'Instalación de línea dedicada de 4mm² desde el pilar con térmicas independientes de 16A y tomas especiales de 20A en dormitorios.',
    createdAt: 'Hace 2 semanas (16 de Octubre)',
    status: 'contratado',
    contractNumber: 'ORD-VALLE-2026-037',
    quotedBy: 'Carlos Mamaní',
    assignedWorkerId: 'carlos-mamani',
    quotedByAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA54etxC3UaV4NwIOym4E6WHdqN1rk9m2u8BFT0eWuME9sCPPkAG7k5lTum0iDVdN_5XvxkXF_67kOKLWA-Yeif37K-wjp6FgLvEbImqqmGgCNKIRWfiSzWCpGpgWOrbsIhRV04KzQkkrptByXWvPEm9e36xuMBe3wioaJVD0RcYwCl-tex6wQNgR7ZgJpExVQ__8Jg6H-q8-BRUKon4_qRTTiZ8PlojJZ6Ocdnxg2_XWa4PJnG4LD7',
    quotedByTrade: 'Electricista Domiciliario Matriculado',
    quoteAmount: 48000,
    phoneContact: '+54 387 499-8812',
    clientName: 'Estela Morales',
    deviceId: 'DEV-LERMA-3319-5562'
  },
  {
    id: 'req-15',
    title: 'Recambio de cañería maestra y desagüe cloacal en baño',
    trade: 'Plomería y Gasista',
    neighborhood: 'Rosario de Lerma',
    description: 'Reemplazo de caño maestro antiguo de plomo por termofusión de 3/4 y desagües primarios en PVC reforzado con prueba de presión hidráulica.',
    createdAt: 'Hace 3 semanas (9 de Octubre)',
    status: 'completado',
    contractNumber: 'ORD-VALLE-2026-018',
    quotedBy: 'Carlos Mamaní',
    assignedWorkerId: 'carlos-mamani',
    quotedByAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA54etxC3UaV4NwIOym4E6WHdqN1rk9m2u8BFT0eWuME9sCPPkAG7k5lTum0iDVdN_5XvxkXF_67kOKLWA-Yeif37K-wjp6FgLvEbImqqmGgCNKIRWfiSzWCpGpgWOrbsIhRV04KzQkkrptByXWvPEm9e36xuMBe3wioaJVD0RcYwCl-tex6wQNgR7ZgJpExVQ__8Jg6H-q8-BRUKon4_qRTTiZ8PlojJZ6Ocdnxg2_XWa4PJnG4LD7',
    quotedByTrade: 'Técnico en Instalaciones Sanitarias',
    quoteAmount: 72000,
    phoneContact: '+54 387 566-7788',
    clientName: 'Silvia Albarracín',
    completedJobPhoto: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    completedJobComment: 'Se reemplazó cañería antigua de plomo por termofusión de 3/4 y desagües en PVC reforzado con prueba de presión hidráulica.',
    deviceId: 'DEV-LERMA-6650-1288'
  },
  {
    id: 'req-16',
    title: 'Tablero seccional con disyuntor tetrapolar para taller',
    trade: 'Electricidad e Instalaciones',
    neighborhood: 'Cerrillos',
    description: 'Instalación de tablero estanco IP65 con disyuntor tetrapolar de 40A, seccionamiento por fases para soldadoras y jabalina a tierra con protocolo IRAM.',
    createdAt: 'Hace 1 mes (30 de Septiembre)',
    status: 'completado',
    contractNumber: 'ORD-VALLE-2026-012',
    quotedBy: 'Carlos Mamaní',
    assignedWorkerId: 'carlos-mamani',
    quotedByAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA54etxC3UaV4NwIOym4E6WHdqN1rk9m2u8BFT0eWuME9sCPPkAG7k5lTum0iDVdN_5XvxkXF_67kOKLWA-Yeif37K-wjp6FgLvEbImqqmGgCNKIRWfiSzWCpGpgWOrbsIhRV04KzQkkrptByXWvPEm9e36xuMBe3wioaJVD0RcYwCl-tex6wQNgR7ZgJpExVQ__8Jg6H-q8-BRUKon4_qRTTiZ8PlojJZ6Ocdnxg2_XWa4PJnG4LD7',
    quotedByTrade: 'Electricista Domiciliario Matriculado',
    quoteAmount: 95000,
    phoneContact: '+54 387 433-8821',
    clientName: 'Marcos Vilte',
    completedJobPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    completedJobComment: 'Tablero IP65 con disyuntor diferencial de 40A, seccionamiento por fases y puesta a tierra con protocolo de medición IRAM.',
    deviceId: 'DEV-LERMA-8841-9920'
  },
  {
    id: 'req-17',
    title: 'Techado de galería exterior con chapa trapezoidal negra',
    trade: 'Albañilería y Construcción',
    neighborhood: 'Campo Quijano',
    description: 'Estructura en madera a la vista con tirantes de eucalipto tratado de 3x6, machimbre de 1/2 pulgada, aislante térmico hidrófugo y chapa cincalum trapezoidal.',
    createdAt: 'Hace 2 meses (15 de Agosto)',
    status: 'completado',
    contractNumber: 'ORD-VALLE-2026-008',
    quotedBy: 'Roberto Gómez',
    assignedWorkerId: 'roberto-gomez',
    quotedByAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpq_tkzuBQx2Ou2qFzb63CiAjD0HtMGwGRUGQugoX1X6uxfjdlPdoPz4hZGVk0gpXe4zaZSUO9bDROnwZYEA57LdwmMQLVdKITB7u_fghCDv53bxoRPR_9bn_NgJl2AtDDWKEgqVaKw596ZNsI9NUMxK6Y7tWslswH_JxOfkzy39OSehYmPQQ1JfGZWfqKar0wFElolt5E3pTd5vzDlfAQMGdn0BL3AGV1IASlmRzN2oz5mAkhp9rn',
    quotedByTrade: 'Maestro Mayor de Obras & Albañil',
    quoteAmount: 280000,
    phoneContact: '+54 387 493-2190',
    clientName: 'Raúl Maza',
    completedJobPhoto: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80',
    completedJobComment: 'Estructura en tirantes de eucalipto tratado, machimbre de 1/2 pulgada, aislante térmico hidrófugo y chapa trapezoidal prepintada.',
    deviceId: 'DEV-LERMA-5512-4411'
  }
];

export const INITIAL_FEEDBACKS: UserFeedback[] = [
  {
    id: 'REC-2026-8812',
    type: 'reclamo',
    title: 'Demora en respuesta para trabajo de plomería urgente',
    description: 'El profesional aceptó el contacto para reparar la pérdida debajo de la bacha en El Carril pero luego no contestó los mensajes de WhatsApp para coordinar el horario de visita.',
    deviceId: 'DEV-LERMA-8841-9920',
    userName: 'Familia Morales',
    userPhone: '+54 387 499-1304',
    userNeighborhood: 'El Carril',
    relatedRequestId: 'req-1',
    relatedRequestTitle: 'Reparación de cañería y grifería de cocina',
    relatedProId: 'carlos-mamani',
    relatedProName: 'Carlos Mamaní',
    status: 'pendiente',
    createdAt: '2026-10-30T09:15:00.000Z'
  },
  {
    id: 'REC-2026-7420',
    type: 'reclamo',
    title: 'Faltó retirar restos de escombros de la vereda',
    description: 'La obra de cochera y contrapiso quedó muy firme pero quedaron tres bolsas de áridos y escombros ocupando la vereda en Cerrillos.',
    deviceId: 'DEV-LERMA-4412-3301',
    userName: 'Lucas Pastrana',
    userPhone: '+54 387 512-4490',
    userNeighborhood: 'Cerrillos',
    relatedRequestId: 'req-13',
    relatedRequestTitle: 'Construcción de contrapiso reforzado para cochera de 30m2',
    relatedProId: 'roberto-gomez',
    relatedProName: 'Roberto Gómez',
    status: 'en_revision',
    adminNotes: 'Contactado el prestador Roberto Gómez vía WhatsApp; confirmó que pasa mañana a primera hora con la camioneta a retirar los escombros.',
    createdAt: '2026-10-29T16:20:00.000Z'
  },
  {
    id: 'REC-2026-5910',
    type: 'reclamo',
    title: 'Disyuntor saltaba por sobrecarga en toma de lavarropas',
    description: 'Después de la instalación de térmicas, al encender el lavarropas en conjunto con el calefón eléctrico saltaba la llave general.',
    deviceId: 'DEV-LERMA-1092-7744',
    userName: 'Juan Martín López',
    userPhone: '+54 387 455-8910',
    userNeighborhood: 'Cerrillos',
    relatedRequestId: 'req-2',
    relatedRequestTitle: 'Instalación de disyuntor y térmicas nuevas',
    relatedProId: 'carlos-mamani',
    relatedProName: 'Carlos Mamaní',
    status: 'resuelto',
    adminNotes: 'Carlos Mamaní asistió en garantía el 27/10 y redistribuyó las fases del tablero seccional. Instalación funcionando en óptimas condiciones. Vecino satisfecho.',
    createdAt: '2026-10-25T11:00:00.000Z',
    resolvedAt: '2026-10-27T17:30:00.000Z'
  },
  {
    id: 'REC-2026-6604',
    type: 'sugerencia',
    title: 'Incorporar fletes pesados y mudanzas hacia Salta Capital',
    description: 'Sugiero agregar un filtro para fletes medianos y pesados, porque muchas familias nos mudamos o compramos chapas y perfiles en la ciudad de Salta y necesitamos transporte de confianza.',
    deviceId: 'DEV-LERMA-6650-1288',
    userName: 'Silvia Albarracín',
    userPhone: '+54 387 566-7788',
    userNeighborhood: 'Rosario de Lerma',
    status: 'en_revision',
    adminNotes: 'Excelente iniciativa vecinal. Se sumó la categoría Uber, Traslados y Fletes en la actualización de octubre y se están convocando choferes locales.',
    createdAt: '2026-10-28T14:45:00.000Z'
  },
  {
    id: 'REC-2026-9130',
    type: 'sugerencia',
    title: 'Envío de recordatorio automático por WhatsApp antes de la visita',
    description: 'Sería de gran utilidad que la plataforma envíe un aviso recordatorio 2 horas antes de la visita pactada con el prestador para no olvidar estar en el domicilio.',
    deviceId: 'DEV-LERMA-8841-9920',
    userName: 'Marcos Vilte',
    userPhone: '+54 387 433-8821',
    userNeighborhood: 'La Merced',
    status: 'pendiente',
    createdAt: '2026-10-30T07:45:00.000Z'
  },
  {
    id: 'REC-2026-4822',
    type: 'felicitacion',
    title: 'Excelente atención de Carlos Mamaní en urgencia eléctrica nocturna',
    description: 'Nos quedamos sin luz por cortocircuito un domingo a las 22hs en Cerrillos y vino en menos de 30 minutos a cambiar la térmica principal. Muy profesional y respetuoso.',
    deviceId: 'DEV-LERMA-3319-5562',
    userName: 'Estela Morales',
    userPhone: '+54 387 499-8812',
    userNeighborhood: 'Cerrillos',
    relatedProId: 'carlos-mamani',
    relatedProName: 'Carlos Mamaní',
    status: 'resuelto',
    adminNotes: 'Felicitaciones compartidas con el profesional. Se asignó insignia de Atención de Urgencia Destacada.',
    createdAt: '2026-10-23T20:10:00.000Z',
    resolvedAt: '2026-10-24T09:00:00.000Z'
  },
  {
    id: 'REC-2026-3190',
    type: 'consulta',
    title: 'Requisitos para validar matrícula de gasista oficial',
    description: 'Buenas tardes, soy gasista matriculado de primera categoría en Salta y deseo saber qué documentación presentar para obtener el tilde azul verificado en mi perfil.',
    deviceId: 'DEV-LERMA-7740-9912',
    userName: 'Fabián Colque',
    userPhone: '+54 387 411-9933',
    userNeighborhood: 'Campo Quijano',
    status: 'resuelto',
    adminNotes: 'Se comunicó por WhatsApp que debe adjuntar carnet de matrícula COPIPA/ENARGAS vigente. Documentación validada y credencial asignada en el perfil.',
    createdAt: '2026-10-18T10:30:00.000Z',
    resolvedAt: '2026-10-19T14:00:00.000Z'
  }
];

export const INITIAL_CHAT_LOGS: ChatMessage[] = [
  {
    id: 'msg-demo-1',
    requestId: 'req-1',
    requestTitle: 'Reparación de cañería y grifería de cocina',
    senderId: 'DEV-LERMA-8841-9920',
    senderName: 'Familia Morales',
    senderRole: 'vecino',
    text: 'Hola Carlos, tengo una filtración debajo de la bacha que no para de gotear sobre el bajo mesada. ¿Podrás pasar a verlo hoy?',
    createdAt: '2026-10-30T07:15:00.000Z',
    expiresAt: '2026-11-29T07:15:00.000Z',
    securityLogHash: 'SEC30D-MRLS-8841A',
    deviceId: 'DEV-LERMA-8841-9920',
    read: true
  },
  {
    id: 'msg-demo-2',
    requestId: 'req-1',
    requestTitle: 'Reparación de cañería y grifería de cocina',
    senderId: 'carlos-mamani',
    senderName: 'Carlos Mamaní',
    senderRole: 'prestador',
    text: 'Buenas tardes Familia Morales, sí claro. Estoy en El Carril terminando una conexión. ¿Tienen llave de paso para cortar el agua hasta que llegue?',
    createdAt: '2026-10-30T07:22:00.000Z',
    expiresAt: '2026-11-29T07:22:00.000Z',
    securityLogHash: 'SEC30D-MRLS-8841B',
    deviceId: 'DEV-LERMA-8841-9920',
    read: true
  },
  {
    id: 'msg-demo-3',
    requestId: 'req-1',
    requestTitle: 'Reparación de cañería y grifería de cocina',
    senderId: 'DEV-LERMA-8841-9920',
    senderName: 'Familia Morales',
    senderRole: 'vecino',
    text: 'Sí, ya cortamos la llave de paso del patio. Te esperamos en barrio San Luis manzana 4 casa 12.',
    createdAt: '2026-10-30T07:25:00.000Z',
    expiresAt: '2026-11-29T07:25:00.000Z',
    securityLogHash: 'SEC30D-MRLS-8841C',
    deviceId: 'DEV-LERMA-8841-9920',
    read: true
  },
  {
    id: 'msg-demo-4',
    requestId: 'req-2',
    requestTitle: 'Instalación de disyuntor y térmicas nuevas',
    senderId: 'DEV-LERMA-1092-7744',
    senderName: 'Juan Martín López',
    senderRole: 'vecino',
    text: 'Hola Carlos, ¿cómo estás? Te consulto por el presupuesto para cambiar los tapones viejos por térmicas Schneider y poner disyuntor.',
    createdAt: '2026-10-29T10:30:00.000Z',
    expiresAt: '2026-11-28T10:30:00.000Z',
    securityLogHash: 'SEC30D-LPZ-1092A',
    deviceId: 'DEV-LERMA-1092-7744',
    read: true
  },
  {
    id: 'msg-demo-5',
    requestId: 'req-2',
    requestTitle: 'Instalación de disyuntor y térmicas nuevas',
    senderId: 'carlos-mamani',
    senderName: 'Carlos Mamaní',
    senderRole: 'prestador',
    text: 'Hola Juan Martín. Sí, el presupuesto de mano de obra es de $25.000 con medición de jabalina incluida. Te envié la cotización formal por la plataforma.',
    createdAt: '2026-10-29T11:15:00.000Z',
    expiresAt: '2026-11-28T11:15:00.000Z',
    securityLogHash: 'SEC30D-LPZ-1092B',
    deviceId: 'DEV-LERMA-1092-7744',
    read: true
  },
  {
    id: 'msg-demo-6',
    requestId: 'req-13',
    requestTitle: 'Construcción de contrapiso reforzado para cochera de 30m2',
    senderId: 'DEV-LERMA-4412-3301',
    senderName: 'Lucas Pastrana',
    senderRole: 'vecino',
    text: 'Don Roberto, ¿cómo le va? Ya nos descargaron el camión de arena y cemento en Cerrillos. ¿Arrancamos el lunes?',
    createdAt: '2026-10-24T14:10:00.000Z',
    expiresAt: '2026-11-23T14:10:00.000Z',
    securityLogHash: 'SEC30D-PSTR-4412A',
    deviceId: 'DEV-LERMA-4412-3301',
    read: true
  },
  {
    id: 'msg-demo-7',
    requestId: 'req-13',
    requestTitle: 'Construcción de contrapiso reforzado para cochera de 30m2',
    senderId: 'roberto-gomez',
    senderName: 'Roberto Gómez',
    senderRole: 'prestador',
    text: 'Hola Lucas, excelente. El lunes 7:30 de la mañana estamos con la cuadrilla y la hormigonera para tirar los niveles y hacer el colado.',
    createdAt: '2026-10-24T14:40:00.000Z',
    expiresAt: '2026-11-23T14:40:00.000Z',
    securityLogHash: 'SEC30D-PSTR-4412B',
    deviceId: 'DEV-LERMA-4412-3301',
    read: true
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Juan Martín López',
  avatar: USER_AVATAR_URL,
  neighborhood: 'Cerrillos',
  city: 'Valle de Lerma, Salta',
  email: 'jmlsalta@gmail.com',
  phone: '+54 387 455-8910',
  favorites: ['roberto-gomez', 'carlos-mamani']
};

export const EMERGENCY_NUMBERS = [
  { name: 'Hospital Santa Teresita (Cerrillos)', phone: '0387 499-9022', icon: 'hospital' },
  { name: 'Hospital Dr. Rafael Villagrán (Chicoana)', phone: '0387 490-7023', icon: 'hospital' },
  { name: 'Bomberos Voluntarios del Valle', phone: '0387 499-9100', icon: 'fire_extinguisher' },
  { name: 'Policía del Valle de Lerma (911)', phone: '911', icon: 'shield' },
  { name: 'Gasnor Emergencias de Gas 24hs', phone: '0800 555-8800', icon: 'flame' },
  { name: 'EDESA Guardia de Energía Eléctrica', phone: '0800 777-33372', icon: 'zap' }
];

export const AD_IMAGE_PRESETS = [
  {
    name: 'Ferretería & Bulonería',
    url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=1000',
    category: 'Materiales y Herramientas'
  },
  {
    name: 'Gastronomía & Sandwiches',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1000',
    category: 'Comidas y Minutas'
  },
  {
    name: 'Pinturas & Revestimientos',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=1000',
    category: 'Pinturería'
  },
  {
    name: 'Supermercado & Carnicería',
    url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=1000',
    category: 'Alimentos y Comercio'
  },
  {
    name: 'Climatización & Electro',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1000',
    category: 'Aire & Hogar'
  }
];

export const DAYS_OF_WEEK = [
  { id: 1, label: 'Lunes', short: 'Lun' },
  { id: 2, label: 'Martes', short: 'Mar' },
  { id: 3, label: 'Miércoles', short: 'Mié' },
  { id: 4, label: 'Jueves', short: 'Jue' },
  { id: 5, label: 'Viernes', short: 'Vie' },
  { id: 6, label: 'Sábado', short: 'Sáb' },
  { id: 0, label: 'Domingo', short: 'Dom' },
];

export const formatScheduledDays = (days?: number[]): string => {
  if (!days || days.length === 0 || days.length === 7) {
    return 'Todos los días';
  }
  if (days.length === 2 && days.includes(1) && days.includes(3)) {
    return 'Lunes y Miércoles';
  }
  if (days.length === 2 && days.includes(5) && days.includes(6)) {
    return 'Viernes y Sábados';
  }
  if (days.length === 5 && [1, 2, 3, 4, 5].every(d => days.includes(d))) {
    return 'Lunes a Viernes';
  }
  if (days.length === 2 && days.includes(6) && days.includes(0)) {
    return 'Fines de semana (Sáb y Dom)';
  }

  // Ordered display Lun -> Dom
  const sorted = [...days].sort((a, b) => {
    const orderA = a === 0 ? 7 : a;
    const orderB = b === 0 ? 7 : b;
    return orderA - orderB;
  });

  return sorted
    .map(d => DAYS_OF_WEEK.find(item => item.id === d)?.short || '')
    .filter(Boolean)
    .join(', ');
};

export const isAdScheduledForDay = (ad: AppAdvertisement, dayIndex: number): boolean => {
  if (!ad.enabled) return false;
  if (!ad.daysOfWeek || ad.daysOfWeek.length === 0) return true;
  return ad.daysOfWeek.includes(dayIndex);
};

export const DEFAULT_ADVERTISEMENTS: AppAdvertisement[] = [
  {
    id: 'ad-ferreteria-turco',
    enabled: true,
    title: 'Ferretería y Bulonería El Turco',
    subtitle: 'Cerrillos Centro • Plomería, Electricidad y Pinturas',
    badgeText: 'LUNES Y MIÉRCOLES',
    description: '15% de descuento en herramientas y accesorios para profesionales del Valle de Lerma. Stock completo en caños, cables, fijaciones y herramientas eléctricas.',
    imageUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=1000',
    displayDurationSeconds: 3,
    buttonText: 'Pedir Presupuesto por WhatsApp',
    targetType: 'whatsapp',
    targetWhatsAppNumber: '3875286914',
    targetWhatsAppMessage: 'Hola Ferretería El Turco, vi su publicidad en Oficios Cerrillos y quiero consultar por herramientas y materiales.',
    daysOfWeek: [1, 3], // Lunes y Miércoles
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ad-sandwicheria-tentacion',
    enabled: true,
    title: 'Sandwichería y Minutas Tentación',
    subtitle: 'Cerrillos • Lomitos, Milanesas, Empanadas y Papas',
    badgeText: 'VIERNES Y SÁBADOS',
    description: '¡Los mejores lomitos completos y hamburguesas artesanales de Cerrillos! Delivery nocturno veloz y atención para toda la familia en el fin de semana.',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=1000',
    displayDurationSeconds: 3,
    buttonText: 'Hacer Pedido por WhatsApp',
    targetType: 'whatsapp',
    targetWhatsAppNumber: '3875286914',
    targetWhatsAppMessage: 'Hola Sandwichería Tentación, vi la promo de fin de semana en Oficios Cerrillos y me gustaría hacer un pedido.',
    daysOfWeek: [5, 6], // Viernes y Sábados
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ad-corralon-el-valle',
    enabled: true,
    title: 'Corralón y Cerámicos El Valle',
    subtitle: 'La Merced y Cerrillos • Áridos, Cemento y Ladrillos',
    badgeText: 'MARTES Y JUEVES',
    description: 'Materiales gruesos para construcción y reformas con flete directo a obra en Cerrillos, La Merced y El Carril. Cotización sin cargo.',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1000',
    displayDurationSeconds: 3,
    buttonText: 'Cotizar Materiales por WhatsApp',
    targetType: 'whatsapp',
    targetWhatsAppNumber: '3875286914',
    targetWhatsAppMessage: 'Hola Corralón El Valle, vi la publicidad en la aplicación de Oficios Cerrillos.',
    daysOfWeek: [2, 4], // Martes y Jueves
    updatedAt: new Date().toISOString()
  }
];

export const DEFAULT_ADVERTISEMENT: AppAdvertisement = DEFAULT_ADVERTISEMENTS[0];

export const INITIAL_ACCOUNTS: ProAccount[] = [
  { proId: 'roberto-gomez', username: 'roberto', password: '123', createdAt: new Date().toISOString(), trialDaysTotal: 30 },
  { proId: 'carlos-mamani', username: 'carlos', password: '123', createdAt: new Date().toISOString(), trialDaysTotal: 30 }
];
