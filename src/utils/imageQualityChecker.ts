/**
 * Utilidad de validación visual de fotos de DNI para prestadores de servicios.
 * Analiza en tiempo real sobre el lienzo HTML5:
 * 1. Nivel de iluminación (Luminancia promedio, subexposición y sobreexposición)
 * 2. Nivel de nitidez / enfoque (Varianza laplaciana en escala estandarizada)
 * 3. Legibilidad general antes de la aprobación del administrador
 */

export interface DniQualityResult {
  isLegible: boolean;
  status: 'optima' | 'borrosa' | 'baja_luz' | 'sobreexpuesta' | 'borrosa_y_oscura';
  sharpnessScore: number; // 0 a 100
  brightnessScore: number; // 0 a 100
  isBlurry: boolean;
  isLowLight: boolean;
  isOverexposed: boolean;
  title: string;
  message: string;
  recommendations: string[];
  metrics: {
    averageLuminance: number; // 0 a 255
    laplacianVariance: number;
    contrast: number;
  };
}

/**
 * Convierte un File o Blob en DataURL
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Carga una imagen en un elemento HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('No se pudo cargar la imagen para análisis visual'));
    img.src = src;
  });
}

/**
 * Analiza la calidad visual de la foto del DNI usando Canvas HTML5
 */
