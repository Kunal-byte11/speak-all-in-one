import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle, Bell, BarChart2, Users, HeartPulse, MessageSquare } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

// Demo data model
type Campus = "North" | "South" | "Engineering" | "Arts";

type ScreeningPoint = { date: string; campus: Campus; phq: number; gad: number; high: number };
const campuses: Campus[] = ["North", "South", "Engineering", "Arts"];

// Generate 30 days of demo data
function genData(): ScreeningPoint[] {
  const out: ScreeningPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const date = `${d.getMonth()+1}/${d.getDate()}`;
    campuses.forEach((c) => {
      const base = 10 + Math.floor(Math.random() * 8);
      const phq = base + (c === "Engineering" ? 5 : 0);
      const gad = base - 2 + (c === "Arts" ? 3 : 0);
      const high = Math.max(0, Math.floor((phq + gad) * 0.08 - (i%5===0?1:0)));
      out.push({ date, campus: c, phq, gad, high });
    });
  }
  return out;
}

const DATA = genData();

const sevDist = [
  { name: "Mild", value: 62 },
  { name: "Moderate", value: 28 },
  { name: "Severe", value: 10 },
];

const concerns = [
  { name: "Stress", value: 120 },
  { name: "Anxiety", value: 95 },
  { name: "Sleep", value: 70 },
  { name: "Exams", value: 65 },
];

const usage = Array.from({ length: 24 }).map((_, h) => ({ hour: `${h}:00`, value: Math.floor(Math.sin(h/24*Math.PI*2)*20 + 30 + (h>20||h<3?10:0)) }));

const workload = [
  { name: "Dr. Asha", sessions: 14 },
  { name: "J. Lin", sessions: 9 },
  { name: "S. Ramirez", sessions: 12 },
  { name: "F. Ali", sessions: 6 },
];

