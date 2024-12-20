"use client";

import { Attachment } from "ai";
import { ReactNode } from "react";

import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";

export function Message({
  chatId,
  role,
  content,
  attachments,
  className,
}: {
  chatId: string;
  role: string;
  content: string;
  attachments?: Array<Attachment>;
  className?: string;
}) {
  const isAssistantStyle = (r: string) => r === 'assistant' || r === 'system' || r === 'function' || r === 'tool' || r === 'data';

  return (
    <div
      className={`flex flex-col w-full px-4 py-2 message-container ${isAssistantStyle(role) ? "assistant" : "user"} ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="font-punk text-punk-primary uppercase">
          {role === "user" ? "You" : "Punk Bot"}
        </div>
      </div>
      
      <div className="prose dark:prose-invert max-w-none markdown-body">
        <Markdown>{content}</Markdown>
      </div>

      {attachments?.map((attachment, i) => (
        <PreviewAttachment key={i} attachment={attachment} />
      ))}
    </div>
  );
};
