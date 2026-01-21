import { Rocket } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="AIREINO Home">
      <Rocket className="h-6 w-6 text-accent" />
      <span className="font-headline text-xl font-bold text-primary-foreground">
        AIREINO
      </span>
    </Link>
  );
}
