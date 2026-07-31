"use client";

import {
  Bot,
  Loader2,
  Maximize2,
  MessageSquareText,
  Minimize2,
  SendHorizontal,
  Sparkles,
} from "lucide-react";
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

interface ChatSuccessResponse {
  response?: unknown;
}

interface ChatErrorResponse {
  error?: unknown;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const INITIAL_COMPOSER_HEIGHT_PX = 56;
const MAX_COMPOSER_HEIGHT_PX = 192;

const STARTER_PROMPTS: ReadonlyArray<{
  prompt: string;
  title: string;
  icon: typeof Sparkles;
}> = [
  {
    prompt: "Explain React reconciliation simply",
    title: "React concepts",
    icon: Sparkles,
  },
  {
    prompt: "Quiz me on Angular Dependency Injection",
    title: "Interview quiz",
    icon: MessageSquareText,
  },
  {
    prompt: "Generate 5 JavaScript interview questions",
    title: "Question generator",
    icon: Bot,
  },
  {
    prompt: "What's left for me to revise?",
    title: "Revision planner",
    icon: Sparkles,
  },
  {
    prompt: "Explain this topic using my roadmap",
    title: "Roadmap guidance",
    icon: MessageSquareText,
  },
];

function formatTimeLabel(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function resizeComposer(textarea: HTMLTextAreaElement): void {
  textarea.style.height = "auto";
  const nextHeight = Math.min(
    Math.max(textarea.scrollHeight, INITIAL_COMPOSER_HEIGHT_PX),
    MAX_COMPOSER_HEIGHT_PX,
  );

  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > MAX_COMPOSER_HEIGHT_PX ? "auto" : "hidden";
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (composerRef.current) {
      resizeComposer(composerRef.current);
    }
  }, [prompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading, error]);

  // Submit helper shared by Enter key and Send button.
  const submitPrompt = async (): Promise<void> => {
    const message = prompt.trim();

    if (!message || isLoading) {
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", content: message, createdAt: new Date().toISOString() },
    ]);
    setIsLoading(true);
    setError("");

    try {
      const result = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!result.ok) {
        const payload = (await result.json().catch(() => ({}))) as ChatErrorResponse;
        const message =
          typeof payload.error === "string" && payload.error.trim()
            ? payload.error
            : "Failed to generate response.";

        throw new Error(message);
      }

      const payload = (await result.json()) as ChatSuccessResponse;
      const nextResponse =
        typeof payload.response === "string" && payload.response.trim()
          ? payload.response
          : "No response returned.";

      setMessages((current) => [
        ...current,
        { role: "assistant", content: nextResponse, createdAt: new Date().toISOString() },
      ]);
      setPrompt("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitPrompt();
  };

