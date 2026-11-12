import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Download,
  RotateCcw,
  RotateCw,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { PhotoTransform, PosterTemplate } from '../types';

interface ToolbarProps {
  hasUserImage: boolean;
  transform: PhotoTransform;
  isExporting: boolean;
  publishedTemplates: PosterTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (id: string) => void;
  onUploadClick: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomChange: (zoom: number) => void;
  onNudge: (dx: number, dy: number) => void;
  onRotate: (deltaDeg: number) => void;
  onReset: () => void;
  onDownload: () => void;
}

export function Toolbar({
  hasUserImage,
  transform,
  isExporting,
  publishedTemplates,
  activeTemplateId,
  onSelectTemplate,
  onUploadClick,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  onNudge,
  onRotate,
  onReset,
  onDownload,
}: ToolbarProps) {
  const zoomPercent = Math.round(transform.zoom * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl p-[1.5px] shadow-[0_0_24px_rgba(14,165,233,0.24),0_12px_40px_rgba(2,8,28,0.65)]">
      {/* Calm Electric-Blue Rotating Light Border Around Control Panel */}
      <div
        aria-hidden="true"
        className="animate-rotate-light-slow pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[170%]"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(14,165,233,0.35) 0deg, #38bdf8 60deg, #0ea5e9 120deg, rgba(14,165,233,0.3) 180deg, rgba(14,165,233,0.35) 240deg, #38bdf8 300deg, rgba(14,165,233,0.35) 360deg)',
        }}
      />

      <section
        aria-label="ছবি নিয়ন্ত্রণ প্যানেল"
        className="relative rounded-[14.5px] bg-[#101C3D]/95 p-4 backdrop-blur-md sm:p-6"
      >
      {/* Template Switcher (only shown if Admin published multiple templates) */}
      {publishedTemplates.length > 1 && (
        <div className="mb-5 border-b border-sky-400/15 pb-4">
          <p className="mb-2.5 text-sm font-medium text-sky-200">ডিজাইন নির্বাচন করুন</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {publishedTemplates.map((tpl) => {
              const selected = tpl.id === activeTemplateId;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onSelectTemplate(tpl.id)}
                  className={`flex items-center gap-2.5 rounded-xl border p-2 text-left transition-colors ${
                    selected
                      ? 'border-sky-400 bg-sky-500/20 text-white'
                      : 'border-sky-300/15 bg-[#0B132A]/60 text-sky-200 hover:border-sky-300/35'
                  }`}
                >
                  <img
                    src={tpl.imageUrl}
                    alt={tpl.name}
                    referrerPolicy="no-referrer"
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                  <span className="line-clamp-2 text-xs font-medium">{tpl.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Action 1: Upload Photo */}
      <button
        type="button"
        onClick={onUploadClick}
        className="flex min-h-[52px] w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 px-6 py-3 text-base font-semibold text-white shadow-[0_0_24px_rgba(56,189,248,0.4)] transition-all hover:brightness-110 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 sm:text-lg"
      >
        <Upload className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{hasUserImage ? 'নতুন ছবি পরিবর্তন করুন' : 'ছবি আপলোড করুন'}</span>
      </button>

      {/* Required Editing Controls Row */}
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={onZoomIn}
          disabled={!hasUserImage}
          className="flex min-h-[48px] flex-col items-center justify-center gap-1 whitespace-nowrap rounded-xl border border-sky-300/20 bg-[#0B132A]/75 px-3 py-2 text-xs font-medium text-sky-100 transition-colors hover:border-sky-300/45 hover:bg-sky-500/15 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-row sm:gap-2 sm:text-sm"
        >
          <ZoomIn className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
          <span>ছবি বড় করুন</span>
        </button>

        <button
          type="button"
          onClick={onZoomOut}
          disabled={!hasUserImage}
          className="flex min-h-[48px] flex-col items-center justify-center gap-1 whitespace-nowrap rounded-xl border border-sky-300/20 bg-[#0B132A]/75 px-3 py-2 text-xs font-medium text-sky-100 transition-colors hover:border-sky-300/45 hover:bg-sky-500/15 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-row sm:gap-2 sm:text-sm"
        >
          <ZoomOut className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
          <span>ছবি ছোট করুন</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasUserImage}
          className="flex min-h-[48px] flex-col items-center justify-center gap-1 whitespace-nowrap rounded-xl border border-sky-300/20 bg-[#0B132A]/75 px-3 py-2 text-xs font-medium text-sky-100 transition-colors hover:border-sky-300/45 hover:bg-sky-500/15 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-row sm:gap-2 sm:text-sm"
        >
          <RotateCcw className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
          <span>আবার ঠিক করুন</span>
        </button>
      </div>

      {/* Precision Controls (Slider + Nudge + Rotate) */}
      <div className="mt-4 space-y-4 rounded-xl border border-sky-400/15 bg-[#0B132A]/60 p-4">
        {/* Zoom Slider */}
        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-sky-200 sm:text-sm">
            <span>ছবির আকার (জুম)</span>
            <span className="tabular-nums text-sky-300">{zoomPercent}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={350}
            step={2}
            value={zoomPercent}
            disabled={!hasUserImage}
            onChange={(e) => onZoomChange(Number(e.target.value) / 100)}
            aria-label="ছবির জুম পরিমাণ"
            className="studio-slider w-full disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>

        {/* Fine Movement & 90° Rotation */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5" role="group" aria-label="ছবি সূক্ষ্মভাবে সরান">
            <button
              type="button"
              onClick={() => onNudge(-8, 0)}
              disabled={!hasUserImage}
              title="বামে সরান"
              aria-label="বামে সরান"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-sky-300/20 bg-[#101C3D] text-sky-100 transition-colors hover:border-sky-300/45 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNudge(0, -8)}
              disabled={!hasUserImage}
              title="উপরে সরান"
              aria-label="উপরে সরান"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-sky-300/20 bg-[#101C3D] text-sky-100 transition-colors hover:border-sky-300/45 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNudge(0, 8)}
              disabled={!hasUserImage}
              title="নিচে সরান"
              aria-label="নিচে সরান"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-sky-300/20 bg-[#101C3D] text-sky-100 transition-colors hover:border-sky-300/45 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNudge(8, 0)}
              disabled={!hasUserImage}
              title="ডানে সরান"
              aria-label="ডানে সরান"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-sky-300/20 bg-[#101C3D] text-sky-100 transition-colors hover:border-sky-300/45 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center gap-1.5" role="group" aria-label="ছবি ঘোরান">
            <button
              type="button"
              onClick={() => onRotate(-90)}
              disabled={!hasUserImage}
              title="বামে ৯০° ঘোরান"
              aria-label="বামে ৯০ ডিগ্রি ঘোরান"
              className="flex h-11 items-center gap-1.5 whitespace-nowrap rounded-lg border border-sky-300/20 bg-[#101C3D] px-3 text-xs font-medium text-sky-100 transition-colors hover:border-sky-300/45 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-4 w-4 text-sky-300" aria-hidden="true" />
              <span>৯০°</span>
            </button>
            <button
              type="button"
              onClick={() => onRotate(90)}
              disabled={!hasUserImage}
              title="ডানে ৯০° ঘোরান"
              aria-label="ডানে ৯০ ডিগ্রি ঘোরান"
              className="flex h-11 items-center gap-1.5 whitespace-nowrap rounded-lg border border-sky-300/20 bg-[#101C3D] px-3 text-xs font-medium text-sky-100 transition-colors hover:border-sky-300/45 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCw className="h-4 w-4 text-sky-300" aria-hidden="true" />
              <span>৯০°</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Action 5: Download Full-Quality PNG */}
      <button
        type="button"
        onClick={onDownload}
        disabled={isExporting}
        className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-base font-semibold text-white shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 sm:text-lg"
      >
        <Download className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span>{isExporting ? 'ডাউনলোড প্রস্তুত হচ্ছে...' : 'ছবি ডাউনলোড করুন'}</span>
      </button>

      {!hasUserImage && (
        <p className="mt-2.5 text-center text-xs text-sky-200/75">
          প্রথমে আপনার ছবি আপলোড করে ফ্রেমে সেট করুন, তারপর PNG হিসেবে ডাউনলোড করুন।
        </p>
      )}
      </section>
    </div>
  );
}
