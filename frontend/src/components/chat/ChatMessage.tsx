"use client";

import { useState } from "react";
import { Bot, ThumbsDown, ThumbsUp } from "lucide-react";
import { NeuCard } from "@/components/ui/NeuCard";
import { NeuIconWell } from "@/components/ui/NeuIconWell";
import { NeuButton } from "@/components/ui/NeuButton";
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
        <NeuCard className="max-w-[80%] p-4 neu-small">
          <p className="text-sm text-[#3D4852]">{message.content}</p>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <NeuIconWell deep size="sm" className="shrink-0 mt-1">
        <Bot className="h-4 w-4 text-[#6C63FF]" aria-hidden="true" />
      </NeuIconWell>
      <div className="flex-1 min-w-0">
        <NeuCard className={`p-5 ${isUnknown ? "neu-inset" : "neu-small"}`}>
          <p className="text-sm text-[#3D4852] whitespace-pre-wrap leading-relaxed">{message.content}</p>
          {message.sources && message.sources.length > 0 && (
            <SourceList sources={message.sources} />
          )}
        </NeuCard>
        {!isUnknown && message.id && !message.id.startsWith("temp-") && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-[#6B7280]">Was this helpful?</span>
            <NeuButton
              variant="icon"
              className="!p-2 !min-w-0 !min-h-0 h-9 w-9"
              onClick={() => handleFeedback("positive")}
              disabled={!!feedback}
              aria-label="Helpful"
            >
              <ThumbsUp className={`h-4 w-4 ${feedback === "positive" ? "text-[#38B2AC]" : ""}`} />
            </NeuButton>
            <NeuButton
              variant="icon"
              className="!p-2 !min-w-0 !min-h-0 h-9 w-9"
              onClick={() => handleFeedback("negative")}
              disabled={!!feedback}
              aria-label="Not helpful"
            >
              <ThumbsDown className={`h-4 w-4 ${feedback === "negative" ? "text-red-500" : ""}`} />
            </NeuButton>
          </div>
        )}
      </div>
    </div>
  );
}
