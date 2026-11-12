import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { PosterTemplate } from '../types';
import {
  getAdminPassword,
  processPosterUpload,
  resetTemplatesToDefault,
  setAdminPassword,
} from '../utils/defaultTemplates';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: PosterTemplate[];
  activeTemplateId: string;
  facebookUrl: string;
  onUpdateTemplates: (next: PosterTemplate[]) => void;
  onSelectActiveTemplate: (id: string) => void;
  onUpdateFacebookUrl: (url: string) => void;
}

export function AdminModal({
  isOpen,
  onClose,
  templates,
  activeTemplateId,
  facebookUrl,
  onUpdateTemplates,
  onSelectActiveTemplate,
  onUpdateFacebookUrl,
}: AdminModalProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [fbInput, setFbInput] = useState(facebookUrl);

  const [selectedEditId, setSelectedEditId] = useState<string>(
    activeTemplateId || templates[0]?.id || ''
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const posterUploadRef = useRef<HTMLInputElement | null>(null);
  const replacePosterRef = useRef<HTMLInputElement | null>(null);
  const jsonImportRef = useRef<HTMLInputElement | null>(null);
  const calibratorRef = useRef<HTMLDivElement | null>(null);

  const dragOpRef = useRef<{
    mode: 'move' | 'resize' | null;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  }>({
    mode: null,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    origW: 0,
    origH: 0,
  });

  useEffect(() => {
    if (!templates.some((t) => t.id === selectedEditId) && templates[0]) {
      setSelectedEditId(templates[0].id);
    }
  }, [templates, selectedEditId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const editingTemplate =
    templates.find((t) => t.id === selectedEditId) || templates[0] || null;

  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === getAdminPassword()) {
      setIsUnlocked(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  const updateTemplateById = (
    id: string,
    updater: (tpl: PosterTemplate) => PosterTemplate
  ) => {
    const next = templates.map((t) => (t.id === id ? updater(t) : t));
    onUpdateTemplates(next);
  };

  const handleNewTemplateFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const { dataUrl } = await processPosterUpload(file);
      const id = `tpl-${Date.now()}`;
      const newTpl: PosterTemplate = {
        id,
        name: file.name.replace(/\.[^.]+$/, '') || 'নতুন ফটোকার্ড ডিজাইন',
        subtitle: 'কাস্টম ডিজাইন • ১০৮০×১০৮০',
        imageUrl: dataUrl,
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
        createdAt: Date.now(),
      };
      onUpdateTemplates([newTpl, ...templates]);
      setSelectedEditId(id);
      onSelectActiveTemplate(id);
      showNotice('নতুন ডিজাইন সফলভাবে আপলোড ও সক্রিয় করা হয়েছে।');
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'ডিজাইন আপলোড ব্যর্থ হয়েছে।');
    }
  };

  const handleReplaceTemplateImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !editingTemplate) return;

    try {
      const { dataUrl } = await processPosterUpload(file);
      updateTemplateById(editingTemplate.id, (t) => ({
        ...t,
        imageUrl: dataUrl,
      }));
      showNotice('ডিজাইনের ছবি সফলভাবে পরিবর্তন করা হয়েছে।');
    } catch (err) {
      showNotice(err instanceof Error ? err.message : 'ছবি পরিবর্তন করা যায়নি।');
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (templates.length <= 1) {
      showNotice('অন্তত একটি ডিজাইন রাখা আবশ্যক।');
      return;
    }
    const remaining = templates.filter((t) => t.id !== id);
    onUpdateTemplates(remaining);
    if (activeTemplateId === id) {
      const fallback = remaining.find((t) => t.published) || remaining[0];
      if (fallback) onSelectActiveTemplate(fallback.id);
    }
    if (selectedEditId === id && remaining[0]) {
      setSelectedEditId(remaining[0].id);
    }
    showNotice('ডিজাইনটি তালিকা থেকে মুছে ফেলা হয়েছে।');
  };

  const handleTogglePublish = (id: string) => {
    const target = templates.find((t) => t.id === id);
    if (!target) return;
    const publishedCount = templates.filter((t) => t.published).length;
    if (target.published && publishedCount <= 1) {
      showNotice('অন্তত একটি ডিজাইন প্রকাশিত থাকতে হবে।');
      return;
    }
    const next = templates.map((t) =>
      t.id === id ? { ...t, published: !t.published } : t
    );
    onUpdateTemplates(next);
    if (target.published && activeTemplateId === id) {
      const another = next.find((t) => t.published);
      if (another) onSelectActiveTemplate(another.id);
    }
  };

  const handleExportJsonBackup = () => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jka-photocard-templates-backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showNotice('ব্যাকআপ JSON ফাইল ডাউনলোড হয়েছে।');
  };

  const handleImportJsonBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as PosterTemplate[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
          showNotice('সঠিক ব্যাকআপ ফাইল নয়।');
          return;
        }
        onUpdateTemplates(parsed);
        const firstPub = parsed.find((t) => t.published) || parsed[0];
        if (firstPub) {
          setSelectedEditId(firstPub.id);
          onSelectActiveTemplate(firstPub.id);
        }
        showNotice('ব্যাকআপ সফলভাবে রিস্টোর করা হয়েছে।');
      } catch {
        showNotice('JSON ফাইল পড়তে সমস্যা হয়েছে।');
      }
    };
    reader.readAsText(file);
  };

  // Interactive Frame Calibrator pointer handlers
  const startCalibratorOp = (
    mode: 'move' | 'resize',
    clientX: number,
    clientY: number
  ) => {
    if (!editingTemplate) return;
    dragOpRef.current = {
      mode,
      startX: clientX,
      startY: clientY,
      origX: editingTemplate.slot.x,
      origY: editingTemplate.slot.y,
      origW: editingTemplate.slot.width,
      origH: editingTemplate.slot.height,
    };
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      const op = dragOpRef.current;
      if (!op.mode || !calibratorRef.current || !editingTemplate) return;
      const rect = calibratorRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const scaleX = editingTemplate.width / rect.width;
      const scaleY = editingTemplate.height / rect.height;
      const dx = Math.round((clientX - op.startX) * scaleX);
      const dy = Math.round((clientY - op.startY) * scaleY);

      if (op.mode === 'move') {
        const nextX = Math.max(
          0,
          Math.min(editingTemplate.width - op.origW, op.origX + dx)
        );
        const nextY = Math.max(
          0,
          Math.min(editingTemplate.height - op.origH, op.origY + dy)
        );
        updateTemplateById(editingTemplate.id, (t) => ({
          ...t,
          slot: { ...t.slot, x: nextX, y: nextY },
        }));
      } else if (op.mode === 'resize') {
        const nextW = Math.max(
          60,
          Math.min(editingTemplate.width - op.origX, op.origW + dx)
        );
        const nextH = Math.max(
          60,
          Math.min(editingTemplate.height - op.origY, op.origH + dy)
        );
        updateTemplateById(editingTemplate.id, (t) => ({
          ...t,
          slot: { ...t.slot, width: nextW, height: nextH },
        }));
      }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (dragOpRef.current.mode && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onEnd = () => {
      dragOpRef.current.mode = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [editingTemplate, templates]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-sky-400/25 bg-[#0F1A38] text-slate-100 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-sky-400/15 bg-[#0B132A] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-sky-400" aria-hidden="true" />
            <h2 id="admin-modal-title" className="text-lg font-bold text-white">
              নিরাপদ অ্যাডমিন প্যানেল
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="অ্যাডমিন প্যানেল বন্ধ করুন"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-500/10 text-sky-200 transition-colors hover:bg-sky-500/25"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        {!isUnlocked ? (
          <form
            onSubmit={handleLogin}
            className="mx-auto my-10 w-full max-w-sm space-y-4 px-5"
          >
            <div className="rounded-xl border border-sky-400/20 bg-[#0B132A]/80 p-5 text-center">
              <KeyRound className="mx-auto h-9 w-9 text-sky-400" aria-hidden="true" />
              <h3 className="mt-3 text-base font-semibold text-white">
                অ্যাডমিন পাসওয়ার্ড দিন
              </h3>
              <p className="mt-1 text-xs text-sky-200/75">
                ডিজাইন ও ছবির ফ্রেম নিয়ন্ত্রণ করতে পাসওয়ার্ড দিয়ে প্রবেশ করুন
              </p>

              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন..."
                autoFocus
                className="mt-4 w-full rounded-xl border border-sky-300/25 bg-[#101C3D] px-4 py-2.5 text-sm text-white placeholder-sky-200/40 focus:border-sky-400 focus:outline-none"
              />

              {authError && (
                <p className="mt-2 text-xs font-medium text-rose-400">{authError}</p>
              )}

              <button
                type="submit"
                className="mt-4 min-h-[44px] w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-400"
              >
                প্রবেশ করুন
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {statusMessage && (
              <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-sm font-medium text-emerald-200">
                {statusMessage}
              </div>
            )}

            {/* Top Action Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-400/15 bg-[#0B132A]/70 p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => posterUploadRef.current?.click()}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-sky-400 sm:text-sm"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>নতুন ডিজাইন আপলোড</span>
                </button>
                <input
                  ref={posterUploadRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleNewTemplateFile}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handleExportJsonBackup}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-sky-300/25 bg-[#101C3D] px-3.5 py-2 text-xs font-medium text-sky-100 hover:bg-sky-500/20"
                >
                  <Download className="h-4 w-4 text-sky-300" aria-hidden="true" />
                  <span>ব্যাকআপ এক্সপোর্ট</span>
                </button>

                <button
                  type="button"
                  onClick={() => jsonImportRef.current?.click()}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-sky-300/25 bg-[#101C3D] px-3.5 py-2 text-xs font-medium text-sky-100 hover:bg-sky-500/20"
                >
                  <Upload className="h-4 w-4 text-sky-300" aria-hidden="true" />
                  <span>ব্যাকআপ ইমপোর্ট</span>
                </button>
                <input
                  ref={jsonImportRef}
                  type="file"
                  accept="application/json"
                  onChange={handleImportJsonBackup}
                  className="hidden"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const defaults = resetTemplatesToDefault();
                  onUpdateTemplates(defaults);
                  setSelectedEditId(defaults[0].id);
                  onSelectActiveTemplate(defaults[0].id);
                  showNotice('মূল ডিফল্ট ডিজাইনে রিসেট করা হয়েছে।');
                }}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200 hover:bg-amber-500/20"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>ডিফল্ট রিসেট</span>
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column: Saved Templates List */}
              <div className="space-y-3 lg:col-span-4">
                <h3 className="text-sm font-semibold text-sky-200">
                  সংরক্ষিত ডিজাইন ({templates.length})
                </h3>

                <div className="space-y-2.5">
                  {templates.map((tpl) => {
                    const isEditing = editingTemplate?.id === tpl.id;
                    const isActive = activeTemplateId === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        className={`rounded-xl border p-3 transition-colors ${
                          isEditing
                            ? 'border-sky-400 bg-sky-500/15'
                            : 'border-sky-400/15 bg-[#0B132A]/70'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedEditId(tpl.id)}
                          className="flex w-full items-center gap-3 text-left"
                        >
                          <img
                            src={tpl.imageUrl}
                            alt={tpl.name}
                            referrerPolicy="no-referrer"
                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">
                              {tpl.name}
                            </p>
                            <p className="mt-0.5 text-xs text-sky-200/75 tabular-nums">
                              {tpl.width}×{tpl.height} ·{' '}
                              {tpl.published ? 'প্রকাশিত' : 'বন্ধ'}
                            </p>
                          </div>
                        </button>

                        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-sky-400/10 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!tpl.published) handleTogglePublish(tpl.id);
                              onSelectActiveTemplate(tpl.id);
                              showNotice('এই ডিজাইনটি মূল পর্দায় সক্রিয় করা হয়েছে।');
                            }}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-[#101C3D] text-sky-200 hover:bg-sky-500/20'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{isActive ? 'সক্রিয়' : 'সক্রিয় করুন'}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(tpl.id)}
                              title={tpl.published ? 'প্রকাশ বন্ধ করুন' : 'প্রকাশ করুন'}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#101C3D] text-sky-200 hover:bg-sky-500/20"
                            >
                              {tpl.published ? (
                                <Eye className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                              ) : (
                                <EyeOff className="h-4 w-4 text-slate-400" aria-hidden="true" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTemplate(tpl.id)}
                              title="মুছে ফেলুন"
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#101C3D] text-rose-300 hover:bg-rose-500/20"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Direct Secret Admin Link Copy Card */}
                <div className="rounded-xl border border-sky-400/20 bg-[#0B132A]/75 p-3.5">
                  <p className="text-xs font-medium text-sky-200">
                    গোপন অ্যাডমিন লিংক
                  </p>
                  <p className="mt-1 break-all rounded-lg bg-[#101C3D] px-2.5 py-1.5 text-[11px] text-sky-300 select-all">
                    {`${window.location.origin}/?admin`}
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      const adminUrl = `${window.location.origin}/?admin`;
                      try {
                        await navigator.clipboard.writeText(adminUrl);
                        showNotice('অ্যাডমিন লিংক কপি করা হয়েছে!');
                      } catch {
                        showNotice('লিংকটি সিলেক্ট করে কপি করুন।');
                      }
                    }}
                    className="mt-2 inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-lg bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-200 transition-colors hover:bg-sky-500/30"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>অ্যাডমিন লিংক কপি করুন</span>
                  </button>
                </div>

                {/* Designer Facebook Link */}
                <div className="rounded-xl border border-sky-400/15 bg-[#0B132A]/70 p-3.5">
                  <label className="block text-xs font-medium text-sky-200">
                    ফেসবুক পেজ / প্রোফাইল লিংক
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="url"
                      value={fbInput}
                      onChange={(e) => setFbInput(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="min-w-0 flex-1 rounded-lg border border-sky-300/20 bg-[#101C3D] px-3 py-1.5 text-xs text-white focus:border-sky-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateFacebookUrl(fbInput);
                        showNotice('ফেসবুক লিংক আপডেট হয়েছে।');
                      }}
                      className="shrink-0 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400"
                    >
                      সেভ
                    </button>
                  </div>
                </div>

                {/* Change Admin Password */}
                <div className="rounded-xl border border-sky-400/15 bg-[#0B132A]/70 p-3.5">
                  <label className="block text-xs font-medium text-sky-200">
                    অ্যাডমিন পাসওয়ার্ড পরিবর্তন করুন
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="নতুন পাসওয়ার্ড"
                      className="min-w-0 flex-1 rounded-lg border border-sky-300/20 bg-[#101C3D] px-3 py-1.5 text-xs text-white focus:border-sky-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newPasswordInput.trim().length < 4) {
                          showNotice('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
                          return;
                        }
                        setAdminPassword(newPasswordInput.trim());
                        setNewPasswordInput('');
                        showNotice('অ্যাডমিন পাসওয়ার্ড আপডেট হয়েছে।');
                      }}
                      className="shrink-0 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-400"
                    >
                      সেভ
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Frame Calibrator */}
              {editingTemplate && (
                <div className="space-y-4 lg:col-span-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-sky-200">
                        ডিজাইনের নাম
                      </label>
                      <input
                        type="text"
                        value={editingTemplate.name}
                        onChange={(e) =>
                          updateTemplateById(editingTemplate.id, (t) => ({
                            ...t,
                            name: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-sky-300/20 bg-[#0B132A] px-3.5 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={() => replacePosterRef.current?.click()}
                        className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-xl border border-sky-300/25 bg-[#101C3D] px-3 py-2 text-xs font-medium text-sky-100 hover:bg-sky-500/20"
                      >
                        <Upload className="h-4 w-4 text-sky-300" aria-hidden="true" />
                        <span>পোস্টার ছবি পরিবর্তন করুন</span>
                      </button>
                      <input
                        ref={replacePosterRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleReplaceTemplateImage}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          updateTemplateById(editingTemplate.id, (t) => ({
                            ...t,
                            width: 1080,
                            height: 1080,
                          }))
                        }
                        className="min-h-[40px] rounded-xl border border-sky-300/25 bg-sky-500/15 px-3 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-500/25"
                      >
                        ১০৮০×১০৮০
                      </button>
                    </div>
                  </div>

                  {/* Visual Calibrator Canvas */}
                  <div className="grid gap-4 md:grid-cols-12">
                    <div className="md:col-span-7">
                      <p className="mb-1.5 text-xs font-medium text-sky-200">
                        নীল ফ্রেমটি টেনে ছবির জায়গা ও কোণ দিয়ে সাইজ ঠিক করুন:
                      </p>
                      <div
                        ref={calibratorRef}
                        className="relative w-full overflow-hidden rounded-xl border border-sky-400/25 bg-[#0B132A] select-none"
                        style={{
                          aspectRatio: `${editingTemplate.width} / ${editingTemplate.height}`,
                        }}
                      >
                        <img
                          src={editingTemplate.imageUrl}
                          alt="ক্যালিব্রেটর প্রিভিউ"
                          referrerPolicy="no-referrer"
                          draggable={false}
                          className="h-full w-full object-fill"
                        />

                        {/* Draggable + Resizable Slot Box */}
                        <div
                          onMouseDown={(e) => {
                            e.preventDefault();
                            startCalibratorOp('move', e.clientX, e.clientY);
                          }}
                          onTouchStart={(e) => {
                            if (e.touches[0]) {
                              startCalibratorOp(
                                'move',
                                e.touches[0].clientX,
                                e.touches[0].clientY
                              );
                            }
                          }}
                          style={{
                            left: `${(editingTemplate.slot.x / editingTemplate.width) * 100}%`,
                            top: `${(editingTemplate.slot.y / editingTemplate.height) * 100}%`,
                            width: `${(editingTemplate.slot.width / editingTemplate.width) * 100}%`,
                            height: `${(editingTemplate.slot.height / editingTemplate.height) * 100}%`,
                            borderColor: editingTemplate.slot.borderColor,
                          }}
                          className="absolute cursor-move border-2 bg-sky-500/25 ring-2 ring-white/80"
                        >
                          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white drop-shadow">
                            ছবির ফ্রেম
                          </span>

                          {/* Bottom-Right Resize Handle */}
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              startCalibratorOp('resize', e.clientX, e.clientY);
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              if (e.touches[0]) {
                                startCalibratorOp(
                                  'resize',
                                  e.touches[0].clientX,
                                  e.touches[0].clientY
                                );
                              }
                            }}
                            title="টেনে সাইজ পরিবর্তন করুন"
                            className="absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-white bg-sky-500 shadow"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Numeric Controls */}
                    <div className="space-y-3 rounded-xl border border-sky-400/15 bg-[#0B132A]/75 p-3.5 md:col-span-5">
                      <h4 className="text-xs font-semibold text-sky-200">
                        নিখুঁত পিক্সেল মাপ (px)
                      </h4>

                      <div className="grid grid-cols-2 gap-2.5">
                        <label className="text-xs text-sky-200/80">
                          X অবস্থান
                          <input
                            type="number"
                            value={editingTemplate.slot.x}
                            onChange={(e) =>
                              updateTemplateById(editingTemplate.id, (t) => ({
                                ...t,
                                slot: { ...t.slot, x: Number(e.target.value) || 0 },
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-sky-300/20 bg-[#101C3D] px-2.5 py-1.5 text-xs text-white tabular-nums"
                          />
                        </label>
                        <label className="text-xs text-sky-200/80">
                          Y অবস্থান
                          <input
                            type="number"
                            value={editingTemplate.slot.y}
                            onChange={(e) =>
                              updateTemplateById(editingTemplate.id, (t) => ({
                                ...t,
                                slot: { ...t.slot, y: Number(e.target.value) || 0 },
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-sky-300/20 bg-[#101C3D] px-2.5 py-1.5 text-xs text-white tabular-nums"
                          />
                        </label>

                        <label className="text-xs text-sky-200/80">
                          প্রস্থ (Width)
                          <input
                            type="number"
                            value={editingTemplate.slot.width}
                            onChange={(e) =>
                              updateTemplateById(editingTemplate.id, (t) => ({
                                ...t,
                                slot: {
                                  ...t.slot,
                                  width: Math.max(20, Number(e.target.value) || 20),
                                },
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-sky-300/20 bg-[#101C3D] px-2.5 py-1.5 text-xs text-white tabular-nums"
                          />
                        </label>
                        <label className="text-xs text-sky-200/80">
                          উচ্চতা (Height)
                          <input
                            type="number"
                            value={editingTemplate.slot.height}
                            onChange={(e) =>
                              updateTemplateById(editingTemplate.id, (t) => ({
                                ...t,
                                slot: {
                                  ...t.slot,
                                  height: Math.max(20, Number(e.target.value) || 20),
                                },
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-sky-300/20 bg-[#101C3D] px-2.5 py-1.5 text-xs text-white tabular-nums"
                          />
                        </label>

                        <label className="text-xs text-sky-200/80">
                          বর্ডার পুরুত্ব
                          <input
                            type="number"
                            min={0}
                            max={24}
                            value={editingTemplate.slot.borderWidth}
                            onChange={(e) =>
                              updateTemplateById(editingTemplate.id, (t) => ({
                                ...t,
                                slot: {
                                  ...t.slot,
                                  borderWidth: Math.max(0, Number(e.target.value) || 0),
                                },
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-sky-300/20 bg-[#101C3D] px-2.5 py-1.5 text-xs text-white tabular-nums"
                          />
                        </label>

                        <label className="text-xs text-sky-200/80">
                          কোণার গোলাকার (Radius)
                          <input
                            type="number"
                            min={0}
                            max={300}
                            value={editingTemplate.slot.borderRadius}
                            onChange={(e) =>
                              updateTemplateById(editingTemplate.id, (t) => ({
                                ...t,
                                slot: {
                                  ...t.slot,
                                  borderRadius: Math.max(0, Number(e.target.value) || 0),
                                },
                              }))
                            }
                            className="mt-1 w-full rounded-lg border border-sky-300/20 bg-[#101C3D] px-2.5 py-1.5 text-xs text-white tabular-nums"
                          />
                        </label>
                      </div>

                      <label className="flex items-center justify-between text-xs text-sky-200/80">
                        <span>বর্ডারের রং</span>
                        <input
                          type="color"
                          value={editingTemplate.slot.borderColor}
                          onChange={(e) =>
                            updateTemplateById(editingTemplate.id, (t) => ({
                              ...t,
                              slot: { ...t.slot, borderColor: e.target.value },
                            }))
                          }
                          className="h-8 w-14 cursor-pointer rounded border border-sky-300/25 bg-transparent"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
