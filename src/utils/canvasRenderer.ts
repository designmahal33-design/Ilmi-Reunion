import { PhotoTransform, PosterTemplate } from '../types';

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('ছবি লোড করা যায়নি।'));
    img.src = src;
  });
}

function traceRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  if (r === 0) {
    ctx.rect(x, y, width, height);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
  ctx.closePath();
}

export function renderPhotoCardToCanvas(
  canvas: HTMLCanvasElement,
  template: PosterTemplate,
  posterImage: HTMLImageElement | null,
  userImage: HTMLImageElement | null,
  transform: PhotoTransform
): void {
  if (canvas.width !== template.width || canvas.height !== template.height) {
    canvas.width = template.width;
    canvas.height = template.height;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, template.width, template.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw full master poster background untouched
  if (posterImage) {
    ctx.drawImage(posterImage, 0, 0, template.width, template.height);
  } else {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, template.width, template.height);
  }

  // 2. If user uploaded a photo, cover the designated frame slot completely
  const { slot } = template;
  if (userImage && userImage.naturalWidth > 0 && userImage.naturalHeight > 0) {
    ctx.save();
    traceRoundedRect(ctx, slot.x, slot.y, slot.width, slot.height, slot.borderRadius);
    ctx.clip();

    // Clean opaque backdrop inside slot so zero pixels of the old placeholder show
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(slot.x, slot.y, slot.width, slot.height);

    const normalizedRotation = ((transform.rotation % 360) + 360) % 360;
    const isQuarterTurn = normalizedRotation === 90 || normalizedRotation === 270;
    const effectiveImgW = isQuarterTurn ? userImage.naturalHeight : userImage.naturalWidth;
    const effectiveImgH = isQuarterTurn ? userImage.naturalWidth : userImage.naturalHeight;

    // Cover-fit base scale so zoom=1 fills the frame cleanly
    const coverScale = Math.max(slot.width / effectiveImgW, slot.height / effectiveImgH);
    const finalScale = coverScale * transform.zoom;

    const centerX = slot.x + slot.width / 2 + transform.offsetX;
    const centerY = slot.y + slot.height / 2 + transform.offsetY;

    ctx.translate(centerX, centerY);
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.scale(finalScale, finalScale);
    ctx.drawImage(
      userImage,
      -userImage.naturalWidth / 2,
      -userImage.naturalHeight / 2
    );
    ctx.restore();

    // 3. Draw protective frame border so the royal blue outline stays crisp
    if (slot.borderWidth > 0) {
      ctx.save();
      traceRoundedRect(ctx, slot.x, slot.y, slot.width, slot.height, slot.borderRadius);
      ctx.strokeStyle = slot.borderColor || '#097ad0';
      ctx.lineWidth = slot.borderWidth;
      ctx.stroke();
      ctx.restore();
    }
  }
}

export async function exportPhotoCardPng(
  template: PosterTemplate,
  posterImage: HTMLImageElement,
  userImage: HTMLImageElement | null,
  transform: PhotoTransform
): Promise<void> {
  const offscreen = document.createElement('canvas');
  offscreen.width = template.width;
  offscreen.height = template.height;

  renderPhotoCardToCanvas(offscreen, template, posterImage, userImage, transform);

  const blob: Blob | null = await new Promise((resolve) =>
    offscreen.toBlob((b) => resolve(b), 'image/png', 1.0)
  );

  const safeSlug = 'jamia-karimia-photocard';
  const filename = `${safeSlug}-${template.width}x${template.height}.png`;

  if (blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return;
  }

  // Fallback data URL download
  const dataUrl = offscreen.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
