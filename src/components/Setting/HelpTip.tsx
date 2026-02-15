"use client";

import { useState, type ReactNode } from "react";
import { CircleHelp } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTipProps {
  children: ReactNode;
  tip: string;
}

export default function HelpTip({ children, tip }: HelpTipProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = (): void => {
    setOpen(true);
    setTimeout(() => {
      setOpen(false);
    }, 2000);
  };

  return (
    <div className="flex items-center">
      <span className="flex-1">{children}</span>
      <TooltipProvider delayDuration={100}>
        <Tooltip open={open} onOpenChange={(opened) => setOpen(opened)}>
          <TooltipTrigger asChild>
            <CircleHelp
              className="cursor-help w-4 h-4 ml-1 opacity-50 max-sm:ml-0"
              onClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                handleOpen();
              }}
            />
          </TooltipTrigger>
          <TooltipContent className="max-w-52">
            <p>{tip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
