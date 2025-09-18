import { Phone, ShieldAlert } from "lucide-react";

export function CrisisFooter() {
  return (
    <footer className="w-full border-t bg-gradient-to-r from-primary/10 via-accent/20 to-primary/10">
      <div className="container py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-primary">
          <ShieldAlert className="h-5 w-5" />
          <p className="font-medium">Need help now? Call helpline</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="tel:988"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 hover:opacity-90 transition"
          >
            <Phone className="h-4 w-4" /> 1800-89-14416 ( GOV Mental Healthcare Helpline )
          </a>
          <a
            href="https://telemanas.mohfw.gov.in/home"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            Text: HOME to 1800-89-14416
          </a>
        </div>
      </div>
    </footer>
  );
}
