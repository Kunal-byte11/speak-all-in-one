import { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CalendarDays, HelpCircle, Lock, Video, MapPin, CheckCircle2 } from "lucide-react";
import { format, isBefore, isSameDay, isToday, parse } from "date-fns";
import { cn } from "@/lib/utils";

interface Counselor {
  id: string;
  name: string;
  specialty: ("Stress" | "Anxiety" | "Career")[];
  languages: string[];
  mode: ("Online" | "In-person" | "Both");
  status: "Available" | "Full" | "Online only";
}

const COUNSELORS: Counselor[] = [
  { id: "a", name: "Dr. Asha Mehta", specialty: ["Stress", "Anxiety"], languages: ["English", "Hindi"], mode: "Both", status: "Available" },
  { id: "b", name: "James Lin", specialty: ["Career"], languages: ["English", "中文"], mode: "Online", status: "Online only" },
  { id: "c", name: "Sofia Ramirez", specialty: ["Anxiety", "Stress"], languages: ["Español", "English"], mode: "Both", status: "Available" },
  { id: "d", name: "Fatima Ali", specialty: ["Career"], languages: ["English", "Français"], mode: "In-person", status: "Full" },
];

const SPECIALTIES = ["Stress", "Anxiety", "Career"] as const;
const LANGS = ["English", "Hindi", "Kashmiri"] as const;
const MODES = ["Online", "In-person", "Both"] as const;

const DEFAULT_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
];

function initials(name: string){
  return name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
}

function makePseudonym(){
  const key = "calmcampus_pseudo";
  const saved = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if(saved) return saved;
  const pseudo = `Student${String(new Date().getDate())}`;
  try{ localStorage.setItem(key, pseudo); } catch {}
  return pseudo;
}

