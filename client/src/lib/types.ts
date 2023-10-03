import { z } from "zod";

export type RegisterFormFieldValues = {
  username: string;
  password: string;
  confirmPassword: string;
};

export type LoginFormFieldValues = Omit<
  RegisterFormFieldValues,
  "confirmPassword"
>;

export const userSchema = z
  .object({
    id: z.number().int().positive(),
    username: z.string().min(1),
    created_at: z.coerce.date(),
  })
  .transform((u) => ({
    id: u.id,
    username: u.username,
    createdAt: u.created_at,
  }));

export const messageSchema = z
  .object({
    sender_id: z.number().int().positive(),
    receiver_id: z.number().int().positive(),
    content: z.string().min(1),
    created_at: z.coerce.date(),
    read_at: z.coerce.date().nullable(),
  })
  .transform((m) => ({
    senderID: m.sender_id,
    receiverID: m.receiver_id,
    content: m.content,
    createdAt: m.created_at,
    readAt: m.read_at,
  }));

export type MessageContentFormFieldValues = Pick<
  z.infer<typeof messageSchema>,
  "content"
>;

export const userInfoSchema = z
  .object({
    id: z.number().int().positive(),
    username: z.string().min(1),
    content: z.string().nullable(),
    created_at: z.coerce.date().nullable(),
    unread_count: z.number().int().positive().nullable(),
  })
  .transform((u) => ({
    id: u.id,
    username: u.username,
    content: u.content,
    createdAt: u.created_at,
    unreadCount: u.unread_count,
  }));

export const chatPayloadType = z.enum(["NEW_MESSAGE", "OPEN_CHATBOX"]);

export const chatPayloadSchema = z.object({
  type: chatPayloadType,
  data: z.unknown(),
});
