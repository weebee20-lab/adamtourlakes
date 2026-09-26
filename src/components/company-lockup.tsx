import { COMPANY } from "@/lib/site";
import { cn } from "@/lib/utils";

export function CompanyLockup({
  stacked = false,
  className,
  bylineClassName,
  byline = COMPANY.byline,
}: {
  stacked?: boolean;
  className?: string;
  bylineClassName?: string;
  byline?: string;
}) {
  return (
    <span className={cn(stacked ? "block" : "inline", className)}>
      {COMPANY.name}
      {stacked ? (
        <span className={cn("company-byline mt-1 block", bylineClassName)}>{byline}</span>
      ) : (
        <>
          {" "}
          <span className={cn("company-byline", bylineClassName)}>{byline}</span>
        </>
      )}
    </span>
  );
}