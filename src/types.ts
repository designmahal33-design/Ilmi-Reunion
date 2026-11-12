export interface FrameSlot {
  /** X coordinate inside template canvas space (e.g. 0..1080) */
  x: number;
  /** Y coordinate inside template canvas space (e.g. 0..1080) */
  y: number;
  /** Width of the square/rectangular photo slot */
  width: number;
  /** Height of the square/rectangular photo slot */
  height: number;
  /** Border thickness in template pixels */
  borderWidth: number;
  /** Protective frame border color */
  borderColor: string;
  /** Corner radius in template pixels */
  borderRadius: number;
}

export interface PosterTemplate {
  id: string;
  name: string;
  subtitle?: string;
  imageUrl: string;
  width: number;
  height: number;
  slot: FrameSlot;
  published: boolean;
  isDefault?: boolean;
  createdAt: number;
}

export interface PhotoTransform {
  /** Multiplier relative to auto-cover fit (1 = covers frame) */
  zoom: number;
  /** Horizontal offset in template pixels */
  offsetX: number;
  /** Vertical offset in template pixels */
  offsetY: number;
  /** Rotation in degrees (e.g. 0, 90, 180, 270) */
  rotation: number;
}

export const DEFAULT_PHOTO_TRANSFORM: PhotoTransform = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
};
