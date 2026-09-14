import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent bg-surface-2 ring-1 ring-border transition-colors data-[state=checked]:bg-gold data-[state=checked]:ring-gold",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-5 translate-x-0.5 rounded-full bg-fg shadow-sm transition-transform data-[state=checked]:translate-x-[1.35rem] data-[state=checked]:bg-gold-fg" />
    </SwitchPrimitive.Root>
  );
}
