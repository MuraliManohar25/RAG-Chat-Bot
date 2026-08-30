"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { NeuButton } from "@/components/ui/NeuButton";

interface ChatComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function NeuChatComposer({
  onSend,
  disabled,
  placeholder = "Ask anything about your college...",
}: ChatComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-[32px] neu-inset-deep p-3 flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          e.target.style.height = "auto";
          e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="Chat message"
        className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-[#3D4852] placeholder:text-[#A0AEC0] focus:outline-none min-h-[44px] max-h-[120px]"
      />
      <NeuButton
        variant="primary"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="!p-3 !min-w-[44px] shrink-0"
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </NeuButton>
    </div>
  );
}
