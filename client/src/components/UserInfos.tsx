import { useUserInfos } from "@/lib/hooks";
import type { userInfoSchema } from "@/lib/types";
import { cn } from "@/lib/utils";
import { forwardRef, useRef } from "react";
import type { z } from "zod";
import { ErrorPage } from "./ui/ErrorPage";
import { LoadingPage } from "./ui/LoadingPage";

type UserInfosProps = {
  activeUserID: number | null;
  setActiveUserID: React.Dispatch<React.SetStateAction<number | null>>;
};

export function UserInfos({ activeUserID, setActiveUserID }: UserInfosProps) {
  const cardsMapRef = useRef<HTMLLIElement[]>([]);

  const userInfosQuery = useUserInfos();

  function handleCardKeyDown(key: string, index: number, userID: number) {
    let node: HTMLLIElement | undefined;

    switch (key) {
      case "ArrowUp": {
        if (index === 0) return;
        cardsMapRef.current.forEach((card) =>
          card.setAttribute("tabindex", "-1"),
        );
        node = cardsMapRef.current.at(index - 1);
        break;
      }
      case "ArrowDown": {
        if (index === cardsMapRef.current.length - 1) return;
        cardsMapRef.current.forEach((card) =>
          card.setAttribute("tabindex", "-1"),
        );
        node = cardsMapRef.current.at(index + 1);
        break;
      }
      case "Enter":
      case " ":
        setActiveUserID(userID);
        return;
      default:
        return;
    }
    node?.setAttribute("tabindex", "0");
    node?.focus();
  }

  function handleCardClick(userID: number) {
    setActiveUserID(userID);
  }

  if (userInfosQuery.isError) {
    return <ErrorPage error={userInfosQuery.error} />;
  }
  if (userInfosQuery.isLoading) {
    return <LoadingPage />;
  }
  return (
    <section>
      <ul>
        {userInfosQuery.data.map((u, i) => (
          <UserInfoCard
            key={u.id}
            tabIndex={i === 0 ? 0 : -1}
            ref={(node) => {
              if (node) {
                cardsMapRef.current.push(node);
              }
            }}
            onKeyDown={(e) => handleCardKeyDown(e.key, i, u.id)}
            onClick={() => handleCardClick(u.id)}
            className={cn(u.id === activeUserID && "bg-slate-200")}
            {...{
              username: u.username,
              content: u.content,
              createdAt: u.createdAt,
            }}
          />
        ))}
      </ul>
    </section>
  );
}

type UserInfoCardProps = Omit<
  React.ComponentPropsWithoutRef<"li">,
  "id" | "content"
> &
  Pick<z.infer<typeof userInfoSchema>, "username" | "content" | "createdAt">;

const UserInfoCard = forwardRef<HTMLLIElement, UserInfoCardProps>(
  ({ username, content, createdAt, className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("cursor-pointer p-2.5 hover:bg-accent", className)}
        {...props}
      >
        <div>
          <div className="font-semibold">{username}</div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p title={content ?? undefined} className="truncate">
            {content ?? "No message available"}
          </p>
          {!!createdAt && (
            <div className="shrink-0 text-sm">
              {createdAt.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </li>
    );
  },
);
UserInfoCard.displayName = "UserInfoCard";
