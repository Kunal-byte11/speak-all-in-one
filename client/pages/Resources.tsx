import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Play, Save, Share2, Download, Video as VideoIcon, Headphones, BookOpenCheck, Activity, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export type Format = "Video" | "Audio" | "Article" | "Exercise";

interface Resource {
  id: string;
  title: string;
  description: string;
  topics: string[];
  format: Format;
  language: string;
  duration: number; // minutes
  url?: string; // media url
  popularity?: number;
}

const ALL_TOPICS = ["Stress", "Sleep", "Anxiety", "Exams", "Relationships", "Mindfulness"] as const;
const ALL_FORMATS: Format[] = ["Video", "Audio", "Article", "Exercise"];
const ALL_LANGUAGES = ["English", "Hindi", "Marathi", "Español", "Français", "中文"] as const;

const DATA: Resource[] = [
  { id: "r1", title: "5‑Minute Guided Breathing", description: "A short breathing routine to calm your nervous system.", topics: ["Stress", "Mindfulness"], format: "Video", language: "English", duration: 5, url: "https://youtu.be/enJyOTvEn4M?si=Xo0yqjgxa-MPN_1A", popularity: 95 },
  { id: "r2", title: "Grounding Exercise (5‑4‑3‑2‑1)", description: "Practice noticing your senses to reduce anxiety.", topics: ["Anxiety", "Mindfulness"], format: "Exercise", language: "English", duration: 7, url: "https://youtu.be/30VMIEmA114?si=9j8W5un3wrd97Ls8", popularity: 88 },
  { id: "r3", title: "Sleep Hygiene Basics", description: "Evidence‑based tips to fall asleep faster.", topics: ["Sleep"], format: "Article", language: "English", duration: 10, url: "https://youtu.be/fk-_SwHhLLc?si=oAAKH8BWME9KyG45", popularity: 82 },
  { id: "r4", title: "Box Breathing Tutorial", description: "Learn box breathing with visual guidance.", topics: ["Stress", "Mindfulness"], format: "Video", language: "English", duration: 6, url: "https://youtu.be/tEmt1Znux58?si=eP898BgYQ3O3kJiT", popularity: 91 },
  { id: "r5", title: "Exam Stress Toolkit", description: "Quick ways to steady nerves before exams.", topics: ["Exams", "Anxiety"], format: "Article", language: "English", duration: 8, url: "https://youtu.be/-RZ86OB9hw4?si=bwYYBg7k5fC8cK1m", popularity: 86 },
  { id: "r7", title: "Relationship Boundaries 101", description: "Learn to set kind, clear boundaries.", topics: ["Relationships", "Stress"], format: "Article", language: "English", duration: 15, url: "https://youtu.be/Gf4FIt5DG4g?si=TOdYxulEUwGNqXZg", popularity: 70 },
  { id: "r8", title: "Mindful Study Break", description: "Two‑minute reset between study blocks.", topics: ["Exams", "Mindfulness"], format: "Video", language: "English", duration: 2, url: "https://youtu.be/QtE00VP4W3Y?si=nMWjSrxcCfrruQ26", popularity: 77 },
  { id: "r9", title: "Anxiety SOS: Breathing + Reframe", description: "Mini‑protocol for spiraling moments.", topics: ["Anxiety"], format: "Exercise", language: "English", duration: 5, url: "https://youtu.be/wE292vsJcBY?si=G3nuM-7U7BT1P4cz", popularity: 80 },
];

function iconFor(format: Format){
  switch(format){
    case "Video": return <VideoIcon className="h-4 w-4"/>;
    case "Audio": return <Headphones className="h-4 w-4"/>;
    case "Article": return <BookOpenCheck className="h-4 w-4"/>;
    case "Exercise": return <Activity className="h-4 w-4"/>;
  }
}

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  // Handle youtu.be URLs
  if (url.includes('youtu.be/')) {
    const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
  
  // Handle youtube.com URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Helper function to check if URL is a YouTube URL
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function useLocal<T>(key: string, initial: T){
  const [val, setVal] = useState<T>(()=>{
    try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch { return initial; }
  });
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal] as const;
}

