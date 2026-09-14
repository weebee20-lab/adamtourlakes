import { MapPin, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveLocation, suggestAddress, type AddressHit } from "@/lib/solar/places";
import { cn } from "@/lib/utils";
import { useDesigner } from "@/store/designer";

export function AddressBar() {
  const query = useDesigner((s) => s.addressQuery);
  const setQuery = useDesigner((s) => s.setAddressQuery);
  const setLocation = useDesigner((s) => s.setLocation);
  const [hits, setHits] = useState<AddressHit[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
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
    if (query.trim().length < 3) {
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
      suggestAddress({ data: { q: query } })
        .then((rows) => {
          if (my !== suggestGen.current) return;
          setHits(rows);
          setOpen(rows.length > 0);
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
  }, [query]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) closeHits();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const apply = async (q: string) => {
    skipSuggest.current = true;
    suggestGen.current += 1;
    closeHits();
    setBusy(true);
    setQuery(q);
    if (q === query) skipSuggest.current = false;
    try {
      const loc = await resolveLocation({ data: { q } });
      setLocation(loc);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
      <div ref={box} className="relative min-w-0 flex-1">
        <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          className="h-11 pl-9"
          placeholder="Type your address here"
          value={query}
          autoComplete="off"
          role="combobox"
          aria-label="Street address"
          aria-autocomplete="list"
          aria-expanded={listOpen}
          aria-controls={listId}
          aria-activedescendant={activeId}
          onChange={(e) => setQuery(e.target.value)}
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
            if (e.key === "Enter") {
              if (listOpen && active >= 0 && hits[active]) {
                e.preventDefault();
                void apply(hits[active].label);
                return;
              }
              if (query.trim()) {
                e.preventDefault();
                void apply(query);
              }
            }
          }}
        />
        {listOpen ? (
          <ul id={listId} role="listbox" className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-popover py-1 shadow-md">
            {looking && !hits.length ? (
              <li className="px-3 py-2 text-sm text-muted-foreground" role="status">
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
                  className={cn("w-full px-3 py-2 text-left text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", i === active && "bg-muted")}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    void apply(h.label);
                  }}
                >
                  {h.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <Button type="button" className="h-11 shrink-0" onClick={() => query.trim() && void apply(query)} disabled={busy || query.trim().length < 3}>
        <Search aria-hidden />
        Use This Address
      </Button>
    </div>
  );
}