export default function Booking(){
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [specialty, setSpecialty] = useState<string>("All");
  const [language, setLanguage] = useState<string>("All");
  const [mode, setMode] = useState<string>("All");
  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [slot, setSlot] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [prefFormat, setPrefFormat] = useState<string>("Video");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [remEmail, setRemEmail] = useState(true);
  const [remSms, setRemSms] = useState(false);
  const [remPush, setRemPush] = useState(false);

  useEffect(()=>{ if(counselor && counselor.status === "Full") setCounselor(null); }, [specialty, language, mode]);

  const filtered = useMemo(()=>{
    return COUNSELORS.filter(c=>
      (specialty === "All" || c.specialty.includes(specialty as any)) &&
      (language === "All" || c.languages.includes(language)) &&
      (mode === "All" || c.mode === mode || (mode === "Online" && c.mode === "Both") || (mode === "In-person" && c.mode === "Both"))
    );
  }, [specialty, language, mode]);

  const pseudo = makePseudonym();

  const slotDisabled = (s: string) => {
    if (!date) return true;
    // Mark some example booked slots per counselor id for demo
    const booked: Record<string, string[]> = {
      a: ["10:00 AM"],
      b: ["01:00 PM", "03:00 PM"],
      c: ["11:00 AM"],
      d: ["02:00 PM"],
    };
    const parsed = parse(s, "hh:mm a", new Date());
    const dt = new Date(date);
    dt.setHours(parsed.getHours(), parsed.getMinutes(), 0, 0);
    if (isToday(date) && isBefore(dt, new Date())) return true;
    if (counselor && booked[counselor.id]?.includes(s)) return true;
    if (counselor?.status === "Full") return true;
    return false;
  };

  const canConfirm = Boolean(date && counselor && slot);

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Confidential Booking</h1>
      </div>

      <Steps current={slot ? 3 : counselor ? 2 : 1} />

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Filters</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="rounded-full"><SelectValue placeholder="Specialty"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All specialties</SelectItem>
                  {SPECIALTIES.map(s=> <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="rounded-full"><SelectValue placeholder="Language"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All languages</SelectItem>
                  {LANGS.map(l=> <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="rounded-full"><SelectValue placeholder="Mode"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All modes</SelectItem>
                  {MODES.map(m=> <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4"/> Choose date</CardTitle>
                <TooltipProvider><Tooltip><TooltipTrigger asChild><span className="text-muted-foreground"><HelpCircle className="h-4 w-4"/></span></TooltipTrigger><TooltipContent>Pick a date with available slots</TooltipContent></Tooltip></TooltipProvider>
              </CardHeader>
              <CardContent className="pt-0">
                <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d)=> d < new Date(new Date().setHours(0,0,0,0))} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Time slots</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEFAULT_SLOTS.map((s)=> {
                    const disabled = slotDisabled(s) || !counselor || !date;
                    return (
                      <button
                        key={s}
                        disabled={disabled}
                        onClick={()=> setSlot(s)}
                        className={cn("px-3 py-2 rounded-full border text-sm", disabled ? "opacity-50 cursor-not-allowed" : slot===s ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {!counselor && (
                  <p className="text-xs text-muted-foreground mt-3">Select a counselor to see their availability.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2 flex items-center justify-between">
              <CardTitle className="text-base">Appointment details</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5"/> Private booking</div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Pseudonym</Label>
                <Input value={pseudo} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Preferred format</Label>
                <Select value={prefFormat} onValueChange={setPrefFormat}>
                  <SelectTrigger className="rounded-md"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="In-person">In-person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea value={notes} onChange={(e)=> setNotes(e.target.value)} placeholder="Reason for visit, anything you'd like your counselor to know" rows={3} />
              </div>

              <div className="md:col-span-2 grid sm:grid-cols-3 gap-4">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Email reminders</div>
                    <div className="text-xs text-muted-foreground">We’ll email details and reminders</div>
                  </div>
                  <Switch checked={remEmail} onCheckedChange={setRemEmail}/>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">SMS reminders</div>
                    <div className="text-xs text-muted-foreground">Text message alerts</div>
                  </div>
                  <Switch checked={remSms} onCheckedChange={setRemSms}/>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Push notifications</div>
                    <div className="text-xs text-muted-foreground">On supported devices</div>
                  </div>
                  <Switch checked={remPush} onCheckedChange={setRemPush}/>
                </div>
              </div>

              <div className="md:col-span-2 text-xs text-muted-foreground">
                Sample: “Your confidential session with {counselor ? counselor.name : "your counselor"} is tomorrow at {slot || "3 PM"}.”
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-3">
                <Button disabled={!canConfirm} onClick={()=> setOpenConfirm(true)} className="rounded-full">Review & Confirm</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Counselors</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {filtered.map((c)=> (
                <button key={c.id} onClick={()=> setCounselor(c)} className={cn("w-full text-left rounded-xl border p-3 flex items-center gap-3 hover:bg-muted/60", counselor?.id===c.id && "border-primary bg-primary/5") }>
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold">{initials(c.name)}</div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {c.name}
                      {c.status === "Available" && <Badge className="rounded-full">Available</Badge>}
                      {c.status === "Full" && <Badge variant="secondary" className="rounded-full">Full</Badge>}
                      {c.status === "Online only" && <Badge variant="outline" className="rounded-full">Online only</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">{c.specialty.join(" • ")} • {c.languages.join(", ")}</div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {c.mode !== "In-person" ? <Video className="h-4 w-4"/> : <MapPin className="h-4 w-4"/>}
                    {c.mode}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="text-sm text-muted-foreground">No counselors match these filters.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Summary</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Date</span><span>{date ? format(date, "EEE, MMM d") : "--"}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Time</span><span>{slot || "--"}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Counselor</span><span>{counselor?.name || "--"}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Mode</span><span>{prefFormat}</span></div>
            </CardContent>
          </Card>

          <Card className="bg-muted/40">
            <CardContent className="p-4 text-xs text-muted-foreground flex items-start gap-2">
              <HelpCircle className="h-4 w-4 shrink-0 mt-0.5"/>
              <span>Your booking is private. Only you and the counselor can see it.</span>
            </CardContent>
          </Card>
        </aside>
      </div>

      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Student</span><span>{pseudo}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Counselor</span><span>{counselor?.name}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Date</span><span>{date ? format(date, "EEE, MMM d, yyyy") : "--"}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Time</span><span>{slot}</span></div>
            <div className="flex items-center justify-between"><span className="text-muted-foreground">Mode</span><span>{prefFormat}</span></div>
          </div>
          <DialogFooter className="sm:justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Switch checked={remEmail} onCheckedChange={setRemEmail}/> Email</div>
              <div className="flex items-center gap-2"><Switch checked={remSms} onCheckedChange={setRemSms}/> SMS</div>
              <div className="flex items-center gap-2"><Switch checked={remPush} onCheckedChange={setRemPush}/> Push</div>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={()=> setOpenConfirm(false)}>Cancel</Button>
              <Button onClick={()=> { setOpenConfirm(false); setTimeout(()=> alert("Booked!"), 0); }}>
                <CheckCircle2 className="h-4 w-4 mr-2"/> Confirm Booking
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Steps({ current }: { current: number }){
  const steps = ["Choose date", "Choose counselor & slot", "Confirm"];
  return (
    <ol className="flex items-center gap-4 text-sm">
      {steps.map((s, i)=>{
        const n = i+1;
        const state = current >= n ? "done" : "todo";
        return (
          <li key={s} className="flex items-center gap-2">
            <span className={cn("h-6 w-6 rounded-full grid place-items-center text-xs border", state === "done" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground")}>{n}</span>
            <span className={cn("", state === "done" ? "" : "text-muted-foreground")}>{s}</span>
            {n !== steps.length && <span className="w-10 h-px bg-border mx-2"/>}
          </li>
        );
      })}
    </ol>
  );
}
