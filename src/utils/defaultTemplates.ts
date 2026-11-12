import { PosterTemplate } from '../types';

export const MASTER_POSTER_URL = '/assets/master-poster.jpg';
export const DESIGNER_LOGO_URL = '/assets/designer-logo-badge.jpg';

const TEMPLATES_STORAGE_KEY = 'jka_photocard_templates_v1';
const ACTIVE_TEMPLATE_STORAGE_KEY = 'jka_active_template_id_v1';
const ADMIN_PASSWORD_STORAGE_KEY = 'jka_admin_password_v1';
const FACEBOOK_URL_STORAGE_KEY = 'jka_designer_facebook_url_v1';
const DEFAULT_ADMIN_PASSWORD = 'admin123';
const DEFAULT_FACEBOOK_URL = 'https://web.facebook.com/profile.php?id=61573790572706';

export function loadFacebookUrl(): string {
  try {
    const saved = localStorage.getItem(FACEBOOK_URL_STORAGE_KEY);
    if (!saved || saved === 'https://www.facebook.com') {
      return DEFAULT_FACEBOOK_URL;
    }
    return saved;
  } catch {
    return DEFAULT_FACEBOOK_URL;
  }
}

export function saveFacebookUrl(url: string): void {
  try {
    localStorage.setItem(FACEBOOK_URL_STORAGE_KEY, url.trim() || DEFAULT_FACEBOOK_URL);
  } catch {
    // Ignore storage write error
  }
}

export const DEFAULT_TEMPLATES: PosterTemplate[] = [
  {
    id: 'jka-ilmi-reunion-2026',
    name: 'ইলমি পুনর্মিলনী ও ফিকহি কর্মশালা ২০২৬',
    subtitle: 'জামিয়া কারীমিয়া আরাবিয়া • ১০৮০×১০৮০ মূল ডিজাইন',
    imageUrl: MASTER_POSTER_URL,
    width: 1080,
    height: 1080,
    slot: {
      x: 219,
      y: 613,
      width: 251,
      height: 253,
      borderWidth: 4,
      borderColor: '#097ad0',
      borderRadius: 2,
    },
    published: true,
    isDefault: true,
    createdAt: 1731400000000,
  },
];

export function loadTemplates(): PosterTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return DEFAULT_TEMPLATES;
    const parsed = JSON.parse(raw) as PosterTemplate[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_TEMPLATES;
    }
    return parsed;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function saveTemplates(templates: PosterTemplate[]): boolean {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    return true;
  } catch {
    return false;
  }
}

export function loadActiveTemplateId(templates: PosterTemplate[]): string {
  try {
    const saved = localStorage.getItem(ACTIVE_TEMPLATE_STORAGE_KEY);
    if (saved && templates.some((t) => t.id === saved && t.published)) {
      return saved;
    }
  } catch {
    // Ignore storage read error
  }
  const firstPublished = templates.find((t) => t.published) || templates[0];
  return firstPublished?.id ?? DEFAULT_TEMPLATES[0].id;
}

export function saveActiveTemplateId(templateId: string): void {
  try {
    localStorage.setItem(ACTIVE_TEMPLATE_STORAGE_KEY, templateId);
  } catch {
    // Ignore storage write error
  }
}

export function getAdminPassword(): string {
  try {
    return localStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) || DEFAULT_ADMIN_PASSWORD;
  } catch {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

export function setAdminPassword(newPassword: string): void {
  try {
    localStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, newPassword);
  } catch {
    // Ignore storage write error
  }
}

export function resetTemplatesToDefault(): PosterTemplate[] {
  saveTemplates(DEFAULT_TEMPLATES);
  saveActiveTemplateId(DEFAULT_TEMPLATES[0].id);
  return DEFAULT_TEMPLATES;
}

/**
 * Reads an uploaded poster image file and returns a crisp data URL
 * normalized up to 1440px max edge so it stays lightweight in localStorage
 * while preserving full clarity for 1080×1080 output.
 */
export function processPosterUpload(
  file: File
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে।'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('সঠিক ছবি ফাইল নির্বাচন করুন (PNG বা JPG)।'));
      img.onload = () => {
        const maxDim = 1440;
        const origW = img.naturalWidth || 1080;
        const origH = img.naturalHeight || 1080;
        const ratio = Math.min(1, maxDim / Math.max(origW, origH));
        const targetW = Math.round(origW * ratio);
        const targetH = Math.round(origH * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('ক্যানভাস প্রস্তুত করা যায়নি।'));
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const isPng = file.type === 'image/png';
        const dataUrl = isPng
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', 0.92);

        resolve({
          dataUrl,
          width: targetW,
          height: targetH,
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
