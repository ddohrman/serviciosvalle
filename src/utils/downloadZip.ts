/**
 * Utility to download the full project zip file with size validation
 * to prevent SPA HTML 404 fallback interception.
 */

export interface DownloadResult {
  success: boolean;
  sizeBytes?: number;
  sizeFormatted?: string;
  error?: string;
}

export async function downloadProjectZip(): Promise<DownloadResult> {
  const url = `/oficios-valle-de-lerma.zip?v=${Date.now()}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/zip, application/octet-stream, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`El servidor respondió con código HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error(
        'El servidor devolvió una página HTML en lugar del archivo comprimido. Si estás en el enlace público, por favor presiona el botón "Publish" arriba a la derecha en AI Studio para desplegar el archivo.'
      );
    }

    const blob = await response.blob();
    const size = blob.size;

    // A valid project zip is ~2.2 MB (approx 2,250,000 bytes).
    // An index.html fallback is around 2-15 KB (< 50,000 bytes).
    if (size < 100000) {
      throw new Error(
        `El archivo recibido pesa solo ${(size / 1024).toFixed(1)} KB (parece ser una página web de error). Si estás en la vista previa de AI Studio, haz clic en el botón de recargar (🔄) de la barra superior. Si estás en la web publicada, haz clic en "Publish" para actualizarla.`
      );
    }

    // Format size for display (e.g. "2.15 MB")
    const sizeFormatted = (size / (1024 * 1024)).toFixed(2) + ' MB';

    // Create a real blob download
    const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/zip' }));
    const tempLink = document.createElement('a');
    tempLink.href = blobUrl;
    tempLink.setAttribute('download', 'oficios-valle-de-lerma-proyecto-completo.zip');
    document.body.appendChild(tempLink);
    tempLink.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      tempLink.remove();
    }, 5000);

    return {
      success: true,
      sizeBytes: size,
      sizeFormatted,
    };
  } catch (err: any) {
    console.error('Error al descargar ZIP:', err);
    return {
      success: false,
      error: err.message || 'Error desconocido al descargar el archivo ZIP.',
    };
  }
}
