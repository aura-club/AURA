
import { Logo } from "./logo";
import Link from "next/link";
import { Instagram, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left Column: Info */}
          <div className="flex flex-col gap-4 max-w-sm">
            <Logo />
            <p className="text-sm text-muted-foreground">
              The central hub for the Aerospace and Unmanned Research Association.
            </p>
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-primary-foreground/80">Mangalore Institute of Technology & Engineering</p>
              <p>Moodabidri, Karnataka 574225</p>
            </div>
          </div>

          {/* Center Column: Map */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="rounded-lg overflow-hidden border border-border/40 w-full max-w-md">
              <iframe
                width="100%"
                height="150"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src="https://maps.google.com/maps?width=100%25&amp;height=150&amp;hl=en&amp;q=Mangalore%20Institute%20of%20Technology%20and%20Engineering&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                className="filter grayscale-[50%] hover:grayscale-0 transition-all duration-300 contrast-125 opacity-80 hover:opacity-100"
              />
            </div>
          </div>

          {/* Right Column: Links */}
          <div className="flex flex-wrap justify-end gap-x-16 gap-y-8">
            <div>
              <h3 className="font-headline font-semibold text-primary-foreground">Navigate</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/projects" className="text-muted-foreground hover:text-primary-foreground transition-colors">Projects</Link></li>
                <li><Link href="/resources" className="text-muted-foreground hover:text-primary-foreground transition-colors">Resources</Link></li>
                <li><Link href="/opportunities" className="text-muted-foreground hover:text-primary-foreground transition-colors">Opportunities</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-primary-foreground transition-colors">Blog</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-primary-foreground transition-colors">About</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-headline font-semibold text-primary-foreground">Connect</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="https://www.instagram.com/teamaireino" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary-foreground transition-colors">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://mite.ac.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary-foreground transition-colors">
                    <Globe className="h-4 w-4" />
                    College Website
                  </a>
                </li>
                <li className="pt-2"><Link href="/join" className="text-muted-foreground hover:text-primary-foreground transition-colors">Join Us</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-primary-foreground transition-colors">Member Login</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AIREINO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
