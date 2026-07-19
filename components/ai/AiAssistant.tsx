"use client";

import { ArrowUp, Bot, Loader2, Maximize2, Minimize2 } from "lucide-react";
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
}

const INITIAL_COMPOSER_HEIGHT_PX = 56;
const MAX_COMPOSER_HEIGHT_PX = 192;
const STARTER_PROMPTS = [
  "Explain React reconciliation in simple terms.",
  "Give me 5 Node.js interview questions with short answers.",
  "What is the difference between SQL joins types?",
];

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

    setMessages((current) => [...current, { role: "user", content: message }]);
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

      setMessages((current) => [...current, { role: "assistant", content: nextResponse }]);
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
          className={`pointer-events-auto border-border/80 bg-card shadow-lg ${
            isMaximized
              ? "h-[75vh] w-[min(94vw,70vw)]"
              : "h-[70vh] w-[min(94vw,700px)] max-sm:h-[78vh]"
          }`}
        >
          <CardHeader className="flex-row items-center justify-between border-b border-border/70 pb-4">
            <CardTitle className="text-base font-semibold tracking-tight">AI Study Assistant</CardTitle>
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
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 pt-4">
            {/* Chat history is local to this component only (no persistence). */}
            <ScrollArea className="min-h-0 flex-1 rounded-xl border border-border/70 bg-muted/20 p-4">
              <div className="space-y-3">
                {messages.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-[0.95rem] text-muted-foreground">
                      Ready when you are. Try one of these prompts:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {STARTER_PROMPTS.map((starterPrompt) => (
                        <Button
                          key={starterPrompt}
                          type="button"
                          nativeButton
                          variant="outline"
                          size="sm"
                          className="h-auto rounded-full px-3 py-1.5 text-left text-[0.82rem]"
                          onClick={() => handleStarterPrompt(starterPrompt)}
                        >
                          {starterPrompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={
                        message.role === "user"
                          ? "ml-auto max-w-[85%] rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                          : "max-w-[90%] rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-sm text-foreground"
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
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  ))
                )}

                {isLoading ? (
                  <div className="flex items-center gap-2 text-[0.95rem] text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Thinking...
                  </div>
                ) : null}

                {error ? <p className="text-[0.95rem] text-destructive">{error}</p> : null}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Minimal prompt form with Enter-to-send behavior. */}
            <form onSubmit={handleSubmit} className="mt-auto border-t border-border/70 pt-3">
              <div className="relative">
                <Textarea
                  ref={composerRef}
                  value={prompt}
                  onChange={handlePromptChange}
                  onKeyDown={handlePromptKeyDown}
                  placeholder="Ask about any interview topic..."
                  className="h-14 resize-none pr-14 pb-12 placeholder:text-[0.95rem]"
                  disabled={isLoading}
                  aria-label="Prompt for AI Study Assistant"
                />

                <Button
                  type="submit"
                  nativeButton
                  size="icon"
                  aria-label="Send prompt"
                  disabled={isLoading || prompt.trim().length === 0}
                  className="absolute right-2 bottom-2 rounded-full shadow-sm transition-colors duration-150 hover:bg-primary/90"
                >
                  <ArrowUp className="size-4" />
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