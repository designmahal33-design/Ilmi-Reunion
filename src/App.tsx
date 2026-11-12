import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminModal } from './components/AdminModal';
import { Header } from './components/Header';
import { HelpModal } from './components/HelpModal';
import { PhotoCardCanvas } from './components/PhotoCardCanvas';
import { Toolbar } from './components/Toolbar';
import { DEFAULT_PHOTO_TRANSFORM, PhotoTransform, PosterTemplate } from './types';
import { exportPhotoCardPng, loadImageElement } from './utils/canvasRenderer';
import {
  DESIGNER_LOGO_URL,
  loadActiveTemplateId,
  loadFacebookUrl,
  loadTemplates,
  saveActiveTemplateId,
  saveFacebookUrl,
  saveTemplates,
} from './utils/defaultTemplates';

export default function App() {
  const [templates, setTemplates] = useState<PosterTemplate[]>(() => loadTemplates());
  const [activeTemplateId, setActiveTemplateId] = useState<string>(() =>
    loadActiveTemplateId(loadTemplates())
  );
  const [facebookUrl, setFacebookUrl] = useState<string>(() => loadFacebookUrl());

  const [userImage, setUserImage] = useState<HTMLImageElement | null>(null);
  const [posterImage, setPosterImage] = useState<HTMLImageElement | null>(null);
  const [transform, setTransform] = useState<PhotoTransform>(DEFAULT_PHOTO_TRANSFORM);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const footerTapRef = useRef<{ count: number; lastTap: number }>({
    count: 0,
    lastTap: 0,
  });

  const publishedTemplates = useMemo(
    () => templates.filter((t) => t.published),
    [templates]
  );

  const activeTemplate = useMemo(
    () =>
      publishedTemplates.find((t) => t.id === activeTemplateId) ||
      publishedTemplates[0] ||
      templates[0],
    [publishedTemplates, activeTemplateId, templates]
  );

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Secret Admin access triggers: /admin, ?admin, ?mode=admin, #admin, #/admin, Ctrl+Shift+A
  useEffect(() => {
    const checkAdminUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase().replace(/\/+$/, '');
      if (
        params.has('admin') ||
        params.get('mode') === 'admin' ||
        hash === '#admin' ||
        hash === '#/admin' ||
        path === '/admin'
      ) {
        setIsAdminOpen(true);
      }
    };

    checkAdminUrl();
    window.addEventListener('hashchange', checkAdminUrl);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', checkAdminUrl);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSecretFooterTap = () => {
    const now = Date.now();
    if (now - footerTapRef.current.lastTap > 1200) {
      footerTapRef.current.count = 1;
    } else {
      footerTapRef.current.count += 1;
    }
    footerTapRef.current.lastTap = now;

    if (footerTapRef.current.count >= 3) {
      footerTapRef.current.count = 0;
      setIsAdminOpen(true);
    }
  };

  const handleUpdateTemplates = (next: PosterTemplate[]) => {
    setTemplates(next);
    const saved = saveTemplates(next);
    if (!saved) {
      showToast('সতর্কতা: ব্রাউজার স্টোরেজ পূর্ণ, ছোট সাইজের ছবি ব্যবহার করুন।');
    }
  };

  const handleSelectTemplate = (id: string) => {
    setActiveTemplateId(id);
    saveActiveTemplateId(id);
    setTransform(DEFAULT_PHOTO_TRANSFORM);
  };

  const handleUserFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await loadImageElement(objectUrl);
      setUserImage(img);
      setTransform(DEFAULT_PHOTO_TRANSFORM);
      showToast('ছবি সফলভাবে ফ্রেমে যুক্ত হয়েছে! আঙুল বা মাউস দিয়ে অবস্থান ঠিক করুন।');
    } catch {
      URL.revokeObjectURL(objectUrl);
      showToast('ছবিটি লোড করা যায়নি। অনুগ্রহ করে JPG বা PNG ছবি দিন।');
    }
  };

  const handleZoomIn = () => {
    setTransform((prev) => ({
      ...prev,
      zoom: Number(Math.min(3.5, prev.zoom + 0.12).toFixed(3)),
    }));
  };

  const handleZoomOut = () => {
    setTransform((prev) => ({
      ...prev,
      zoom: Number(Math.max(0.4, prev.zoom - 0.12).toFixed(3)),
    }));
  };

  const handleZoomChange = (zoom: number) => {
    setTransform((prev) => ({
      ...prev,
      zoom: Number(Math.min(3.5, Math.max(0.4, zoom)).toFixed(3)),
    }));
  };

  const handleNudge = (dx: number, dy: number) => {
    setTransform((prev) => ({
      ...prev,
      offsetX: prev.offsetX + dx,
      offsetY: prev.offsetY + dy,
    }));
  };

  const handleRotate = (deltaDeg: number) => {
    setTransform((prev) => ({
      ...prev,
      rotation: (prev.rotation + deltaDeg) % 360,
    }));
  };

  const handleReset = () => {
    setTransform(DEFAULT_PHOTO_TRANSFORM);
  };

  const handleDownload = async () => {
    if (!posterImage || !activeTemplate) {
      showToast('পোস্টার প্রস্তুত হচ্ছে, অনুগ্রহ করে একটু অপেক্ষা করুন।');
      return;
    }

    setIsExporting(true);
    try {
      await exportPhotoCardPng(activeTemplate, posterImage, userImage, transform);
      showToast('ফটোকার্ড PNG ফরম্যাটে সফলভাবে ডাউনলোড হয়েছে।');
    } catch {
      showToast('ডাউনলোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0B132A] text-slate-100">
      {/* Subtle Ambient Radial Light Spotlights Across #0B132A Canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-36 left-1/2 h-[440px] w-[760px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[130px]" />
        <div className="absolute left-1/4 top-1/2 h-[340px] w-[420px] -translate-y-1/2 rounded-full bg-cyan-400/6 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-[280px] w-[860px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[130px]" />
      </div>

      {/* Header & Main Bengali Event Typography */}
      <Header onOpenHelp={() => setIsHelpOpen(true)} />

      {/* Hidden File Input for Gallery / Computer Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUserFileSelected}
        className="hidden"
      />

      {/* Main Workspace */}
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-2 sm:px-6 lg:pb-16">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left / Top: Interactive 1080x1080 Photo Card Canvas with Lighting Aura */}
          <div className="lg:col-span-7">
            <PhotoCardCanvas
              template={activeTemplate}
              userImage={userImage}
              transform={transform}
              onChangeTransform={setTransform}
              onRequestUpload={() => fileInputRef.current?.click()}
              onPosterLoaded={setPosterImage}
            />
          </div>

          {/* Right / Bottom: Editing Controls & Download Panel */}
          <div className="lg:col-span-5">
            <Toolbar
              hasUserImage={Boolean(userImage)}
              transform={transform}
              isExporting={isExporting}
              publishedTemplates={publishedTemplates}
              activeTemplateId={activeTemplate.id}
              onSelectTemplate={handleSelectTemplate}
              onUploadClick={() => fileInputRef.current?.click()}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomChange={handleZoomChange}
              onNudge={handleNudge}
              onRotate={handleRotate}
              onReset={handleReset}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-xl border border-sky-400/35 bg-[#0F1B3D]/95 px-5 py-3 text-center text-sm font-medium text-white shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md"
        >
          {toastMessage}
        </div>
      )}

      {/* Illuminated Footer with Subtle Sweeping Top Light Strip & Rotating Light Designer Card */}
      <footer className="relative z-10 mt-auto bg-[#080E21]/95">
        {/* Soft Cyan-Blue Sweeping Top Light Beam Strip */}
        <div
          aria-hidden="true"
          className="relative h-px w-full overflow-hidden bg-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.45)]"
        >
          <div className="animate-light-sweep h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-200/75 to-transparent" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none mx-auto -mt-1 h-6 w-3/4 bg-gradient-to-b from-cyan-400/15 to-transparent blur-xl"
        />

        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 pb-8 pt-4 sm:flex-row sm:px-6">
          {/* Left: Copyright + Secret Triple-Tap Admin Trigger */}
          <div className="text-center sm:text-left">
            <button
              type="button"
              onClick={handleSecretFooterTap}
              className="cursor-default select-none text-sm font-medium text-sky-200/85 focus:outline-none"
            >
              © জামিয়া কারীমিয়া আরাবিয়া
            </button>
            <p className="mt-0.5 text-xs text-sky-300/65">
              রামপুরা মাদরাসা, ঢাকা-১২১৯ · ইফতা বিভাগ ১৪৪৭-৪৮ হিজরি
            </p>
          </div>

          {/* Right: Designer Credit Card + Facebook Icon Beside It */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:justify-end">
            <div className="flex items-center gap-4 rounded-2xl border-2 border-sky-400 bg-white px-5 py-2.5 text-slate-900 ring-4 ring-sky-400/30 shadow-[0_0_26px_rgba(14,165,233,0.45)] sm:gap-5 sm:px-6">
              <p className="whitespace-nowrap text-sm font-bold text-slate-900 sm:text-base">
                Designer:{' '}
                <span className="text-[#1e3a8a]">H.M. Ashikur Rahman</span>
              </p>

              <span
                aria-hidden="true"
                className="h-9 w-px shrink-0 bg-slate-200"
              />

              <div className="shrink-0">
                <img
                  src={DESIGNER_LOGO_URL}
                  alt="Design Mahal — Creative Design Studio"
                  referrerPolicy="no-referrer"
                  className="h-11 w-auto object-contain sm:h-12"
                />
              </div>
            </div>

            <div className="relative shrink-0">
              {/* Ambient Electric-Blue Glow Behind Facebook Icon */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1.5 rounded-full bg-sky-500/45 blur-md"
              />

              {/* Rotating Light Ring Around Facebook Icon */}
              <div className="relative overflow-hidden rounded-full p-[2px] shadow-[0_0_26px_rgba(24,119,242,0.75)]">
                <div
                  aria-hidden="true"
                  className="animate-rotate-light-slow pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[170%]"
                  style={{
                    background:
                      'conic-gradient(from 0deg, #1d4ed8 0deg, #38bdf8 70deg, #ffffff 110deg, #0ea5e9 155deg, #1d4ed8 210deg, #38bdf8 280deg, #1d4ed8 360deg)',
                  }}
                />

                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Design Mahal Facebook"
                  title="Facebook"
                  className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2] text-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6 drop-shadow-[0_0_6px_rgba(255,255,255,0.65)]"
                    aria-hidden="true"
                  >
                    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.78-3.91 1.1 0 2.25.2 2.25.2v2.48h-1.27c-1.25 0-1.64.78-1.64 1.58v1.87h2.79l-.45 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Hidden Password-Protected Admin Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        templates={templates}
        activeTemplateId={activeTemplate.id}
        facebookUrl={facebookUrl}
        onUpdateTemplates={handleUpdateTemplates}
        onSelectActiveTemplate={handleSelectTemplate}
        onUpdateFacebookUrl={(url) => {
          const cleaned =
            url.trim() || 'https://web.facebook.com/profile.php?id=61573790572706';
          setFacebookUrl(cleaned);
          saveFacebookUrl(cleaned);
        }}
      />
    </div>
  );
}
