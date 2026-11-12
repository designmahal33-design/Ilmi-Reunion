import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: '১. ছবি নির্বাচন ও আপলোড করুন',
    detail:
      '"ছবি আপলোড করুন" বাটনে ক্লিক করে অথবা ফটোকার্ডের ছবির ফ্রেমে ট্যাপ করে আপনার মোবাইল গ্যালারি বা কম্পিউটার থেকে পছন্দের ছবি নির্বাচন করুন।',
  },
  {
    title: '২. ফ্রেমের ভেতর ছবি ঠিকভাবে বসান',
    detail:
      'আঙুল দিয়ে টেনে (মোবাইল) অথবা মাউস দিয়ে ড্র্যাগ করে (কম্পিউটার) ছবির অবস্থান পরিবর্তন করুন। "ছবি বড় করুন", "ছবি ছোট করুন" বা স্লাইডার ব্যবহার করে মাপ ঠিক করুন।',
  },
  {
    title: '৩. ফুল-কোয়ালিটি PNG ডাউনলোড করুন',
    detail:
      'সবকিছু ঠিক হয়ে গেলে "ছবি ডাউনলোড করুন" বাটনে ক্লিক করুন। কোনো ওয়াটারমার্ক ছাড়াই ১০৮০×১০৮০ হাই-রেজোলিউশন ফটোকার্ড সরাসরি আপনার ডিভাইসে সেভ হবে।',
  },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-sky-400/25 bg-[#0F1A38] p-6 text-slate-100 shadow-[0_24px_64px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-sky-400/15 pb-4">
          <div>
            <h2 id="help-modal-title" className="text-xl font-bold text-white">
              ফটোকার্ড তৈরির নিয়মাবলি
            </h2>
            <p className="mt-0.5 text-xs text-sky-300">
              সম্পূর্ণ প্রক্রিয়াটি আপনার ব্রাউজারেই সম্পন্ন হয়
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300/20 bg-sky-500/10 text-sky-200 transition-colors hover:bg-sky-500/20"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <ol className="mt-5 space-y-4">
          {STEPS.map((step) => (
            <li
              key={step.title}
              className="flex items-start gap-3 rounded-xl border border-sky-400/15 bg-[#0B132A]/70 p-3.5"
            >
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-sky-100/85 sm:text-sm">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl bg-sky-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-400"
          >
            বুঝেছি
          </button>
        </div>
      </div>
    </div>
  );
}
