import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Bot, ShieldCheck, SendHorizontal, Loader2 } from "lucide-react";



interface Message {
  role: "bot" | "user";
  text: string;
  timestamp?: string;
  emotionalTone?: string;
  riskLevel?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi, I'm your AI counselor. I'm here to listen and support you. How are you feeling right now?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendToAI = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = { role: "user", text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput(''); // Clear input immediately
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role === "bot" ? "counselor" as const : "user" as const,
        content: m.text,
        timestamp: m.timestamp,
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          conversationHistory,
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      const botMessage: Message = {
        role: "bot",
        text: data.response,
        timestamp: new Date().toISOString(),
        emotionalTone: data.emotionalTone,
        riskLevel: data.riskIndicators?.level,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: Message = {
        role: "bot",
        text: "I apologize, but I'm having trouble connecting right now. Please try again, or consider reaching out to a human counselor if you need immediate support.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const send = (text: string) => sendToAI(text);
  const chooseQuick = (text: string) => sendToAI(text);

  return (
    <div className="container py-6 grid lg:grid-cols-[2fr_1fr] gap-6 min-h-[calc(100vh-56px-56px)]">
      <div className="space-y-4">
        <Alert className="bg-primary/10 border-primary/30">
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Talk to a counselor now</AlertTitle>
          <AlertDescription>
            <div className="flex flex-wrap items-center gap-3">
              <span>If you prefer human support, you can book a confidential session or call the helpline below.</span>
              <a href="/booking" className="inline-flex items-center gap-2 rounded-full bg-primary/90 text-primary-foreground px-3 py-1.5 text-xs">Book now</a>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "bot" ? "flex gap-3" : "flex gap-3 justify-end"}>
                  {m.role === "bot" && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center"><Bot className="h-4 w-4"/></div>
                  )}
                  <div className={m.role === "bot" ? "bg-muted rounded-2xl rounded-tl-md p-3 max-w-[70%]" : "bg-primary text-primary-foreground rounded-2xl rounded-tr-md p-3 max-w-[70%]"}>
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    {m.role === "bot" && (m.emotionalTone || m.riskLevel) && (
                      <div className="flex gap-2 mt-2">
                        {m.emotionalTone && (
                          <Badge variant="outline" className="text-xs">
                            {m.emotionalTone}
                          </Badge>
                        )}
                        {m.riskLevel && m.riskLevel !== "none" && (
                          <Badge variant={m.riskLevel === "high" || m.riskLevel === "critical" ? "destructive" : "secondary"} className="text-xs">
                            Risk: {m.riskLevel}
                          </Badge>
                        )}
                      </div>
                    )}
                    {m.timestamp && (
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(m.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center"><Bot className="h-4 w-4"/></div>
                  <div className="bg-muted rounded-2xl rounded-tl-md p-3 max-w-[70%] flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {[
                  "I'm stressed",
                  "Can't sleep",
                  "Feeling anxious",
                  "I need someone to talk to",
                ].map((q) => (
                  <button key={q} onClick={()=>chooseQuick(q)} className="px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm">
                    {q}
                  </button>
                ))}
              </div>



              <div ref={bottomRef} />
            </div>

            <div className="border-t p-3 flex items-center gap-2">
              <Input 
                value={input} 
                onChange={(e)=>setInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
                placeholder="Type a message" 
                className="rounded-full"
                disabled={isLoading}
              />
              <Button 
                onClick={()=>send(input)} 
                className="rounded-full" 
                size="icon"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4"/>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <WellnessBreathing />
        <GroundingFive />
        <TipsCard />
      </div>
    </div>
  );
}

function WellnessBreathing(){
  const [count, setCount] = useState(4);
  const [phase, setPhase] = useState<"Inhale"|"Hold"|"Exhale">("Inhale");
  useEffect(()=>{
    const t = setInterval(()=>{
      setCount((c)=> c>1 ? c-1 : 4);
      setPhase((p)=> p === "Inhale" ? "Hold" : p === "Hold" ? "Exhale" : "Inhale");
    }, 1000);
    return ()=> clearInterval(t);
  },[]);
  return (
    <Card className="bg-teal-50/50 dark:bg-teal-900/20">
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground mb-2">Breathing timer</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">{count}</div>
            <div className="text-sm">{phase}</div>
          </div>
          <div className="h-20 w-20 rounded-full bg-primary/10 grid place-items-center animate-pulse">
            <div className="h-12 w-12 rounded-full bg-primary/20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GroundingFive(){
  const items = ["5 things you can see","4 things you can feel","3 things you can hear","2 things you can smell","1 thing you can taste"];
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="text-sm text-muted-foreground">5-4-3-2-1 Grounding</div>
        {items.map((t, i)=> (
          <div key={i} className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">{5-i}</Badge>
            <span className="text-sm">{t}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TipsCard(){
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="text-sm text-muted-foreground">Quick tips</div>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Try a short walk and hydrate</li>
          <li>Limit caffeine late in the day</li>
          <li>Reach out to a trusted peer</li>
        </ul>
      </CardContent>
    </Card>
  );
}
