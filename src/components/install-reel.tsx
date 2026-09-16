import { useEffect, useRef } from "react";
import { HelioCredit } from "@/components/helio-credit";

export function InstallReel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;

    const play = () => {
      if (document.hidden) return;
      void el.play().catch(() => {});
    };
    const pause = () => {
      el.pause();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !document.hidden) play();
        else pause();
      },
      { rootMargin: "80px", threshold: 0.15 },
    );
    io.observe(wrap);

    const onVis = () => {
      if (document.hidden) pause();
      else if (wrap.getBoundingClientRect().height > 0) play();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      pause();
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p className="font-display text-lg font-semibold tracking-tight text-gold sm:text-xl">
        A few of our many installations
      </p>
      <div ref={wrapRef} className="relative aspect-[720/424] w-full overflow-hidden rounded-lg ring-1 ring-border">
        <img
          src="/videos/swfl-installs.jpg?v=3"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          poster="/videos/swfl-installs.jpg?v=3"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          controls={false}
          aria-label="A few of our many installations"
        >
          <source src="/videos/swfl-installs.mp4?v=3" type="video/mp4" />
        </video>
      </div>
      <div className="calc-desk-video hidden xl:block">
        <HelioCredit />
      </div>
    </div>
  );
}