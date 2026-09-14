import { Play } from "lucide-react";
import { useState } from "react";

export function VideoEmbed({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [play, setPlay] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  if (play) {
    return (
      <div className="aspect-video overflow-hidden rounded-md bg-surface-2">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      className="group relative aspect-video w-full overflow-hidden rounded-md bg-surface-2 text-left"
      aria-label={`Play ${title}`}
    >
      <img
        src={thumb}
        alt=""
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <span className="absolute inset-0 bg-bg/35" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-gold text-gold-fg shadow-lg transition-transform duration-150 group-hover:scale-105">
          <Play className="ml-0.5 size-6" fill="currentColor" />
        </span>
      </span>
    </button>
  );
}
