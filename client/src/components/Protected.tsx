import { useProfile } from "@/lib/hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingPage } from "./ui/LoadingPage";

type ProtectedProps = {
  children: React.ReactNode;
};
export function Protected({ children }: ProtectedProps) {
  const profileQuery = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (profileQuery.isError) {
      navigate("/login");
    }
  }, [profileQuery.isError, navigate]);

  if (profileQuery.isError) {
    return null;
  }
  if (profileQuery.isLoading) {
    return <LoadingPage />;
  }
  return children;
}
