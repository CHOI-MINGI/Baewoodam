type CropArea = { x: number; y: number; width: number; height: number };

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = url;
  });
}

export async function getCroppedImg(imageSrc: string, cropArea: CropArea): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // 최대 1200px 너비로 제한
  const scale = Math.min(1, 1200 / cropArea.width);
  canvas.width = Math.round(cropArea.width * scale);
  canvas.height = Math.round(cropArea.height * scale);

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => { blob ? resolve(blob) : reject(new Error('Canvas is empty')); },
      'image/jpeg',
      0.92,
    );
  });
}
