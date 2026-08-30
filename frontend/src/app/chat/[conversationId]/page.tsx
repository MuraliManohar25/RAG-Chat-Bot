"use client";

import { useParams } from "next/navigation";
import { ChatWorkspace } from "@/components/chat/ChatWorkspace";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;
  return <ChatWorkspace conversationId={conversationId} />;
}
