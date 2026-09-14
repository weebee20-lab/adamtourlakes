import { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { suggestAddress, type AddressHit } from "@/lib/solar/places";
import { isFloridaLocation } from "@/lib/swfl";
import { cn } from "@/lib/utils";

export function AddressSuggest({
  id,
  value,
  onChange,
  required,
  className,
}: {
  id: string;
  value: string;
  onChange: (label: string) => void;
  required?: boolean;
  className?: string;
}) {
  const [hits, setHits] = useState<AddressHit[]>([]);
  const [open, setOpen] = useState(false);
  const [looking, setLooking] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const skipSuggest = useRef(false);
  const suggestGen = useRef(0);
  const listId = useId();
  const listOpen = open && (hits.length > 0 || looking);
  const activeId = listOpen && active >= 0 && hits[active] ? `${listId}-opt-${active}` : undefined;

  function closeHits() {
    setOpen(false);
    setHits([]);
    setLooking(false);
    setActive(-1);
  }

  useEffect(() => {
    if (value.trim().length < 3) {
      closeHits();
      return;
    }
    if (skipSuggest.current) {
      skipSuggest.current = false;
      closeHits();
      return;
    }
    const my = ++suggestGen.current;
    const t = window.setTimeout(() => {
      setLooking(true);
      suggestAddress({ data: { q: value } })
        .then((rows) => {
          if (my !== suggestGen.current) return;
          const next = rows.filter((row) => isFloridaLocation(row) !== false);
          setHits(next);
          setOpen(next.length > 0);
          setActive(-1);
        })
        .catch(() => {
          if (my !== suggestGen.current) return;
          setHits([]);
          setOpen(false);
        })
        .finally(() => {
          if (my === suggestGen.current) setLooking(false);
        });
    }, 280);
    return () => window.clearTimeout(t);
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) {
        setOpen(false);
        setActive(-1);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(label: string) {
    skipSuggest.current = true;
    suggestGen.current += 1;
    closeHits();
    onChange(label);
  }

  return (
    <div ref={box} className={cn("relative", className)}>
      <Input
        id={id}
        className="min-h-11"
        value={value}
        required={required}
        autoComplete="off"
        placeholder="Start typing a Florida street address"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={listOpen}
        aria-controls={listId}
        aria-activedescendant={activeId}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (listOpen) {
              e.preventDefault();
              setOpen(false);
              setActive(-1);
            }
            return;
          }
          if (e.key === "ArrowDown") {
            if (!hits.length) return;
            e.preventDefault();
            setOpen(true);
            setActive((i) => (i + 1) % hits.length);
            return;
          }
          if (e.key === "ArrowUp") {
            if (!hits.length) return;
            e.preventDefault();
            setOpen(true);
            setActive((i) => (i <= 0 ? hits.length - 1 : i - 1));
            return;
          }
          if (e.key === "Enter" && listOpen && active >= 0 && hits[active]) {
            e.preventDefault();
            pick(hits[active].label);
          }
        }}
      />
      {listOpen ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-surface py-1 shadow-md"
        >
          {looking && !hits.length ? (
            <li className="px-3 py-2 text-sm text-muted" role="status">
              Searching addresses…
            </li>
          ) : null}
          {hits.map((h, i) => (
            <li key={h.label} role="presentation">
              <button
                type="button"
                id={`${listId}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                tabIndex={-1}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  i === active && "bg-surface-2",
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(h.label);
                }}
              >
                {h.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
