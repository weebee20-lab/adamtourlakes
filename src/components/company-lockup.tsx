import { COMPANY } from "@/lib/site";
import { cn } from "@/lib/utils";

export function CompanyLockup({
  stacked = false,
  className,
  bylineClassName,
}: {
  stacked?: boolean;
  className?: string;
  bylineClassName?: string;
}) {
  return (
    <span className={cn(stacked ? "block" : "inline", className)}>
      {COMPANY.name}
      {stacked ? (
        <span className={cn("company-byline mt-1 block", bylineClassName)}>{COMPANY.byline}</span>
      ) : (
        <>
          {" "}
          <span className={cn("company-byline", bylineClassName)}>{COMPANY.byline}</span>
        </>
      )}
    </span>
  );
}