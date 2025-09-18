import { Lock, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/chat", label: "Chatbot" },
  { to: "/booking", label: "Booking" },
  { to: "/resources", label: "Resources" },
  { to: "/forum", label: "Forum" },
  { to: "/admin", label: "Admin" },
];

export function Header() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-3">
        <a href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary/10 grid place-items-center text-primary font-bold">🌿</div>
          <span className="font-semibold tracking-tight">SPEAK</span>
        </a>
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-muted px-1 py-1">
          {nav.map((i) => (
            <a
              key={i.to}
              href={i.to}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full transition-colors",
                path === i.to ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={path === i.to ? "page" : undefined}
            >
              {i.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center text-xs text-muted-foreground gap-1">
            <Lock className="h-4 w-4" />
            <span>Private • Pseudonym: Student{new Date().getDate()}</span>
          </div>
          {path !== "/chat" && (
            <Button asChild className="rounded-full">
              <a href="/chat" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Talk now
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
