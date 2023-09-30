import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/lib/hooks";
import type { LoginFormFieldValues } from "@/lib/types";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

export function Login() {
  const form = useForm<LoginFormFieldValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const loginMutation = useLogin();
  const navigate = useNavigate();

  function onSubmit({ username, password }: LoginFormFieldValues) {
    loginMutation.mutate(
      { username, password },
      {
        onError(err) {
          alert(err);
        },
        onSuccess() {
          navigate("/");
        },
      },
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="basis-[17rem] p-4"
        >
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="border-slate-500 bg-slate-100"
                      required
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="border-slate-500 bg-slate-100"
                      required
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Button type="submit">Login</Button>
            <Button asChild variant="link">
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
