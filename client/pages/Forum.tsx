import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageSquare, Flag, Pin, Lock, Trash2, Crown, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type Topic = "Stress" | "Exams" | "Sleep" | "Relationships" | "Mindfulness" | "General";

interface Reply { id: string; author: string; text: string; createdAt: string; }
interface Thread {
  id: string;
  author: string; // pseudonym
  volunteer?: boolean;
  mod?: boolean;
  title: string;
  body: string;
  topic: Topic;
  tags: string[];
  likes: number;
  replies: Reply[];
  createdAt: string;
  pinned?: boolean;
  locked?: boolean;
}

const NOW = new Date();
const fmt = (d: Date) => d.toLocaleString(undefined, { month: "short", day: "numeric" });

const SEED: Thread[] = [
  { id: "t1", author: "Student23", volunteer: true, title: "Exam stress night before tips?", body: "My exam is tomorrow and I can't sleep. Any quick ways to calm down?", topic: "Exams", tags: ["Exams", "Stress"], likes: 18, replies: [ { id: "r1", author: "Helper7", text: "Try 4-7-8 breathing and put phone away 30 mins before.", createdAt: fmt(new Date(NOW.getTime()-1000*60*60*5)) } ], createdAt: fmt(new Date(NOW.getTime()-1000*60*60*6)), pinned: true },
  { id: "t2", author: "Student5", title: "Waking up tired even after 8 hours", body: "Any routines that helped your sleep quality?", topic: "Sleep", tags: ["Sleep"], likes: 9, replies: [], createdAt: fmt(new Date(NOW.getTime()-1000*60*60*20)) },
  { id: "t3", author: "Listener1", volunteer: true, title: "Mindfulness apps that are free?", body: "Looking for free mindfulness exercises or apps.", topic: "Mindfulness", tags: ["Mindfulness", "Apps"], likes: 11, replies: [], createdAt: fmt(new Date(NOW.getTime()-1000*60*60*30)) },
  { id: "t4", author: "Student12", title: "Group project anxiety", body: "Heart races before meetings. What helps you feel grounded?", topic: "Stress", tags: ["Stress", "Grounding"], likes: 6, replies: [], createdAt: fmt(new Date(NOW.getTime()-1000*60*60*40)) },
];

const TOPICS: Topic[] = ["Stress", "Exams", "Sleep", "Relationships", "Mindfulness", "General"];

function pseudo(){ return `Student${new Date().getDate()}`; }

