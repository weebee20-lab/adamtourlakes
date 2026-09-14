import { useEffect, useRef } from "react";

export function InstallReel() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = window.setTimeout(() => {
      el.preload = "auto";
      void el.play().catch(() => {});
    }, 180);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="relative mt-auto min-h-[10.5rem] flex-1 overflow-hidden rounded-lg ring-1 ring-border">
      <img
        src="/videos/swfl-installs.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      />
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        poster="/videos/swfl-installs.jpg"
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        controls={false}
        aria-label="Southwest Florida solar installs"
      >
        <source src="/videos/swfl-installs.mp4" type="video/mp4" />
      </video>
    </div>
  );
}