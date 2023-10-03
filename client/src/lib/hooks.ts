import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { z } from "zod";
import {
  chatPayloadSchema,
  chatPayloadType,
  messageSchema,
  userInfoSchema,
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

type UseMessagesParams = {
  userID: z.infer<typeof userSchema>["id"] | null;
};

export function useMessages({ userID }: UseMessagesParams) {
  return useQuery({
    queryKey: ["messages", userID],
    queryFn: async () => {
      const response = await API.get("/messages", {
        params: { "user-id": userID },
      });
      return messageSchema.array().parse(response.data.data);
    },
    enabled: !!userID,
    staleTime: Infinity,
    retry: false,
  });
}

export function useUserInfos() {
  return useQuery({
    queryKey: ["user-infos"],
    queryFn: async () => {
      const response = await API.get("/user-infos");
      return userInfoSchema.array().parse(response.data.data);
    },
    staleTime: Infinity,
    retry: false,
  });
}

export function useChat() {
  const connRef = useRef<WebSocket | null>(null);

  const profileQuery = useProfile();
  const queryClient = useQueryClient();

  async function sendMessage(content: string, userID: number) {
    if (!profileQuery.isSuccess) return;

    const msg = {
      content,
      sender_id: profileQuery.data.id,
      receiver_id: userID,
      created_at: new Date(),
      read_at: null,
    } satisfies z.input<typeof messageSchema>;
    connRef.current?.send(
      JSON.stringify({ type: chatPayloadType.Enum.NEW_MESSAGE, data: msg }),
    );
    await queryClient.invalidateQueries(["messages", userID]);
    await queryClient.invalidateQueries(["user-infos"]);
  }

  function openChatbox(userID: number) {
    connRef.current?.send(
      JSON.stringify({
        type: chatPayloadType.Enum.OPEN_CHATBOX,
        data: userID,
      }),
    );
    queryClient.invalidateQueries(["user-infos"]);
  }

  useEffect(() => {
    connRef.current = new WebSocket(import.meta.env.VITE_WS_URL + "/ws/chat");

    connRef.current.onopen = () => {
      console.log("connected to chat websocket server");
    };

    connRef.current.onmessage = async (event) => {
      const payload = chatPayloadSchema.parse(JSON.parse(event.data));
      if (payload.type !== chatPayloadType.Enum.NEW_MESSAGE) {
        return;
      }

      const msg = messageSchema.parse(payload.data);
      await queryClient.invalidateQueries(["messages", msg.senderID]);
      await queryClient.invalidateQueries(["user-infos"]);
    };

    return () => {
      connRef.current?.close();
      console.log("closing the chat websocket connection");
    };
  }, [queryClient]);

  return [sendMessage, openChatbox] as const;
}
