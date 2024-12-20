"use client";

import { Attachment } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";

export const Message = ({
  chatId,
  role,
  content,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  attachments?: Array<Attachment>;
}) => {
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[800px] md:px-0 first-of-type:pt-20 ${
        role === "assistant" ? "justify-start" : "justify-end flex-row-reverse"
      }`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className={`size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500 ${
        role === "assistant" ? "order-first" : "order-last"
      }`}>
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className={`flex flex-col gap-2 max-w-[90%] ${
        role === "assistant" 
          ? "bg-gray-100 dark:bg-zinc-800 rounded-r-lg rounded-bl-lg" 
          : "bg-blue-500 text-white rounded-l-lg rounded-br-lg"
      } p-3`}>
        {content && typeof content === "string" && (
          <div className={`flex flex-col gap-4 ${
            role === "user" ? "text-white" : "text-zinc-800 dark:text-zinc-300"
          }`}>
            <Markdown>{content}</Markdown>
          </div>
        )}

        {attachments && attachments.length > 0 && (
          <div className="flex flex-row gap-2 flex-wrap">
            {attachments.map((attachment, index) => (
              <PreviewAttachment key={index} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