  const handlePromptKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter submits, while Shift+Enter keeps multiline input behavior.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submitPrompt();
    }
  };

  const handlePromptChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
    resizeComposer(event.target);
  };

  const handleStarterPrompt = (starterPrompt: string) => {
    setPrompt(starterPrompt);
    if (composerRef.current) {
      composerRef.current.focus();
      resizeComposer(composerRef.current);
    }
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {isOpen ? (
        <Card
          className={`pointer-events-auto border-border/80 bg-card/95 shadow-xl backdrop-blur-sm ${
            isMaximized
              ? "h-[75vh] w-[min(94vw,70vw)]"
              : "h-[70vh] w-[min(94vw,700px)] max-sm:h-[78vh]"
          }`}
        >
          <CardHeader className="border-b border-border/70 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-primary/10 text-primary">
                  <Bot className="size-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold tracking-tight">AI Study Assistant</CardTitle>
                  <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[0.72rem] font-medium text-muted-foreground">
                    <Sparkles className="size-3" />
                    Powered by Gemini
                  </div>
                </div>
              </div>
              <Button
                type="button"
                nativeButton
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsMaximized((current) => !current)}
                aria-label={isMaximized ? "Restore panel size" : "Maximize panel"}
              >
                {isMaximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 pt-4">
            {/* Chat history is local to this component only (no persistence). */}
            <ScrollArea className="min-h-0 flex-1 rounded-xl border border-border/70 bg-muted/15 p-0">
              <div className="space-y-4 p-4 sm:p-5">
                {messages.length === 0 ? (
                  <div className="space-y-6">
                    <div className="space-y-3 rounded-xl border border-border/60 bg-background/40 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/40">
                          <Sparkles className="size-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-medium text-foreground">
                            Welcome to your AI study copilot
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Ask for explanations, quick quizzes, revision plans, or interview-style questions tailored to your roadmap.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                        Suggested prompts
                      </p>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        {STARTER_PROMPTS.map(({ prompt: starterPrompt, title, icon: Icon }) => (
                          <button
                            key={starterPrompt}
                            type="button"
                            className="group flex w-full cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-background/50 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:bg-background/70"
                            onClick={() => handleStarterPrompt(starterPrompt)}
                          >
                            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                              <Icon className="size-4" />
                            </span>
                            <span className="min-w-0 space-y-0.5">
                              <span className="block text-[0.72rem] font-medium tracking-wide text-muted-foreground uppercase">
                                {title}
                              </span>
                              <span className="block text-sm text-foreground">{starterPrompt}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={`animate-in fade-in duration-200 ${
                        message.role === "user" ? "flex justify-end" : "flex justify-start"
                      }`}
                    >
                      <div
                        className={
                          message.role === "user"
                            ? "max-w-[86%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm text-primary-foreground shadow-sm"
                            : "max-w-[90%] rounded-2xl rounded-bl-md border border-border/60 bg-background/70 px-3.5 py-2.5 text-sm text-foreground"
                        }
                      >
                        {message.role === "assistant" ? (
                          <div className="space-y-2 leading-relaxed">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="my-2">{children}</p>,
                                ul: ({ children }) => <ul className="my-2 list-disc pl-5">{children}</ul>,
                                ol: ({ children }) => <ol className="my-2 list-decimal pl-5">{children}</ol>,
                                li: ({ children }) => <li className="my-1">{children}</li>,
                                code: ({ children }) => (
                                  <code className="rounded bg-muted px-1 py-0.5 text-[0.85em]">{children}</code>
                                ),
                                pre: ({ children }) => (
                                  <pre className="overflow-x-auto rounded-lg bg-muted/70 p-2">{children}</pre>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        )}

                        <p
                          className={
                            message.role === "user"
                              ? "mt-2 text-right text-[0.68rem] text-primary-foreground/70"
                              : "mt-2 text-[0.68rem] text-muted-foreground"
                          }
                        >
                          {formatTimeLabel(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {isLoading ? (
                  <div className="animate-in fade-in flex items-start gap-2.5 duration-200">
                    <div className="rounded-2xl rounded-bl-md border border-border/60 bg-background/70 px-3.5 py-2.5">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin" />
                        Gemini is typing...
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70" />
                        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:120ms]" />
                        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:240ms]" />
                      </div>
                    </div>
                  </div>
                ) : null}

                {error ? (
                  <p className="animate-in fade-in rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive duration-200">
                    {error}
                  </p>
                ) : null}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Minimal prompt form with Enter-to-send behavior. */}
            <form onSubmit={handleSubmit} className="mt-auto border-t border-border/70 pt-4">
              <div className="relative">
                <Textarea
                  ref={composerRef}
                  value={prompt}
                  onChange={handlePromptChange}
                  onKeyDown={handlePromptKeyDown}
                  placeholder="Ask about any interview topic..."
                  className="h-16 resize-none rounded-xl border-border/80 bg-background/60 pr-20 pb-12 placeholder:text-[0.95rem] placeholder:text-muted-foreground/80 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring/60"
                  disabled={isLoading}
                  aria-label="Prompt for AI Study Assistant"
                />

                <Button
                  type="submit"
                  nativeButton
                  size="sm"
                  aria-label="Send prompt"
                  disabled={isLoading || prompt.trim().length === 0}
                  className="absolute right-2 bottom-2 rounded-lg px-2.5 shadow-sm transition-all duration-200 hover:bg-primary/90"
                >
                  <SendHorizontal className="size-3.5" />
                  Send
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {/* Floating toggle button stays visible on every page. */}
      <Button
        type="button"
        nativeButton
        size="icon-lg"
        className="pointer-events-auto rounded-full shadow-lg"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Bot className="size-5" />}
      </Button>
    </div>
  );
}