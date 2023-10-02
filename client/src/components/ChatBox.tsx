import { useChat, useMessages, useProfile } from "@/lib/hooks";
import type { MessageContentFormFieldValues, userSchema } from "@/lib/types";
import { Send } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { MessageCard } from "./MessageCard";
import { Button } from "./ui/button";
import { ErrorPage } from "./ui/ErrorPage";
import { Input } from "./ui/input";
import { LoadingPage } from "./ui/LoadingPage";

type ChatBoxProps = {
  activeUserID: z.infer<typeof userSchema>["id"] | null;
};

export function ChatBox({ activeUserID }: ChatBoxProps) {
  const profileQuery = useProfile();
  const messageListRef = useRef<HTMLUListElement | null>(null);

  const messagesQuery = useMessages({ userID: activeUserID });
  const form = useForm<MessageContentFormFieldValues>({
    defaultValues: { content: "" },
  });
  const [sendMessage] = useChat();

  async function onSubmit(values: MessageContentFormFieldValues) {
    if (!activeUserID) return;
    await sendMessage(values.content, activeUserID);
    form.reset();

    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
  }

  return (
    <section className="flex flex-col overflow-hidden border-l">
      {!!activeUserID && (
        <>
          <ul
            ref={messageListRef}
            className="relative flex grow flex-col gap-4 overflow-auto p-2.5"
          >
            {messagesQuery.isError ? (
              <ErrorPage error={messagesQuery.error} />
            ) : messagesQuery.isLoading ? (
              <LoadingPage />
            ) : messagesQuery.data.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p>Start sending message</p>
              </div>
            ) : (
              messagesQuery.data.map((m) => (
                <MessageCard
                  key={m.createdAt.toISOString()}
                  self={m.senderID === profileQuery.data?.id}
                  {...{ content: m.content, createdAt: m.createdAt }}
                />
              ))
            )}
          </ul>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-auto flex border border-input py-2 pl-0.5 pr-3"
          >
            <Input
              type="text"
              placeholder="Type a message"
              autoComplete="off"
              className="grow rounded-none border-0 focus-visible:ring-0"
              required
              {...form.register("content")}
            />
            <Button
              type="submit"
              aria-label="Send message"
              variant="ghost"
              size="icon"
            >
              <Send />
            </Button>
          </form>
        </>
      )}
    </section>
  );
}
