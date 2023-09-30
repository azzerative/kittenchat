import { useProfile } from "@/lib/hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "./ui/loading";

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
    return <Loading />;
  }
  return children;
}
