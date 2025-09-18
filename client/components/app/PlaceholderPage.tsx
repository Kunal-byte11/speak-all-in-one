import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PlaceholderPage({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="container py-10">
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground max-w-prose">{description ?? "This section is coming next. Tell me to fill it in and I'll wire it up."}</p>
          <div className="flex gap-3">
            <Button asChild className="rounded-full"><Link to="/chat">Open Chatbot</Link></Button>
            <Button variant="outline" asChild className="rounded-full"><Link to="/">Back to Home</Link></Button>
          </div>
        </div>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {children ?? (
              <div className="text-muted-foreground text-sm">
                Placeholder content. Ask to implement this page to replace it with the real UI.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
