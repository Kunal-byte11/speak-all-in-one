import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Globe, Bot, CalendarCheck2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  const [lang, setLang] = useState("en");
  const [consent, setConsent] = useState(false);

  return (
    <div className="min-h-[calc(100vh-56px-56px)] bg-gradient-to-b from-accent/40 to-background">
      <div className="container py-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">Student Mental Wellness</div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Support when you need it—private, fast, and caring.
            </h1>
            <p className="text-muted-foreground max-w-prose">
              Chat with our AI first-aid bot, book a counselor, explore coping tools, or connect with peers. Anonymous by default. Your privacy is protected.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to={consent ? "/chat" : "#"} aria-disabled={!consent} onClick={(e)=>{ if(!consent){ e.preventDefault(); }}}>
                  <Bot className="h-5 w-5 mr-2"/> Start Chat
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/booking">
                  <CalendarCheck2 className="h-5 w-5 mr-2"/> Book Counselor
                </Link>
              </Button>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4"/> Pseudonym only. No names required.
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <Card className="bg-background/60">
                <CardContent className="p-4">
                  <p className="font-medium">Get help in 2 taps</p>
                  <p className="text-sm text-muted-foreground">Open chat, pick a quick reply, and breathe. We guide you step-by-step.</p>
                </CardContent>
              </Card>
              <Card className="bg-background/60">
                <CardContent className="p-4">
                  <p className="font-medium">Book in under 30s</p>
                  <p className="text-sm text-muted-foreground">Filter by language and specialty. Pick a time. Get reminders.</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Illustration />

            <Card className="border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4"/>
                    <span>Language</span>
                  </div>
                  <Select value={lang} onValueChange={setLang}>
                    <SelectTrigger className="w-[180px] rounded-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="hi">हिन्दी</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground leading-relaxed">
                  We respect your privacy. Conversations are anonymous and stored securely for quality and safety. By continuing, you agree to our privacy policy and consent to non-identifiable data use for improvement.
                </div>

                <label className="flex items-center gap-3">
                  <Checkbox id="consent" checked={consent} onCheckedChange={(v)=> setConsent(Boolean(v))}/>
                  <span className="text-sm">I understand and consent</span>
                </label>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Illustration(){
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-100 via-sky-100 to-indigo-100 dark:from-teal-900/30 dark:via-sky-900/20 dark:to-indigo-900/30 p-6 border">
      <div className="aspect-[4/3] w-full grid place-items-center">
        <svg viewBox="0 0 200 150" className="w-full h-full">
          <defs>
            <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="200" height="150" fill="url(#grad)" rx="16" />
          <g stroke="hsl(var(--primary))" strokeWidth="2" fill="none" opacity="0.6">
            <path d="M20 110 C 50 70, 150 70, 180 110" />
            <circle cx="60" cy="70" r="18" />
            <circle cx="140" cy="60" r="12" />
          </g>
          <g fill="hsl(var(--primary))" opacity="0.5">
            <circle cx="40" cy="120" r="3" />
            <circle cx="90" cy="30" r="2" />
            <circle cx="170" cy="90" r="2.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}
