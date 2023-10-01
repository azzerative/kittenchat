import type { messageSchema } from "@/lib/types";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { z } from "zod";

type MessageCardProps = Omit<
  React.ComponentPropsWithoutRef<"li">,
  "content"
> & {
  self: boolean;
} & Pick<z.infer<typeof messageSchema>, "content" | "createdAt">;

export const MessageCard = forwardRef<HTMLLIElement, MessageCardProps>(
  ({ self, content, createdAt, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(
          "flex max-w-[80%] flex-col rounded p-2.5",
          self ? "self-end bg-slate-200" : "self-start bg-slate-300",
        )}
        {...props}
      >
        <p>{content}</p>
        <div className="self-end text-sm">
          {createdAt.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </li>
    );
  },
);
MessageCard.displayName = "MessageCard";
