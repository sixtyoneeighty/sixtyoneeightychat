"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id,
      body: { id },
      initialMessages,
      maxSteps: 10,
      onFinish: () => {
        window.history.replaceState({}, "", `/chat/${id}`);
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex flex-row justify-center pb-4 md:pb-8 h-dvh bg-background chat-container">
      <div className="flex flex-col justify-between items-center gap-4 w-full max-w-4xl px-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-4 h-full w-full items-center overflow-y-scroll message-list"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              role={message.role}
              content={message.content}
              attachments={message.experimental_attachments}
              className="message-container w-full"
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        <MultimodalInput
          input={input}
          setInput={setInput}
          attachments={attachments}
          setAttachments={setAttachments}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          className="w-full chat-input-container"
        />
      </div>
    </div>
  );
}
