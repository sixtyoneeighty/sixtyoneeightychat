import { motion } from "framer-motion";
import Link from "next/link";

import { FileIcon, RouteIcon } from "./icons";

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
          <FileIcon size={20} />
          <span className="text-xl punk-title">Punk Rock Chatbot</span>
          <RouteIcon size={20} />
        </p>
        <p>
          Meet Punk Rock Chatbot, your resident punk rock aficionado straight from the golden era of 90s punk. 
          Deeply rooted in the Fat Wreck Chords and Epitaph scene, PunkBot brings raw authenticity 
          and passionate musical insight to every conversation.
        </p>
        <p>
          Whether you want to dive deep into chord progressions, debate the impact of commercialism 
          on the scene, or discover some overlooked gems from the 90s, PunkBot&apos;s got your back. 
          Just don&apos;t expect any sugar-coating – this bot keeps it real with a healthy dose of 
          punk rock skepticism.
        </p>
      </div>
    </motion.div>
  );
};
