"use client";

import { useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export default function ModalTerms({
  isOpen,
  onClose,
  title = "Terms & Privacy",
  children,
}: Props) {
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const okButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      // give focus to OK button for accessibility
      setTimeout(() => okButtonRef.current?.focus(), 50);
      // prevent body scroll while modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // backdrop
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={(e) => {
        // close when clicking backdrop (but not when clicking modal content)
        if (e.target === backdropRef.current) onClose();
      }}
    >
      {/* dim + blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

      {/* modal card */}
      <div className="relative z-10 w-full max-w-2xl mx-auto bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-white/10 rounded-2xl shadow-2xl transform transition-all ease-out duration-200">
        <div className="p-5 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="ml-auto text-sm px-3 py-1 rounded-md border border-white/10 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              Close
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-200 max-h-[60vh] overflow-y-auto pr-3 space-y-4">
            {/* Exemple de contenu; remplace par tes textes Terms & Privacy */}
            {children ?? (
              <>
                <p className="leading-relaxed">
                  This application collects only the minimum data required to
                  provide the service. We use public space-weather sources and
                  AI models to provide estimated forecasts. Predictions are not
                  guaranteed and should not be relied upon for critical
                  decisions.
                </p>

                <p className="leading-relaxed">
                  We do not sell personal data. Photos or location data are used
                  locally or with explicit consent only. You can request
                  deletion of any personal data by contacting us.
                </p>

                <p className="leading-relaxed">
                  By using this app you acknowledge that forecasts may be
                  inaccurate. We recommend verifying conditions via official
                  sources if necessary.
                </p>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              ref={okButtonRef}
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-medium hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
