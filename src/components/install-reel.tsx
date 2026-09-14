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
    <div className="mt-auto flex flex-col gap-2">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-gold uppercase">
        A few of our many installations
      </p>
      <div className="relative aspect-[720/424] w-full overflow-hidden rounded-lg ring-1 ring-border">
        <img
          src="/videos/swfl-installs.jpg?v=2"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          poster="/videos/swfl-installs.jpg?v=2"
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          controls={false}
          aria-label="A few of our many installations"
        >
          <source src="/videos/swfl-installs.mp4?v=2" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}