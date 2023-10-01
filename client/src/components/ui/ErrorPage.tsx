import { XCircle } from "lucide-react";
import { Button } from "./button";

type ErrorProps = {
  error?: unknown;
};
export function ErrorPage({ error }: ErrorProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <XCircle className="h-8 w-8 text-destructive" />
      <p>{error instanceof Error ? error.message : String(error)}</p>
      <Button type="button" size="sm" onClick={() => location.reload()}>
        Reload
      </Button>
    </div>
  );
}
