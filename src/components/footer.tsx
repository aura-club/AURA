
import { Logo } from "./logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              The central hub for the Aerospace and Unmanned Research Association.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-8">
            <div>
              <h3 className="font-headline font-semibold text-primary-foreground">Navigate</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/projects" className="text-muted-foreground hover:text-primary-foreground">Projects</Link></li>
                <li><Link href="/resources" className="text-muted-foreground hover:text-primary-foreground">Resources</Link></li>
                <li><Link href="/opportunities" className="text-muted-foreground hover:text-primary-foreground">Opportunities</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-primary-foreground">Blog</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-primary-foreground">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-primary-foreground">Get Involved</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/join" className="text-muted-foreground hover:text-primary-foreground">Join Us</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-primary-foreground">Member Login</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AIREINO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