export default function Resources(){
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All");
  const [format, setFormat] = useState("All");
  const [language, setLanguage] = useState("All");
  const [duration, setDuration] = useState("All");
  const [selected, setSelected] = useState<Resource | null>(DATA[0]);
  
  // Add debugging
  console.log("Component render - Current selected:", selected?.title, selected?.id);
  const [saved, setSaved] = useLocal<string[]>("res_saved", []);
  const [favorites, setFavorites] = useLocal<string[]>("res_fav", []);
  const [recent, setRecent] = useLocal<string[]>("res_recent", []);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const filtered = useMemo(()=>{
    return DATA.filter(r=>
      (query.trim() === "" || (r.title+" "+r.description+" "+r.topics.join(" ")).toLowerCase().includes(query.toLowerCase())) &&
      (topic === "All" || r.topics.includes(topic)) &&
      (format === "All" || r.format === format) &&
      (language === "All" || r.language === language) &&
      (duration === "All" || (duration === "5" && r.duration <= 5) || (duration === "10" && r.duration > 5 && r.duration <= 10) || (duration === "20+" && r.duration > 10))
    ).sort((a, b) => {
      // Sort favorites first, then by original order
      const aIsFavorite = favorites.includes(a.id);
      const bIsFavorite = favorites.includes(b.id);
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return 0; // Maintain original order for same favorite status
    });
  }, [query, topic, format, language, duration, favorites]);

  useEffect(()=>{
    if(selected){
      setLoadingDetail(true);
      const id = selected.id;
      // Reduced delay for better responsiveness
      setTimeout(()=>{ setLoadingDetail(false); setRecent((r)=> Array.from(new Set([id, ...r])).slice(0,8)); }, 150);
    }
  }, [selected, setRecent]);

  const toggle = (list: string[], set: (v: string[])=>void, id: string) => {
    set(list.includes(id) ? list.filter(i=> i!==id) : [id, ...list]);
  };

  const recommended = useMemo(()=>{
    // naive: top popularity + topic overlap with last viewed
    const last = recent[0];
    const lastTopic = DATA.find(d=> d.id===last)?.topics[0];
    return DATA.filter(d=> d.id!==selected?.id && (!lastTopic || d.topics.includes(lastTopic)))
      .sort((a,b)=> (b.popularity||0)-(a.popularity||0)).slice(0,4);
  }, [recent, selected]);

  const popular = useMemo(()=> DATA.slice().sort((a,b)=> (b.popularity||0)-(a.popularity||0)).slice(0,4), []);
  const recentItems = recent.map(id => DATA.find(d=> d.id===id)).filter(Boolean) as Resource[];
  const savedItems = saved.map(id => DATA.find(d=> d.id===id)).filter(Boolean) as Resource[];

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Psychoeducational Resource Hub</h1>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <section className="space-y-4">
          <Card>
            <CardContent className="p-4 grid gap-3 md:grid-cols-5 items-center">
              <div className="md:col-span-2">
                <Input value={query} onChange={(e)=> setQuery(e.target.value)} placeholder="Search by topic (stress, sleep, anxiety...)" className="rounded-full" />
              </div>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="rounded-full"><SelectValue placeholder="Topic"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All topics</SelectItem>
                  {ALL_TOPICS.map(t=> <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="rounded-full"><SelectValue placeholder="Format"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All formats</SelectItem>
                  {ALL_FORMATS.map(f=> <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="rounded-full"><SelectValue placeholder="Language"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All languages</SelectItem>
                  {ALL_LANGUAGES.map(l=> <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="rounded-full"><SelectValue placeholder="Duration"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Any length</SelectItem>
                  <SelectItem value="5">≤ 5 min</SelectItem>
                  <SelectItem value="10">6–10 min</SelectItem>
                  <SelectItem value="20+">10+ min</SelectItem>
                </SelectContent>
              </Select>
              <div className="md:col-span-5 flex justify-end">
                <Button variant="ghost" size="sm" onClick={()=>{ setQuery(""); setTopic("All"); setFormat("All"); setLanguage("All"); setDuration("All"); }}>Reset</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map(r=> (
              <article key={r.id} className={cn(
                "group rounded-2xl border bg-background/60 hover:bg-muted/50 transition p-8", 
                selected?.id===r.id && "ring-2 ring-primary/40"
              )}
                onClick={()=> setSelected(r)}>
                <div className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="h-16 w-16 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 text-xl">{iconFor(r.format)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{r.title}</h3>
                          <p className="text-muted-foreground mt-2 text-base">{r.description}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant={favorites.includes(r.id)?"default":"ghost"} 
                          className="rounded-full ml-4 shrink-0" 
                          onClick={(e)=>{e.stopPropagation(); toggle(favorites, setFavorites, r.id);}}
                        >
                          <Heart className="h-4 w-4"/> 
                        </Button>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {r.topics.map(t=> <Badge key={t} variant="secondary" className="rounded-full text-sm px-3 py-1">{t}</Badge>)}
                        <Badge variant="outline" className="rounded-full text-sm px-3 py-1">{r.language}</Badge>
                        <Badge className="rounded-full text-sm px-3 py-1" variant="outline">{r.duration}m</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Button 
                      size="default" 
                      className="rounded-full px-6 py-2" 
                      variant={selected?.id === r.id ? "default" : "outline"}
                      onClick={(e)=>{
                        e.stopPropagation(); 
                        console.log("Play button clicked for:", r.title, r.id);
                        console.log("Current selected before:", selected?.title, selected?.id);
                        setSelected(r);
                        console.log("setSelected called with:", r.title, r.id);
                        setTimeout(() => {
                          console.log("After timeout, selected should be:", r.title, r.id);
                        }, 50);
                        setTimeout(() => {
                          const preview = document.querySelector('[data-preview-section]');
                          if (preview && window.innerWidth < 1024) {
                            preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                          }
                        }, 100);
                      }}
                    >
                      <Play className="h-5 w-5 mr-2"/> 
                      {selected?.id === r.id ? `✓ Selected: ${r.title.substring(0, 12)}...` : "Play"}
                    </Button>
                    <Button size="default" variant="outline" className="rounded-full px-6 py-2" onClick={(e)=>{e.stopPropagation(); toggle(saved, setSaved, r.id);}}>
                      <Save className="h-5 w-5 mr-2"/> {saved.includes(r.id) ? "Saved" : "Save"}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <Card className="sm:col-span-2 xl:col-span-3"><CardContent className="p-6 text-sm text-muted-foreground">No resources match these filters.</CardContent></Card>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <Collection title="Saved Resources" items={savedItems} onPick={setSelected} />
            <Collection title="Popular this week" items={popular} onPick={setSelected} />
            <Collection title="Recently viewed" items={recentItems} onPick={setSelected} />
          </div>

          {savedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Saved by me</h3>
              <div className="flex flex-wrap gap-2">
                {savedItems.map(i=> (
                  <button key={i.id} className="px-3 py-1.5 rounded-full border text-sm hover:bg-muted" onClick={()=> setSelected(i)}>{i.title}</button>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4" data-preview-section>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                Preview
                {selected && (
                  <span className="text-xs font-normal text-muted-foreground">
                    • {selected.title}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!selected ? (
                <div className="space-y-3 text-center py-8">
                  <div className="text-muted-foreground">
                    <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Click any "Play" button to preview a resource</p>
                  </div>
                </div>
              ) : loadingDetail ? (
                <div className="space-y-3">
                  <Skeleton className="h-40 w-full rounded-xl"/>
                  <Skeleton className="h-4 w-2/3"/>
                  <Skeleton className="h-4 w-1/2"/>
                  <div className="text-xs text-muted-foreground text-center py-2">
                    Loading {selected.title}...
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(selected.format === "Video" || (selected.format === "Exercise" && selected.url && isYouTubeUrl(selected.url)) || (selected.format === "Article" && selected.url && isYouTubeUrl(selected.url))) && (
                    <div>
                      {isYouTubeUrl(selected.url || "") ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="cursor-pointer">
                              <AspectRatio ratio={16/9}>
                                <div className="h-full w-full rounded-lg bg-black/10 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-4 hover:bg-black/20 transition-colors">
                                  <Play className="h-12 w-12 text-primary mb-2" />
                                  <p className="text-sm font-medium">Click to watch on YouTube</p>
                                  <p className="text-xs text-muted-foreground mt-1">{selected.title}</p>
                                  <ExternalLink className="h-4 w-4 text-muted-foreground mt-2" />
                                </div>
                              </AspectRatio>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl w-[90vw]">
                            <DialogHeader>
                              <DialogTitle>{selected.title}</DialogTitle>
                            </DialogHeader>
                            <AspectRatio ratio={16/9}>
                              {(() => {
                                const videoId = getYouTubeVideoId(selected.url || "");
                                console.log("Video URL:", selected.url);
                                console.log("Extracted Video ID:", videoId);
                                console.log("Is YouTube URL:", isYouTubeUrl(selected.url || ""));
                                return videoId ? (
                                  <iframe
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    className="h-full w-full rounded-lg"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <div className="h-full w-full rounded-lg bg-gray-100 flex items-center justify-center">
                                    <p>Unable to load video</p>
                                  </div>
                                );
                              })()}
                            </AspectRatio>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <AspectRatio ratio={16/9}>
                          <video src={selected.url} controls className="h-full w-full rounded-lg object-cover bg-black"/>
                        </AspectRatio>
                      )}
                    </div>
                  )}
                  {selected.format === "Audio" && (
                    <div className="rounded-lg border p-3 bg-background">
                      <div className="text-sm mb-2">{selected.title}</div>
                      <audio 
                        src={selected.url} 
                        controls 
                        className="w-full"
                        onError={(e) => {
                          const target = e.target as HTMLAudioElement;
                          target.style.display = 'none';
                          const errorDiv = target.nextElementSibling as HTMLElement;
                          if (errorDiv) errorDiv.style.display = 'block';
                        }}
                      />
                      <div className="hidden bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                        <p className="font-medium">Audio file not found</p>
                        <p className="text-xs mt-1">
                          Place <code className="bg-yellow-100 px-1 rounded">{selected.url?.split('/').pop()}</code> in the <code className="bg-yellow-100 px-1 rounded">/public/audio/</code> directory
                        </p>
                        <p className="text-xs mt-2">
                          See <code className="bg-yellow-100 px-1 rounded">/public/audio/README.md</code> for setup instructions
                        </p>
                      </div>
                    </div>
                  )}
                  {(selected.format === "Article" || selected.format === "Exercise" || (selected.format === "Video" && selected.url && isYouTubeUrl(selected.url))) && (
                    <div className="rounded-lg border p-4 bg-muted/40 text-sm">
                      <p className="mb-2"><strong>{selected.title}</strong></p>
                      <p className="text-muted-foreground">{selected.description}</p>
                      <div className="mt-2 text-xs">Duration: {selected.duration}m • Language: {selected.language}</div>
                    </div>
                  )}

                  <div>
                    <div className="font-medium">About this resource</div>
                    <p className="text-sm text-muted-foreground">This resource supports {selected.topics.join(", ").toLowerCase()}. Use when you need a quick reset or as part of your daily routine.</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selected.topics.map(t=> <Badge key={t} className="rounded-full" variant="secondary">{t}</Badge>)}
                    <Badge variant="outline" className="rounded-full">{selected.language}</Badge>
                    <Badge variant="outline" className="rounded-full">{selected.duration}m</Badge>
                  </div>

                  <div className="pt-2">
                    <div className="text-sm font-medium mb-1">You may also like…</div>
                    <div className="flex flex-wrap gap-2">
                      {DATA.filter(d=> d.id!==selected.id && d.topics.some(t=> selected.topics.includes(t))).slice(0,4).map(r=> (
                        <button key={r.id} className="px-2.5 py-1.5 rounded-full border text-xs hover:bg-muted" onClick={()=> setSelected(r)}>{r.title}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardContent className="p-4 text-sm">
              <div className="font-medium mb-1">Need more support?</div>
              <p className="text-muted-foreground mb-2">If this doesn’t help, talk to a counselor.</p>
              <div className="flex gap-2">
                <Button asChild size="sm" className="rounded-full"><Link to="/chat">Open Chatbot</Link></Button>
                <Button asChild size="sm" variant="outline" className="rounded-full"><Link to="/booking">Book Counselor</Link></Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Collection({ title, items, onPick }: { title: string; items: Resource[]; onPick: (r: Resource)=>void }){
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 && <div className="text-sm text-muted-foreground">No items yet.</div>}
        {items.map((r)=> (
          <button key={r.id} onClick={()=> onPick(r)} className="w-full rounded-lg border p-2 flex items-center gap-2 hover:bg-muted/60">
            <div className="h-8 w-8 rounded-md bg-primary/10 text-primary grid place-items-center">{iconFor(r.format)}</div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium leading-tight line-clamp-1">{r.title}</div>
              <div className="text-xs text-muted-foreground">{r.duration}m • {r.language}</div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
