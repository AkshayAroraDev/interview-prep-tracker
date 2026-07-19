"use client";

import { ArrowUp, Bot, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

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

const INITIAL_COMPOSER_HEIGHT_PX = 56;
const MAX_COMPOSER_HEIGHT_PX = 192;

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
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (composerRef.current) {
      resizeComposer(composerRef.current);
    }
  }, [prompt, isOpen]);

  // Submit helper shared by Enter key and Send button.
  const submitPrompt = async (): Promise<void> => {
    const message = prompt.trim();

    if (!message || isLoading) {
      return;
    }

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

      setResponse(nextResponse);
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
            {/* Single response view for phase-1 connectivity testing. */}
            <ScrollArea className="min-h-0 flex-1 rounded-xl border border-border/70 bg-muted/20 p-4">
              {isLoading ? (
                <div className="flex h-full items-center gap-2 text-[0.95rem] text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Thinking...
                </div>
              ) : error ? (
                <p className="text-[0.95rem] text-destructive">{error}</p>
              ) : response ? (
                <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-foreground">{response}</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[0.95rem] text-muted-foreground">
                    Ready when you are. Try one of these prompts:
                  </p>
                  <div className="space-y-2 text-[0.92rem] text-muted-foreground">
                    <p>&quot;Explain React reconciliation in simple terms.&quot;</p>
                    <p>&quot;Give me 5 Node.js interview questions with short answers.&quot;</p>
                    <p>&quot;What is the difference between SQL joins types?&quot;</p>
                  </div>
                </div>
              )}
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