export default function Admin(){
  const [range, setRange] = useState("Last 30 days");
  const [campus, setCampus] = useState<"All" | Campus>("All");

  const filtered = useMemo(()=> DATA.filter(d=> campus === "All" || d.campus === campus), [campus]);
  const totals = useMemo(()=>{
    const phq = filtered.reduce((a,b)=> a + b.phq, 0);
    const gad = filtered.reduce((a,b)=> a + b.gad, 0);
    const screenings = phq + gad;
    const high = filtered.reduce((a,b)=> a + b.high, 0);
    const bookings = workload.reduce((a,b)=> a + b.sessions, 0);
    const forum = 42; // demo
    const resource = 318; // demo
    return { screenings, high, bookings, forum, resource };
  }, [filtered]);

  const exportCSV = () => {
    const rows = ["date,campus,phq,gad,high", ...filtered.map(r=> `${r.date},${r.campus},${r.phq},${r.gad},${r.high}`)].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `admin-analytics-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="rounded-full min-w-40"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Last 7 days">Last 7 days</SelectItem>
              <SelectItem value="Last 30 days">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={campus} onValueChange={(v)=> setCampus(v as any)}>
            <SelectTrigger className="rounded-full min-w-36"><SelectValue placeholder="Campus"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All campuses</SelectItem>
              {(["North","South","Engineering","Arts"] as Campus[]).map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="rounded-full" onClick={exportCSV}><Download className="h-4 w-4 mr-2"/> Export CSV</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI title="Screenings" value={totals.screenings.toLocaleString()} color="from-emerald-200 to-emerald-100" icon={<HeartPulse className="h-4 w-4"/>} />
        <KPI title="High-risk flags" value={totals.high.toLocaleString()} color="from-rose-200 to-rose-100" warn icon={<AlertTriangle className="h-4 w-4"/>} />
        <KPI title="Bookings" value={totals.bookings.toString()} color="from-sky-200 to-sky-100" icon={<Users className="h-4 w-4"/>} />
        <KPI title="Forum activity" value={totals.forum.toString()} color="from-violet-200 to-violet-100" icon={<MessageSquare className="h-4 w-4"/>} />
        <KPI title="Resource engagement" value={totals.resource.toString()} color="from-amber-200 to-amber-100" icon={<BarChart2 className="h-4 w-4"/>} />
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Screening trends</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ phq:{ label:"PHQ-9", color:"hsl(var(--primary))" }, gad:{ label:"GAD-7", color:"#60a5fa" } }} className="h-64">
              <LineChart data={aggregateByDate(filtered)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date"/>
                <YAxis allowDecimals={false}/>
                <ChartTooltip content={<ChartTooltipContent />}/>
                <Line type="monotone" dataKey="phq" stroke="var(--color-phq)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="gad" stroke="var(--color-gad)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Severity distribution</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ Mild:{ color:"#10b981" }, Moderate:{ color:"#f59e0b" }, Severe:{ color:"#ef4444" } }} className="h-64">
              <PieChart>
                <Pie data={sevDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} strokeWidth={4}>
                  {sevDist.map((e, i)=> <Cell key={i} fill={`var(--color-${e.name})`} />)}
                </Pie>
                <Tooltip content={<ChartTooltipContent />}/>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Common concerns</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ value:{ label:"Count", color:"#0ea5e9" } }} className="h-64">
              <BarChart data={concerns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name"/>
                <YAxis allowDecimals={false}/>
                <ChartTooltip content={<ChartTooltipContent />}/>
                <Bar dataKey="value" fill="var(--color-value)" radius={[6,6,0,0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Peak usage time</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ value:{ label:"Sessions", color:"#22c55e" } }} className="h-64">
              <LineChart data={usage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour"/>
                <YAxis allowDecimals={false}/>
                <ChartTooltip content={<ChartTooltipContent />}/>
                <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Counselor workload</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={{ sessions:{ label:"Sessions", color:"#6366f1" } }} className="h-64">
              <BarChart data={workload}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name"/>
                <YAxis allowDecimals={false}/>
                <ChartTooltip content={<ChartTooltipContent />}/>
                <Bar dataKey="sessions" fill="var(--color-sessions)" radius={[6,6,0,0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <AlertItem text="10 students flagged as high-risk in past 24 hrs" level="high" />
            <AlertItem text="Spike in anxiety-related screenings this week" level="warn" />
            <AlertItem text="3 flagged forum posts pending review" level="warn" />
          </CardContent>
        </Card>

      </div>

      <Card className="bg-muted/40">
        <CardContent className="p-4 text-xs text-muted-foreground">
          All data shown here is anonymized. Role-based access applies. Do not attempt to re-identify individuals.
        </CardContent>
      </Card>
    </div>
  );
}

function aggregateByDate(rows: ScreeningPoint[]){
  const map: Record<string, { date: string; phq: number; gad: number }> = {};
  rows.forEach(r=>{
    if(!map[r.date]) map[r.date] = { date:r.date, phq:0, gad:0 };
    map[r.date].phq += r.phq; map[r.date].gad += r.gad;
  });
  return Object.values(map);
}

function KPI({ title, value, color, warn, icon, onClick }: { title: string; value: string; color: string; warn?: boolean; icon?: React.ReactNode; onClick?: ()=>void }){
  return (
    <button onClick={onClick} className={cn("text-left rounded-xl border p-4 bg-gradient-to-br", color, warn ? "ring-2 ring-rose-300" : "")}>
      <div className="text-xs text-muted-foreground flex items-center gap-2">{icon} {title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </button>
  );
}

function AlertItem({ text, level }: { text: string; level: "high" | "warn" | "info" }){
  return (
    <div className={cn("rounded-lg border p-3 text-sm flex items-start gap-2", level === "high" ? "bg-rose-50 border-rose-200 text-rose-700" : level === "warn" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-muted/40") }>
      <Bell className="h-4 w-4 mt-0.5"/>
      <span>{text}</span>
    </div>
  );
}
