"use client";

import { useState } from "react";
import { Bot, ThumbsDown, ThumbsUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SourceList } from "@/components/sources/SourceCard";
import { chatApi } from "@/lib/api/client";
import type { Message } from "@/types";

export function NeuChatMessage({ message }: { message: Message }) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const isUser = message.role === "user";
  const isUnknown = !isUser && message.content.includes("couldn't find enough information");

  const handleFeedback = async (type: "positive" | "negative") => {
    if (feedback || feedbackLoading) return;
    setFeedbackLoading(true);
    try {
      await chatApi.submitFeedback(message.id, type);
      setFeedback(type);
    } catch {
      // silent
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] p-4 bg-blue-600 text-white rounded-lg">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="shrink-0 mt-1 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
        <Bot className="h-4 w-4 text-blue-600" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <Card className={`p-5 ${isUnknown ? "bg-gray-50" : ""}`}>
          <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{message.content}</p>
          {message.sources && message.sources.length > 0 && (
            <SourceList sources={message.sources} />
          )}
        </Card>
        {!isUnknown && message.id && !message.id.startsWith("temp-") && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">Was this helpful?</span>
            <Button
              variant="icon"
              className="!p-2 !min-w-0 !min-h-0 h-9 w-9"
              onClick={() => handleFeedback("positive")}
              disabled={!!feedback}
              aria-label="Helpful"
            >
              <ThumbsUp className={`h-4 w-4 ${feedback === "positive" ? "text-green-600" : ""}`} />
            </Button>
            <Button
              variant="icon"
              className="!p-2 !min-w-0 !min-h-0 h-9 w-9"
              onClick={() => handleFeedback("negative")}
              disabled={!!feedback}
              aria-label="Not helpful"
            >
              <ThumbsDown className={`h-4 w-4 ${feedback === "negative" ? "text-red-500" : ""}`} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
