import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Move } from 'lucide-react';
import { PhotoTransform, PosterTemplate } from '../types';
import { loadImageElement, renderPhotoCardToCanvas } from '../utils/canvasRenderer';

interface PhotoCardCanvasProps {
  template: PosterTemplate;
  userImage: HTMLImageElement | null;
  transform: PhotoTransform;
  onChangeTransform: (updater: (prev: PhotoTransform) => PhotoTransform) => void;
  onRequestUpload: () => void;
  onPosterLoaded?: (img: HTMLImageElement | null) => void;
}

export function PhotoCardCanvas({
  template,
  userImage,
  transform,
  onChangeTransform,
  onRequestUpload,
  onPosterLoaded,
}: PhotoCardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [posterImage, setPosterImage] = useState<HTMLImageElement | null>(null);
  const [isLoadingPoster, setIsLoadingPoster] = useState(true);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origOffsetX: number;
    origOffsetY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    origOffsetX: 0,
    origOffsetY: 0,
  });

  const pinchStateRef = useRef<{
    active: boolean;
    startDistance: number;
    startZoom: number;
  }>({
    active: false,
    startDistance: 0,
    startZoom: 1,
  });

  // Load master poster image whenever template.imageUrl changes
  useEffect(() => {
    let cancelled = false;
    setIsLoadingPoster(true);
    setPosterError(null);

    loadImageElement(template.imageUrl)
      .then((img) => {
        if (cancelled) return;
        setPosterImage(img);
        setIsLoadingPoster(false);
        onPosterLoaded?.(img);
      })
      .catch(() => {
        if (cancelled) return;
        setPosterImage(null);
        setIsLoadingPoster(false);
        setPosterError('মাস্টার ফ্রেম ছবিটি লোড করা যায়নি।');
        onPosterLoaded?.(null);
      });

    return () => {
      cancelled = true;
    };
  }, [template.imageUrl, onPosterLoaded]);

  // Re-render canvas whenever poster, user photo, template, or transform changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderPhotoCardToCanvas(canvas, template, posterImage, userImage, transform);
  }, [template, posterImage, userImage, transform]);

  const getTemplateScale = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 1;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return 1;
    return template.width / rect.width;
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!userImage) return;
    e.preventDefault();
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origOffsetX: transform.offsetX,
      origOffsetY: transform.offsetY,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current.active) return;
      const scale = getTemplateScale();
      const dx = (e.clientX - dragStateRef.current.startX) * scale;
      const dy = (e.clientY - dragStateRef.current.startY) * scale;
      onChangeTransform((prev) => ({
        ...prev,
        offsetX: dragStateRef.current.origOffsetX + dx,
        offsetY: dragStateRef.current.origOffsetY + dy,
      }));
    };

    const handleWindowMouseUp = () => {
      if (dragStateRef.current.active) {
        dragStateRef.current.active = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [onChangeTransform, template.width]);

  // Touch drag + two-finger pinch-to-zoom handlers
  const getTouchDistance = (t1: React.Touch, t2: React.Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!userImage) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      pinchStateRef.current.active = false;
      dragStateRef.current = {
        active: true,
        startX: touch.clientX,
        startY: touch.clientY,
        origOffsetX: transform.offsetX,
        origOffsetY: transform.offsetY,
      };
      setIsDragging(true);
    } else if (e.touches.length === 2) {
      dragStateRef.current.active = false;
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      pinchStateRef.current = {
        active: true,
        startDistance: dist,
        startZoom: transform.zoom,
      };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!userImage) return;
    if (e.touches.length === 1 && dragStateRef.current.active) {
      e.preventDefault();
      const touch = e.touches[0];
      const scale = getTemplateScale();
      const dx = (touch.clientX - dragStateRef.current.startX) * scale;
      const dy = (touch.clientY - dragStateRef.current.startY) * scale;
      onChangeTransform((prev) => ({
        ...prev,
        offsetX: dragStateRef.current.origOffsetX + dx,
        offsetY: dragStateRef.current.origOffsetY + dy,
      }));
    } else if (e.touches.length === 2 && pinchStateRef.current.active) {
      e.preventDefault();
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      if (pinchStateRef.current.startDistance > 0) {
        const ratio = dist / pinchStateRef.current.startDistance;
        const nextZoom = Math.min(3.5, Math.max(0.4, pinchStateRef.current.startZoom * ratio));
        onChangeTransform((prev) => ({
          ...prev,
          zoom: Number(nextZoom.toFixed(3)),
        }));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) {
      dragStateRef.current.active = false;
      pinchStateRef.current.active = false;
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      pinchStateRef.current.active = false;
      const touch = e.touches[0];
      dragStateRef.current = {
        active: true,
        startX: touch.clientX,
        startY: touch.clientY,
        origOffsetX: transform.offsetX,
        origOffsetY: transform.offsetY,
      };
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!userImage) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    onChangeTransform((prev) => ({
      ...prev,
      zoom: Number(Math.min(3.5, Math.max(0.4, prev.zoom + delta)).toFixed(3)),
    }));
  };

  // Percentage coordinates for the interactive empty-slot prompt overlay (UI-only, never exported)
  const slotLeftPct = (template.slot.x / template.width) * 100;
  const slotTopPct = (template.slot.y / template.height) * 100;
  const slotWidthPct = (template.slot.width / template.width) * 100;
  const slotHeightPct = (template.slot.height / template.height) * 100;

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      {/* Deeper Electric-Blue Ambient Glow Behind Poster Frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-3xl bg-gradient-to-tr from-blue-700/45 via-sky-500/35 to-blue-600/45 blur-xl"
      />

      {/* Deep Saturated Electric-Blue Neon Border with Rotating Shimmer */}
      <div className="relative overflow-hidden rounded-2xl p-[2.5px] shadow-[0_0_45px_rgba(14,165,233,0.65),0_0_20px_rgba(37,99,235,0.55)]">
        <div
          aria-hidden="true"
          className="animate-rotate-light-slow pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[160%]"
          style={{
            background:
              'conic-gradient(from 0deg, #1d4ed8 0deg, #0284c7 45deg, #38bdf8 85deg, #0ea5e9 130deg, #1e40af 180deg, #0284c7 230deg, #38bdf8 275deg, #0ea5e9 320deg, #1d4ed8 360deg)',
          }}
        />

        {/* Dark Navy Inner Frame Mat */}
        <div className="relative rounded-[13.5px] bg-[#0B132A] p-2.5 sm:p-3.5">
          {/* Poster Container with Crisp Inner Blue Rim */}
          <div
            className="relative overflow-hidden rounded-xl border-2 border-sky-500/55 bg-[#0F1B3D] shadow-[0_0_18px_rgba(14,165,233,0.4)]"
            style={{ aspectRatio: `${template.width} / ${template.height}` }}
          >
        <canvas
          ref={canvasRef}
          width={template.width}
          height={template.height}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className={`block h-full w-full select-none ${
            userImage
              ? isDragging
                ? 'cursor-grabbing touch-none'
                : 'cursor-grab touch-none'
              : 'cursor-pointer'
          }`}
        />

        {/* Clickable Slot Hotspot when no photo is uploaded yet */}
        {!userImage && !isLoadingPoster && !posterError && (
          <button
            type="button"
            onClick={onRequestUpload}
            aria-label="ফ্রেমে আপনার ছবি আপলোড করুন"
            style={{
              left: `${slotLeftPct}%`,
              top: `${slotTopPct}%`,
              width: `${slotWidthPct}%`,
              height: `${slotHeightPct}%`,
            }}
            className="group absolute flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-sky-500/75 bg-sky-950/20 p-2 text-center transition-colors hover:border-white hover:bg-sky-900/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600/90 text-white shadow-lg transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
              <ImagePlus className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </span>
            <span className="mt-1.5 rounded-md bg-[#0B132A]/85 px-2 py-0.5 text-[11px] font-semibold text-white shadow sm:text-xs">
              ছবি বসাতে ট্যাপ করুন
            </span>
          </button>
        )}

        {/* Loading state */}
        {isLoadingPoster && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B132A]/80 text-sky-200">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
            <p className="mt-3 text-sm font-medium">ফটোকার্ড লোড হচ্ছে...</p>
          </div>
        )}

          {/* Error state */}
          {posterError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B132A]/90 p-6 text-center text-rose-200">
              <p className="text-sm font-medium">{posterError}</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Soft Bottom Lighting Reflection Under Poster Frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none mx-auto -mt-0.5 h-px w-3/4 rounded-full bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.45)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none mx-auto h-3 w-2/3 rounded-full bg-gradient-to-b from-cyan-400/20 to-transparent blur-md"
      />

      {/* Active gesture tip when photo is uploaded */}
      {userImage && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-sky-200/90 sm:text-sm">
          <Move className="h-3.5 w-3.5 text-sky-300" aria-hidden="true" />
          <span>ছবিটি ফ্রেমের ভেতর আঙুল বা মাউস দিয়ে টেনে এবং জুম করে ঠিকভাবে বসান</span>
        </p>
      )}
    </div>
  );
}
