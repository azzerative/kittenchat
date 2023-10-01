import { ChatBox } from "@/components/ChatBox";
import { Button } from "@/components/ui/button";
import { UserInfos } from "@/components/UserInfos";
import { useLogout, useProfile } from "@/lib/hooks";
import type { userSchema } from "@/lib/types";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { z } from "zod";

export function Chat() {
  const [activeUserID, setActiveUserID] = useState<
    z.infer<typeof userSchema>["id"] | null
  >(null);

  const profileQuery = useProfile();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  function handleLogoutClick() {
    logoutMutation.mutate(undefined, {
      onError(err) {
        alert(err);
      },
      onSuccess() {
        navigate("/login");
      },
    });
  }

  return (
    <div className="flex h-screen flex-col">
      <nav className="flex items-center justify-end gap-4 border-b p-4">
        <div>{profileQuery.data?.username}</div>
        <Button
          type="button"
          aria-label="Logout"
          variant="ghost"
          size="icon"
          onClick={handleLogoutClick}
        >
          <LogOut />
        </Button>
      </nav>
      <main className="grid grow grid-cols-[minmax(18rem,_1fr),_minmax(0,_2fr)] overflow-hidden">
        <UserInfos {...{ activeUserID, setActiveUserID }} />
        <ChatBox {...{ activeUserID }} />
      </main>
    </div>
  );
}
