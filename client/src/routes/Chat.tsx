import { Button } from "@/components/ui/button";
import { useLogout, useProfile } from "@/lib/hooks";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Chat() {
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
    <div className="flex items-center justify-end gap-4 border-b p-4">
      <div>{profileQuery.data?.username}</div>
      <Button
        aria-label="Logout"
        variant="outline"
        size="icon"
        onClick={handleLogoutClick}
      >
        <LogOut />
      </Button>
    </div>
  );
}
