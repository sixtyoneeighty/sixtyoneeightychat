"use client";

import { Attachment, ChatRequestOptions, CreateMessage, Message } from "ai";
import { motion } from "framer-motion";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from "react";
import { toast } from "sonner";

import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import useWindowSize from "./use-window-size";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  append,
  handleSubmit,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  append: (
    message: CreateMessage,
    chatRequestOptions?: ChatRequestOptions | undefined,
  ) => Promise<string | null | undefined>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const [rows, setRows] = useState(1);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const form = e.currentTarget.form;
        if (form) {
          form.requestSubmit();
        }
      }
    },
    [],
  );

  const handleFileChange = useCallback(
    async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files) return;

      const files = Array.from(target.files);
      const newAttachments: Array<Attachment> = [];

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (typeof e.target?.result === "string") {
              newAttachments.push({
                name: file.name,
                url: e.target.result,
              });
              if (newAttachments.length === files.length) {
                setAttachments((prev) => [...prev, ...newAttachments]);
              }
            }
          };
          reader.readAsDataURL(file);
        } else {
          toast.error("Only image files are supported");
        }
      }
    },
    [setAttachments],
  );

  useEffect(() => {
    if (textAreaRef.current) {
      const lineHeight = 24;
      const padding = 16;
      const minHeight = lineHeight + padding; // Single line height
      const maxHeight = 200;

      // Reset height to auto to get the correct scrollHeight
      textAreaRef.current.style.height = 'auto';

      // Calculate new height
      const scrollHeight = textAreaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      // Set the new height
      textAreaRef.current.style.height = `${newHeight}px`;

      // Calculate rows for the textarea
      const newRows = Math.min(
        Math.max(
          Math.ceil((scrollHeight - padding) / lineHeight),
          1
        ),
        Math.floor(maxHeight / lineHeight)
      );
      setRows(newRows);
    }
  }, [input]);

  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4 md:px-0"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
    >
      <form onSubmit={handleSubmit}>
        <div className="mx-auto w-full md:w-[800px] flex flex-col gap-4">
          {attachments.length > 0 && (
            <div className="flex flex-row gap-2 flex-wrap">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative group">
                  <PreviewAttachment attachment={attachment} />
                  <button
                    type="button"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setAttachments((prev) =>
                        prev.filter((_, i) => i !== index),
                      );
                    }}
                  >
                    <div className="bg-white dark:bg-zinc-900 rounded-full p-1">
                      <StopIcon size={12} />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-row items-end gap-2">
            <div className="flex-1">
              <Textarea
                ref={textAreaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                rows={rows}
                className="resize-none min-h-[40px] transition-all duration-200 ease-in-out"
              />
            </div>

            <div className="flex flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.multiple = true;
                  input.accept = "image/*";
                  input.onchange = handleFileChange;
                  input.click();
                }}
              >
                <PaperclipIcon size={16} />
              </Button>

              {isLoading ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={stop}
                >
                  <StopIcon size={16} />
                </Button>
              ) : (
                <Button type="submit" size="icon" className="shrink-0">
                  <ArrowUpIcon size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
