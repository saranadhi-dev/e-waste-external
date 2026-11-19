import Link from "next/link";
import { cn } from "@/lib/utils";
import { RecycleIcon } from "@/components/ui/icons";

export function Logo({ showName = true, name = "E-Waste Collection" }: { showName?: boolean; name?: string }) {
  return (
    <Link
      href="/dashboard"
      className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label={`${name} home`}
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
        <RecycleIcon className="size-5" />
      </span>
      <span className={cn("truncate text-base font-semibold tracking-tight text-foreground", !showName && "sr-only")}>
        {name}
      </span>
    </Link>
  );
}
