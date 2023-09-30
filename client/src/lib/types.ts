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
