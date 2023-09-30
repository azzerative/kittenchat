import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/lib/hooks";
import type { RegisterFormFieldValues } from "@/lib/types";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

export function Register() {
  const form = useForm<RegisterFormFieldValues>({
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  const registerMutation = useRegister();
  const navigate = useNavigate();

  function onSubmit({ username, password }: RegisterFormFieldValues) {
    registerMutation.mutate(
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
              rules={{ required: "Username must not be empty" }}
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              rules={{ required: "Password must not be empty" }}
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              rules={{
                required: "Confirm password must not be empty",
                validate: (value, { password }) =>
                  value === password || "Password does not match",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="border-slate-500 bg-slate-100"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Button type="submit">Register</Button>
            <Button asChild variant="link">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
