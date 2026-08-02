"use client";

import {
  Bot,
  Loader2,
  Maximize2,
  MessageSquareText,
  Minimize2,
  SendHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { AiBot } from "@/components/ai/ai-bot";
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
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2.5 sm:right-6 sm:bottom-6">
      <Card
        aria-hidden={!isOpen}
        className={`pointer-events-auto flex origin-bottom-right flex-col overflow-hidden border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--card),white_3%)_0%,var(--card)_100%)] shadow-[0_28px_70px_-42px_black] transition-[transform,opacity,width,height] duration-240 ease-out ${
          isMaximized
            ? "h-[76vh] w-[min(95vw,72vw)]"
            : "h-[72vh] w-[min(95vw,25rem)] sm:w-[min(92vw,27rem)]"
        } ${isOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-3 scale-95 opacity-0"}`}
      >
        <CardHeader className="border-b border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--muted),transparent_72%)_0%,transparent_100%)] px-4 pb-3 pt-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-[linear-gradient(140deg,color-mix(in_oklch,var(--primary),transparent_78%)_0%,color-mix(in_oklch,var(--primary),transparent_88%)_100%)] text-primary shadow-[0_10px_18px_-14px_color-mix(in_oklch,var(--primary),transparent_40%)]">
                <Bot className="size-[1.125rem]" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <CardTitle className="truncate text-[0.96rem] font-semibold tracking-tight text-foreground">
                  AI Study Assistant
                </CardTitle>
                <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/45 px-2 py-0.5 text-[0.69rem] font-medium text-muted-foreground">
                  <Sparkles className="size-3" />
                  Copilot mode
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                nativeButton
                variant="ghost"
                size="icon-sm"
                className="rounded-lg text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                onClick={() => setIsMaximized((current) => !current)}
                aria-label={isMaximized ? "Restore panel size" : "Maximize panel"}
              >
                {isMaximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </Button>
              <Button
                type="button"
                nativeButton
                variant="ghost"
                size="icon-sm"
                className="rounded-lg text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                onClick={() => setIsOpen(false)}
                aria-label="Close AI assistant"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-3.5 px-3.5 pb-3.5 pt-3">
          <ScrollArea className="min-h-0 flex-1 rounded-2xl border border-border/65 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--muted),transparent_88%)_0%,transparent_100%)]">
            <div className="space-y-4 p-3.5 sm:p-4">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary),transparent_88%)_0%,color-mix(in_oklch,var(--primary),transparent_95%)_46%,transparent_100%)] p-4">
                    <div className="pointer-events-none absolute -top-7 -right-7 size-18 rounded-full bg-primary/10 blur-xl" />
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/65 bg-background/55 text-primary">
                        <Sparkles className="size-[1.125rem]" />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold tracking-tight text-foreground">
                          Your personal interview copilot
                        </p>
                        <p className="text-[0.82rem] leading-relaxed text-muted-foreground">
                          Ask for concise explanations, mock interview questions, and revision guidance based on your roadmap.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="px-0.5 text-[0.66rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                      Suggested prompts
                    </p>
                    <div className="grid gap-2">
                      {STARTER_PROMPTS.map(({ prompt: starterPrompt, title, icon: Icon }) => (
                        <button
                          key={starterPrompt}
                          type="button"
                          className="group flex w-full items-start gap-2.5 rounded-xl border border-border/70 bg-background/55 p-2.5 text-left transition-[transform,border-color,background-color] duration-220 ease-out hover:-translate-y-0.5 hover:border-border hover:bg-background/80"
                          onClick={() => handleStarterPrompt(starterPrompt)}
                        >
                          <span className="mt-0.5 flex size-[1.875rem] shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/35 text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                            <Icon className="size-3.5" />
                          </span>
                          <span className="min-w-0 space-y-0.5">
                            <span className="block text-[0.64rem] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
                              {title}
                            </span>
                            <span className="block text-[0.82rem] leading-snug text-foreground">
                              {starterPrompt}
                            </span>
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
                          ? "max-w-[86%] rounded-2xl rounded-br-md bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary),white_4%)_0%,var(--primary)_100%)] px-3.5 py-2.5 text-[0.84rem] text-primary-foreground shadow-[0_12px_24px_-18px_color-mix(in_oklch,var(--primary),transparent_20%)]"
                          : "max-w-[90%] rounded-2xl rounded-bl-md border border-border/65 bg-background/70 px-3.5 py-2.5 text-[0.84rem] text-foreground"
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
                                <code className="rounded-md bg-muted px-1 py-0.5 text-[0.82em]">{children}</code>
                              ),
                              pre: ({ children }) => (
                                <pre className="overflow-x-auto rounded-lg border border-border/60 bg-muted/60 p-2">
                                  {children}
                                </pre>
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
                            ? "mt-2 text-right text-[0.64rem] text-primary-foreground/75"
                            : "mt-2 text-[0.64rem] text-muted-foreground"
                        }
                      >
                        {formatTimeLabel(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}

              {isLoading ? (
                <div className="animate-in fade-in flex items-start gap-2 duration-200">
                  <div className="rounded-2xl rounded-bl-md border border-border/65 bg-background/70 px-3 py-2.5">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[0.7rem] font-medium text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" />
                      Assistant is typing
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70" />
                      <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:120ms]" />
                      <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/70 [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              ) : null}

              {error ? (
                <p className="animate-in fade-in rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive duration-200">
                  {error}
                </p>
              ) : null}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="mt-auto border-t border-border/70 pt-3">
            <div className="relative rounded-2xl border border-border/70 bg-background/70 p-2 shadow-[0_12px_24px_-24px_black]">
              <Textarea
                ref={composerRef}
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handlePromptKeyDown}
                placeholder="Ask anything about your prep plan..."
                className="h-14 resize-none border-0 bg-transparent px-2 pt-2 pb-12 text-[0.86rem] placeholder:text-muted-foreground/85 focus-visible:ring-0"
                disabled={isLoading}
                aria-label="Prompt for AI Study Assistant"
              />

              <div className="pointer-events-none absolute right-2 bottom-2 left-2 flex items-center justify-between">
                <span className="rounded-full border border-border/60 bg-muted/35 px-2 py-0.5 text-[0.64rem] font-medium text-muted-foreground">
                  Enter to send, Shift+Enter for new line
                </span>

                <Button
                  type="submit"
                  nativeButton
                  size="sm"
                  aria-label="Send prompt"
                  disabled={isLoading || prompt.trim().length === 0}
                  className="pointer-events-auto rounded-lg px-2.5 shadow-sm transition-[background-color,box-shadow] duration-220 hover:bg-primary/90"
                >
                  <SendHorizontal className="size-3.5" />
                  Send
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="relative pointer-events-auto">
        {!isOpen ? (
          <span className="pointer-events-none absolute right-[44px] bottom-[108px] rounded-full border border-white/12 bg-[rgba(14,16,24,0.9)] px-2.5 py-1 text-[0.66rem] font-medium tracking-[0.01em] whitespace-nowrap text-white/78 shadow-[0_10px_20px_-16px_black]">
            Hello, how may I help you?
          </span>
        ) : null}

        <button
          type="button"
          className="size-[120px] cursor-pointer bg-transparent p-0 text-inherit transition-transform duration-200 ease-out hover:scale-[1.2]"
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        >
          <AiBot className="size-[112px]" />
        </button>
      </div>
    </div>
  );
}