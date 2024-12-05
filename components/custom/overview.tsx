import { motion } from "framer-motion";
import Link from "next/link";

import { BotIcon, GPSIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <BotIcon />
          <span className="text-lg font-semibold">Meet Mojo</span>
          <GPSIcon size={20} />
        </p>
        <p>
          Meet Mojo, sixtyoneeighty&apos;s heart and soul. As our first (albeit virtual) employee, 
          Mojo brings a unique blend of wit, wisdom, and just the right amount of sarcasm to every conversation.
        </p>
        <p>
          Feel free to chat with Mojo about anything that&apos;s on your mind - from technical challenges 
          to random musings. With an impressive memory and a knack for engaging conversations, 
          Mojo&apos;s here to help, entertain, and occasionally throw in a clever quip or two.
        </p>
      </div>
    </motion.div>
  );
};