export async function analyzeDniImageQuality(
  imageSource: string | File
): Promise<DniQualityResult> {
  try {
    let dataUrl: string;
    if (typeof imageSource !== 'string') {
      dataUrl = await fileToDataUrl(imageSource);
    } else {
      dataUrl = imageSource;
    }

    if (!dataUrl || !dataUrl.trim()) {
      return getEmptyResult();
    }

    const img = await loadImage(dataUrl);

    // Estandarizamos el tamaño de análisis para que los umbrales de varianza sean constantes
    // independientemente de si la cámara es de 48MP o de 2MP.
    const TARGET_WIDTH = 400;
    const aspectRatio = img.height / (img.width || 1);
    const canvasWidth = TARGET_WIDTH;
    const canvasHeight = Math.max(100, Math.round(TARGET_WIDTH * aspectRatio));

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      return getFallbackResult();
    }

    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;
    const totalPixels = canvasWidth * canvasHeight;

    // 1. ANÁLISIS DE ILUMINACIÓN Y CONTRASTE (LUMINANCIA ITU-R BT.601)
    let sumLuminance = 0;
    let darkPixelCount = 0;
    let brightPixelCount = 0;
    const grayscale = new Float32Array(totalPixels);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Luminancia perceptual
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const pixelIdx = i / 4;
      grayscale[pixelIdx] = lum;
      sumLuminance += lum;

      if (lum < 40) darkPixelCount++;
      if (lum > 225) brightPixelCount++;
    }

    const averageLuminance = sumLuminance / totalPixels;
    const darkRatio = darkPixelCount / totalPixels;
    const brightRatio = brightPixelCount / totalPixels;

    // Calcular desviación estándar de luminancia (contraste general)
    let sumSquaredDiff = 0;
    for (let i = 0; i < totalPixels; i++) {
      const diff = grayscale[i] - averageLuminance;
      sumSquaredDiff += diff * diff;
    }
    const contrast = Math.sqrt(sumSquaredDiff / totalPixels);

    // 2. ANÁLISIS DE NITIDEZ / ENFOQUE (OPERADOR LAPLACIANO 3x3)
    // Kernel Laplaciano omnidireccional:
    // [-1, -1, -1]
    // [-1,  8, -1]
    // [-1, -1, -1]
    let laplacianSum = 0;
    let laplacianSumSq = 0;
    let edgePixelCount = 0;
    let validInteriorPixels = 0;

    for (let y = 1; y < canvasHeight - 1; y++) {
      const rowOffset = y * canvasWidth;
      const topOffset = (y - 1) * canvasWidth;
      const bottomOffset = (y + 1) * canvasWidth;

      for (let x = 1; x < canvasWidth - 1; x++) {
        const center = grayscale[rowOffset + x];
        const lap =
          8 * center -
          (grayscale[topOffset + x - 1] +
            grayscale[topOffset + x] +
            grayscale[topOffset + x + 1] +
            grayscale[rowOffset + x - 1] +
            grayscale[rowOffset + x + 1] +
            grayscale[bottomOffset + x - 1] +
            grayscale[bottomOffset + x] +
            grayscale[bottomOffset + x + 1]);

        laplacianSum += lap;
        laplacianSumSq += lap * lap;
        validInteriorPixels++;

        if (Math.abs(lap) > 30) {
          edgePixelCount++;
        }
      }
    }

    const meanLaplacian = laplacianSum / (validInteriorPixels || 1);
    const laplacianVariance =
      laplacianSumSq / (validInteriorPixels || 1) - meanLaplacian * meanLaplacian;
    const edgeRatio = edgePixelCount / (validInteriorPixels || 1);

    // 3. DETERMINACIÓN DE CONDICIONES Y UMBRALES
    // Baja iluminación: luminancia promedio < 65 o más del 40% de píxeles oscuros
    const isLowLight = averageLuminance < 65 || darkRatio > 0.42;

    // Sobreexposición / reflejo del flash que borra letras:
    const isOverexposed = averageLuminance > 210 || brightRatio > 0.38;

    // Borrosidad / Fuera de foco:
    // Documentos con texto como DNI tienen varianza laplaciana > 160 cuando están nítidos.
    // Menos de 115 indica claramente falta de foco o movimiento de la mano.
    const isBlurry = laplacianVariance < 125 || (edgeRatio < 0.045 && laplacianVariance < 170);

    // Puntajes en escala 0-100 para UI
    // Sharpness: 0 a 100
    let sharpnessScore = Math.min(100, Math.max(10, Math.round((laplacianVariance / 240) * 80 + (edgeRatio * 200))));
    if (isBlurry) sharpnessScore = Math.min(50, Math.max(15, Math.round((laplacianVariance / 130) * 45)));

    // Brightness: 0 a 100 donde 50-75 es ideal
    let brightnessScore = Math.min(100, Math.max(5, Math.round((averageLuminance / 255) * 100)));

    // Legibilidad global
    const isLegible = !isBlurry && !isLowLight && !isOverexposed;

    // Diagnósticos y recomendaciones específicas
    let status: DniQualityResult['status'] = 'optima';
    let title = 'Foto de DNI legible y nítida';
    let message = 'La imagen cuenta con buena iluminación y definición. Los números y datos son perfectamente legibles.';
    const recommendations: string[] = [];

    if (isBlurry && isLowLight) {
      status = 'borrosa_y_oscura';
      title = 'Foto borrosa y con poca luz';
      message = 'La imagen está fuera de foco y tiene baja iluminación. Es muy probable que el administrador no pueda validar tu identidad.';
      recommendations.push('Ubicá el DNI bajo una lámpara o luz natural de día.');
      recommendations.push('Apoyá el celular con ambas manos para evitar que salga movida.');
      recommendations.push('Tocá la pantalla sobre el texto del DNI para forzar el enfoque.');
    } else if (isBlurry) {
      status = 'borrosa';
      title = 'Foto borrosa o fuera de foco';
      message = 'Detectamos que los bordes del texto y los números están difusos. Es necesario que se lean claramente para la aprobación.';
      recommendations.push('Alejá levemente la cámara (a 20-30 cm) para que la lente logre hacer foco.');
      recommendations.push('Mantené el teléfono quieto al disparar.');
      recommendations.push('Asegurate de que no haya dedos tapando los números del DNI.');
    } else if (isLowLight) {
      status = 'baja_luz';
      title = 'Baja iluminación (Foto muy oscura)';
      message = 'La foto tiene sombras muy oscuras. El administrador necesita ver con claridad tu rostro y el número de documento.';
      recommendations.push('Encendé una luz cercana o acercate a una ventana.');
      recommendations.push('Evitá hacer sombra con tu propio teléfono al sacar la foto.');
    } else if (isOverexposed) {
      status = 'sobreexpuesta';
      title = 'Exceso de brillo o reflejo del flash';
      message = 'El brillo o reflejo sobre el plástico del DNI tapa parte de los datos obligatorios.';
      recommendations.push('Desactivá el flash directo.');
      recommendations.push('Incliná ligeramente el documento para esquivar el reflejo directo de la lámpara.');
    } else {
      status = 'optima';
      title = '✓ Foto nítida e iluminada';
      message = 'Tu DNI cumple con los estándares de legibilidad para la aprobación rápida del administrador Jorge Lopez.';
      recommendations.push('Datos y fotografía del titular claramente visibles.');
    }

    return {
      isLegible,
      status,
      sharpnessScore,
      brightnessScore,
      isBlurry,
      isLowLight,
      isOverexposed,
      title,
      message,
      recommendations,
      metrics: {
        averageLuminance: Math.round(averageLuminance),
        laplacianVariance: Math.round(laplacianVariance),
        contrast: Math.round(contrast),
      },
    };
  } catch (err) {
    console.warn('Error al analizar calidad de foto de DNI:', err);
    return getFallbackResult();
  }
}

function getEmptyResult(): DniQualityResult {
  return {
    isLegible: false,
    status: 'baja_luz',
    sharpnessScore: 0,
    brightnessScore: 0,
    isBlurry: true,
    isLowLight: true,
    isOverexposed: false,
    title: 'Sin foto adjunta',
    message: 'Adjuntá o fotografá la foto de tu DNI para verificar su legibilidad.',
    recommendations: ['Es obligatorio subir una foto de tu DNI para verificar tu perfil.'],
    metrics: {
      averageLuminance: 0,
      laplacianVariance: 0,
      contrast: 0,
    },
  };
}

function getFallbackResult(): DniQualityResult {
  return {
    isLegible: true,
    status: 'optima',
    sharpnessScore: 80,
    brightnessScore: 70,
    isBlurry: false,
    isLowLight: false,
    isOverexposed: false,
    title: 'Foto cargada',
    message: 'La foto se cargó correctamente y será revisada por el administrador.',
    recommendations: ['Asegurate de que los números sean visibles.'],
    metrics: {
      averageLuminance: 120,
      laplacianVariance: 200,
      contrast: 50,
    },
  };
}
