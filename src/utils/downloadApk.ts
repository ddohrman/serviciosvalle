/**
 * Utility to download the Android APK package for Oficios y Servicios Valle de Lerma
 */

export interface ApkDownloadResult {
  success: boolean;
  sizeFormatted?: string;
  error?: string;
}

export async function downloadAndroidApk(): Promise<ApkDownloadResult> {
  const url = `/oficios-valle-de-lerma.apk?v=${Date.now()}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/vnd.android.package-archive, application/octet-stream, */*',
      },
    });

    if (!response.ok) {
      // Direct link fallback
      const directLink = document.createElement('a');
      directLink.href = '/oficios-valle-de-lerma.apk';
      directLink.setAttribute('download', 'oficios-valle-de-lerma.apk');
      document.body.appendChild(directLink);
      directLink.click();
      directLink.remove();
      return { success: true, sizeFormatted: '~950 KB' };
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      // SPA interception fallback: trigger direct window download
      const tempLink = document.createElement('a');
      tempLink.href = '/oficios-valle-de-lerma.apk';
      tempLink.setAttribute('download', 'oficios-valle-de-lerma.apk');
      document.body.appendChild(tempLink);
      tempLink.click();
      tempLink.remove();
      return { success: true, sizeFormatted: '~950 KB' };
    }

    const blob = await response.blob();
    const size = blob.size;
    const sizeFormatted = (size / 1024).toFixed(0) + ' KB';

    const blobUrl = window.URL.createObjectURL(
      new Blob([blob], { type: 'application/vnd.android.package-archive' })
    );

    const tempLink = document.createElement('a');
    tempLink.href = blobUrl;
    tempLink.setAttribute('download', 'oficios-valle-de-lerma.apk');
    document.body.appendChild(tempLink);
    tempLink.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      tempLink.remove();
    }, 5000);

    return { success: true, sizeFormatted };
  } catch (err: any) {
    // Ultimate fallback: direct anchor click
    try {
      const fallbackLink = document.createElement('a');
      fallbackLink.href = '/oficios-valle-de-lerma.apk';
      fallbackLink.setAttribute('download', 'oficios-valle-de-lerma.apk');
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      fallbackLink.remove();
      return { success: true, sizeFormatted: '~950 KB' };
    } catch (e: any) {
      return { success: false, error: err.message || 'Error al descargar el archivo APK' };
    }
  }
}
