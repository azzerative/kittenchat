import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  userSchema,
  type LoginFormFieldValues,
  type RegisterFormFieldValues,
} from "./types";
import { API } from "./utils";

export function useRegister() {
  return useMutation({
    mutationFn: (params: Omit<RegisterFormFieldValues, "confirmPassword">) =>
      API.post("/register", params),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (params: LoginFormFieldValues) => API.post("/login", params),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await API.get("/profile");
      return userSchema.parse(response.data.data);
    },
    staleTime: Infinity,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => API.post("/logout"),
    onSuccess() {
      queryClient.invalidateQueries(["profile"]);
    },
  });
}
