import { HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenHelp: () => void;
}

export function Header({ onOpenHelp }: HeaderProps) {
  return (
    <header className="relative z-10 w-full">
      {/* Top Row: Live Photocard Badge & Help Button */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
        <div className="inline-flex min-h-[38px] items-center gap-2.5 rounded-full border border-sky-400/40 bg-[#0F1B3B]/85 px-4 py-1.5 text-xs font-medium text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.2)] sm:text-sm">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-80" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(56,189,248,1)]" />
          </span>
          <span className="whitespace-nowrap">লাইভ ফটোকার্ড</span>
        </div>

        <button
          type="button"
          onClick={onOpenHelp}
          className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-sky-400/35 bg-[#0F1B3B]/80 px-4 py-1.5 text-xs font-medium text-sky-100 shadow-[0_0_16px_rgba(56,189,248,0.12)] transition-colors hover:border-sky-300/60 hover:bg-sky-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 sm:text-sm"
        >
          <HelpCircle className="h-4 w-4 text-sky-400" aria-hidden="true" />
          <span>সহায়িকা</span>
        </button>
      </div>

      {/* Main Centered Lockup Matching Reference */}
      <div className="mx-auto max-w-4xl px-4 pb-5 pt-4 text-center sm:px-6 sm:pb-7 sm:pt-5">
        {/* Glowing Cyan-Blue Pill with Animated Start Dot */}
        <div className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-5 py-1.5 text-xs font-semibold text-white shadow-[0_0_28px_rgba(56,189,248,0.7)] sm:text-sm">
          <span className="relative flex h-3 w-3 items-center justify-center" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)]" />
          </span>
          <span>ফ্রেমে আপনার ছবি বসান</span>
        </div>

        {/* Framed Institution Box with Calm Electric-Blue Neon Border */}
        <div className="relative mx-auto mt-5 max-w-3xl">
          {/* Subtle Ambient Electric-Blue Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2 rounded-3xl bg-sky-500/15 blur-xl"
          />

          {/* Crisp Border Track with Gentle Rotating Blue Shimmer */}
          <div className="relative overflow-hidden rounded-2xl p-[1.5px] shadow-[0_0_24px_rgba(14,165,233,0.28)]">
            <div
              aria-hidden="true"
              className="animate-rotate-light-slow pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[160%]"
              style={{
                background:
                  'conic-gradient(from 0deg, rgba(14,165,233,0.35) 0deg, #38bdf8 60deg, #0ea5e9 120deg, rgba(14,165,233,0.3) 180deg, rgba(14,165,233,0.35) 240deg, #38bdf8 300deg, rgba(14,165,233,0.35) 360deg)',
              }}
            />

            <div className="relative rounded-[14.5px] bg-[#101C3D]/95 px-5 py-5 backdrop-blur-md sm:px-10 sm:py-6">
              <h1
                className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
                style={{
                  textShadow: '0 0 18px rgba(56, 189, 248, 0.3)',
                }}
              >
                জামিয়া কারীমিয়া আরাবিয়া
              </h1>

              {/* Gentle Blue Light Line Under Main Title */}
              <div
                aria-hidden="true"
                className="mx-auto mt-2.5 h-px w-3/4 max-w-md rounded-full bg-gradient-to-r from-transparent via-sky-400/75 to-transparent shadow-[0_0_10px_rgba(56,189,248,0.5)]"
              />

              <p className="mt-2 text-base font-light tracking-wide text-sky-100/95 sm:text-lg">
                রামপুরা মাদরাসা ঢাকা-১২১৯
              </p>

              {/* Gentle Blue Light Line Under Address */}
              <div
                aria-hidden="true"
                className="mx-auto mt-2 h-px w-48 rounded-full bg-gradient-to-r from-transparent via-sky-400/55 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.4)]"
              />
            </div>
          </div>
        </div>

        {/* Event Subtitles Below Card with Gentle Light Underlines */}
        <div className="mt-5 space-y-2.5">
          <div>
            <p className="text-sm font-normal text-sky-200/95 sm:text-base">
              দারুল ইফতার প্রাক্তন ও বর্তমান ছাত্রদের অংশগ্রহণে
            </p>
            <div
              aria-hidden="true"
              className="mx-auto mt-1 h-px w-56 rounded-full bg-gradient-to-r from-transparent via-sky-400/55 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.4)]"
            />
          </div>

          <div>
            <p
              className="text-balance text-xl font-bold text-amber-300 sm:text-2xl"
              style={{
                textShadow: '0 0 14px rgba(251, 191, 36, 0.25)',
              }}
            >
              ইলমি পুনর্মিলনী ও ফিকহি কর্মশালা
            </p>
            <div
              aria-hidden="true"
              className="mx-auto mt-1.5 h-px w-64 rounded-full bg-gradient-to-r from-transparent via-amber-300/65 to-transparent shadow-[0_0_10px_rgba(251,191,36,0.4)]"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
