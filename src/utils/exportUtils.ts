import html2canvas from 'html2canvas';

export async function exportAsJpg(element: HTMLElement, fileName: string = '학급배치표.jpg'): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // high resolution for clean printing/export
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to export image:', err);
    throw err;
  }
}

export async function copyImageToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          // navigator.clipboard.write might require permission
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob,
            }),
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}

export function triggerPrint(): void {
  window.print();
}
