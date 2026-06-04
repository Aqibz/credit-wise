import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Minus, Send, Paperclip, Smile } from "lucide-react";

type Msg = { id: string; from: "bot" | "me"; text: string; time: string };

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "1", from: "bot", text: "👋 Hi there! Welcome to CreditWise Support. How can I help you today?", time: "Just now" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open, min]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { id: String(Date.now()), from: "me", text: t, time: now() }]);
    setText("");
    setTimeout(() => {
      setMsgs((m) => [...m, { id: String(Date.now() + 1), from: "bot", text: "Thanks! A support agent will reply shortly. Meanwhile you can check the Help Center for instant answers.", time: now() }]);
    }, 900);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => { setOpen(true); setMin(false); }}
          className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary text-primary-foreground shadow-xl grid place-items-center hover:scale-105 transition-transform ring-4 ring-primary/20"
          aria-label="Open live chat"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-success border-2 border-background" />
        </button>
      )}

      {open && (
        <div
          className={`fixed bottom-5 right-5 z-50 w-[360px] rounded-2xl bg-card border shadow-2xl overflow-hidden flex flex-col transition-all ${
            min ? "h-14" : "h-[520px] max-h-[80vh]"
          }`}
        >
          <div className="bg-gradient-to-br from-primary to-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-white/20 grid place-items-center font-bold text-sm">QS</div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-success border-2 border-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight">CreditWise Support</div>
              <div className="text-[11px] opacity-80">We typically reply in a few minutes</div>
            </div>
            <button onClick={() => setMin((m) => !m)} className="p-1 hover:bg-white/15 rounded" aria-label="Minimize">
              <Minus className="h-4 w-4" />
            </button>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/15 rounded" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          {!min && (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-muted/20">
                {msgs.map((m) => (
                  <div key={m.id} className={`flex gap-2 ${m.from === "me" ? "justify-end" : ""}`}>
                    {m.from === "bot" && (
                      <div className="h-7 w-7 shrink-0 rounded-full bg-primary-soft text-primary grid place-items-center text-[10px] font-bold">QS</div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      m.from === "me"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border rounded-bl-sm"
                    }`}>
                      <div>{m.text}</div>
                      <div className={`text-[10px] mt-1 ${m.from === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{m.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              <div className="border-t bg-card p-2.5">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-muted-foreground hover:text-foreground" aria-label="Attach"><Paperclip className="h-4 w-4" /></button>
                  <button className="p-2 text-muted-foreground hover:text-foreground" aria-label="Emoji"><Smile className="h-4 w-4" /></button>
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={send}
                    className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center hover:opacity-90"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-center text-[10px] text-muted-foreground mt-1.5">
                  Powered by CreditWise · We respect your privacy
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
