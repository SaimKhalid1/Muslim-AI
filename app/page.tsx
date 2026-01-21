import { Card, CardContent } from "@/components/Card";
import { Button } from "@/components/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DailyMotivation } from "@/components/DailyMotivation";
import { DuaBuilder } from "@/components/DuaBuilder";
import { Chat } from "@/components/Chat";
import { Logo } from "@/components/Logo";
import { MessageCircle, Wrench } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen app-bg">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Logo size={112} />
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Islam AI</h1>
              <p className="text-sm text-[rgb(var(--muted))]">A calm, spiritual space to learn, reflect, and ask.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <a href="#tools"><Button variant="outline"><Wrench size={16} className="mr-2" />Open Tools</Button></a>
              <a href="#chat"><Button><MessageCircle size={16} className="mr-2" />Open Chat</Button></a>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <section id="tools" className="mt-8 space-y-4">
          <Card className="spiritual-border">
            <CardContent>
              <DailyMotivation />
            </CardContent>
          </Card>

          <Card className="spiritual-border-emerald">
            <CardContent>
              <DuaBuilder />
            </CardContent>
          </Card>
        </section>

        <section id="chat" className="mt-8">
          <Chat />
        </section>

        <footer className="mt-10 text-xs text-[rgb(var(--muted))]">
          Not a fatwa service — for rulings, consult a qualified scholar.
        </footer>
      </div>
    </main>
  );
}