export default function Forum(){
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState<string>("All");
  const [sort, setSort] = useState<string>("Newest");
  const [threads, setThreads] = useState<Thread[]>(SEED);
  const [selected, setSelected] = useState<Thread | null>(SEED[0]);
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newTopic, setNewTopic] = useState<Topic>("General");
  const [anon, setAnon] = useState(true);
  const [modMode, setModMode] = useState(false);

  const listEndRef = useRef<HTMLDivElement | null>(null);
  const [showCount, setShowCount] = useState(6);
  useEffect(()=>{
    const io = new IntersectionObserver((entries)=>{
      if(entries[0].isIntersecting){ setShowCount((c)=> Math.min(c+5, threads.length)); }
    });
    if(listEndRef.current) io.observe(listEndRef.current);
    return ()=> io.disconnect();
  }, [threads.length]);

  const filtered = useMemo(()=>{
    let arr = threads.filter(t=> (topic === "All" || t.topic === topic) && (search.trim()==="" || (t.title+" "+t.body+" "+t.tags.join(" ")).toLowerCase().includes(search.toLowerCase())));
    if(sort === "Most Active") arr = arr.sort((a,b)=> b.replies.length - a.replies.length);
    else if(sort === "Most Liked") arr = arr.sort((a,b)=> b.likes - a.likes);
    else arr = arr; // Newest seeded first
    return arr;
  }, [threads, topic, sort, search]);

  const like = (tid: string) => setThreads(ts=> ts.map(t=> t.id===tid ? { ...t, likes: t.likes+1 } : t));
  const reply = (tid: string, text: string) => setThreads(ts=> ts.map(t=> t.id===tid ? { ...t, replies: [...t.replies, { id: Math.random().toString(36).slice(2), author: pseudo(), text, createdAt: fmt(new Date()) }] } : t));

  const create = () => {
    const th: Thread = { id: Math.random().toString(36).slice(2), author: anon ? pseudo() : `User${Math.floor(Math.random()*1000)}`, title: newTitle.trim(), body: newBody.trim(), topic: newTopic, tags: [newTopic], likes: 0, replies: [], createdAt: fmt(new Date()) };
    setThreads([th, ...threads]);
    setSelected(th);
    setNewOpen(false); setNewTitle(""); setNewBody("");
  };

  const youMayLike = useMemo(()=> filtered.filter(t=> t.id!==selected?.id && t.topic===selected?.topic).slice(0,4), [filtered, selected]);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Peer Support Forum</h1>
        <div className="flex items-center gap-2">
          <Button className="rounded-full" onClick={()=> setNewOpen(true)}>Create Post</Button>
          <Button variant={modMode?"default":"outline"} className="rounded-full" onClick={()=> setModMode(v=>!v)}>{modMode?"Moderator mode on":"Moderator mode"}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <section className="space-y-4">
          <Card>
            <CardContent className="p-4 grid gap-3 md:grid-cols-5 items-center">
              <div className="md:col-span-2"><Input value={search} onChange={(e)=> setSearch(e.target.value)} placeholder="Search discussions…" className="rounded-full"/></div>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="rounded-full"><SelectValue placeholder="Topic"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All topics</SelectItem>
                  {TOPICS.map(t=> <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="rounded-full"><SelectValue placeholder="Sort"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Newest">Newest</SelectItem>
                  <SelectItem value="Most Active">Most Active</SelectItem>
                  <SelectItem value="Most Liked">Most Liked</SelectItem>
                </SelectContent>
              </Select>
              <div className="md:col-span-5 flex justify-end"><Button variant="ghost" size="sm" onClick={()=>{ setSearch(""); setTopic("All"); setSort("Newest"); }}>Reset</Button></div>
            </CardContent>
          </Card>

          <Pinned />

          <div className="space-y-3">
            {filtered.slice(0, showCount).map(t=> (
              <ThreadCard key={t.id} t={t} onOpen={()=> setSelected(t)} onLike={()=> like(t.id)} />
            ))}
            <div ref={listEndRef} />
          </div>
        </section>

        <aside className="space-y-4">
          {selected && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Preview</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2"><span className="font-medium">{selected.title}</span>{selected.locked && <Badge variant="secondary">Locked</Badge>}{selected.pinned && <Badge>Pinned</Badge>}</div>
                    <div className="text-xs text-muted-foreground">by {selected.author} • {selected.createdAt}</div>
                    <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{selected.body}</div>
                    <div className="mt-2 flex flex-wrap gap-1">{[selected.topic, ...selected.tags].map((x,i)=> <Badge key={i} variant="secondary" className="rounded-full">{x}</Badge>)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" className="rounded-full" onClick={()=> like(selected.id)}><Heart className="h-4 w-4 mr-1"/> Like {selected.likes}</Button>
                  <Button size="sm" variant="outline" className="rounded-full"><MessageSquare className="h-4 w-4 mr-1"/> Reply</Button>
                  <Button size="sm" variant="ghost" className="rounded-full"><Flag className="h-4 w-4 mr-1"/> Flag</Button>
                  {modMode && (
                    <div className="ml-auto flex items-center gap-1">
                      <Button size="sm" variant="outline" className="rounded-full"><Pin className="h-4 w-4 mr-1"/> Pin</Button>
                      <Button size="sm" variant="outline" className="rounded-full"><Lock className="h-4 w-4 mr-1"/> Lock</Button>
                      <Button size="sm" variant="destructive" className="rounded-full"><Trash2 className="h-4 w-4 mr-1"/> Delete</Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="text-sm font-medium">Replies</div>
                  {selected.replies.length === 0 && <div className="text-sm text-muted-foreground">No replies yet. Be kind and supportive.</div>}
                  {selected.replies.map(r=> (
                    <div key={r.id} className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground mb-1">{r.author} • {r.createdAt}</div>
                      <div className="text-sm whitespace-pre-wrap">{r.text}</div>
                    </div>
                  ))}
                  <QuickReply onSubmit={(text)=> reply(selected.id, text)} />
                </div>

                <Card className="bg-primary/5">
                  <CardContent className="p-3 text-sm">
                    If this seems unsafe, please talk to a counselor.
                    <div className="mt-2 flex gap-2"><Button asChild size="sm" className="rounded-full"><Link to="/chat">Chatbot</Link></Button><Button asChild size="sm" variant="outline" className="rounded-full"><Link to="/booking">Book</Link></Button></div>
                  </CardContent>
                </Card>

                <YouMayLike items={youMayLike} onPick={setSelected} />
              </CardContent>
            </Card>
          )}

          <Volunteers />
        </aside>
      </div>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create a post</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Title" value={newTitle} onChange={(e)=> setNewTitle(e.target.value)} />
            <Select value={newTopic} onValueChange={(v)=> setNewTopic(v as Topic)}>
              <SelectTrigger><SelectValue placeholder="Topic"/></SelectTrigger>
              <SelectContent>
                {TOPICS.map(t=> <SelectItem value={t} key={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea rows={5} placeholder="Share what's on your mind…" value={newBody} onChange={(e)=> setNewBody(e.target.value)} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={anon} onChange={(e)=> setAnon(e.target.checked)} /> Post anonymously</label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setNewOpen(false)}>Cancel</Button>
            <Button onClick={create} disabled={!newTitle.trim() || !newBody.trim()}>Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ThreadCard({ t, onOpen, onLike }: { t: Thread; onOpen: ()=>void; onLike: ()=>void }){
  return (
    <article className="rounded-2xl border p-4 bg-background/60 hover:bg-muted/50 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">{t.volunteer && <Crown className="h-3.5 w-3.5 text-primary"/>}{t.author}{t.volunteer && <Badge className="rounded-full ml-1">Volunteer</Badge>}</span>
            <span>• {t.createdAt}</span>
          </div>
          <h3 className="font-medium">{t.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">{t.body}</p>
          <div className="flex flex-wrap gap-1 mt-1">{[t.topic, ...t.tags].map((x,i)=> <Badge key={i} variant="secondary" className="rounded-full">{x}</Badge>)}</div>
        </div>
        <div className="shrink-0 text-right text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 rounded-full border hover:bg-muted" onClick={onLike}><Heart className="h-3.5 w-3.5 mr-1 inline"/> {t.likes}</button>
            <div className="px-2 py-1 rounded-full border"><MessageSquare className="h-3.5 w-3.5 mr-1 inline"/> {t.replies.length}</div>
          </div>
          <Button size="sm" className="rounded-full mt-2" onClick={onOpen}>Open Thread</Button>
        </div>
      </div>
    </article>
  );
}

function QuickReply({ onSubmit }: { onSubmit: (text: string)=>void }){
  const [text, setText] = useState("");
  return (
    <div className="grid gap-2">
      <Textarea rows={3} value={text} onChange={(e)=> setText(e.target.value)} placeholder="Write a supportive reply…" />
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Posting as {pseudo()}</div>
        <Button className="rounded-full" onClick={()=> { if(text.trim()) { onSubmit(text.trim()); setText(""); } }}>Reply</Button>
      </div>
    </div>
  );
}

function Pinned(){
  return (
    <Card className="bg-primary/5">
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="text-sm">
          <span className="font-medium mr-2">Pinned:</span>
          Be kind. Protect privacy. If you or a friend are in danger, contact the helpline or <a className="underline" href="/chat">talk to the bot</a>.
        </div>
        <div className="hidden sm:block text-xs text-muted-foreground">Guidelines • 988 Lifeline • Campus support</div>
      </CardContent>
    </Card>
  );
}

function Volunteers(){
  const items = [
    { name: "Helper7", badge: "Listener" },
    { name: "CareBuddy", badge: "Top Contributor" },
    { name: "PeerSam", badge: "Helper" },
  ];
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Volunteer highlight</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map((v)=> (
          <div key={v.name} className="rounded-lg border p-2 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center"><UserRound className="h-4 w-4"/></div>
            <div className="flex-1">
              <div className="text-sm font-medium">{v.name}</div>
              <div className="text-xs text-muted-foreground">{v.badge}</div>
            </div>
            <Badge className="rounded-full">Volunteer</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function YouMayLike({ items, onPick }: { items: Thread[]; onPick: (t: Thread)=>void }){
  if(items.length === 0) return null;
  return (
    <div>
      <div className="text-sm font-medium mb-1">You may like</div>
      <div className="flex flex-wrap gap-2">
        {items.map(t=> (
          <button key={t.id} onClick={()=> onPick(t)} className="px-2.5 py-1.5 rounded-full border text-xs hover:bg-muted">{t.title}</button>
        ))}
      </div>
    </div>
  );
}
