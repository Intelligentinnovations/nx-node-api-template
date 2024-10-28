import {z} from "zod";

export const SignupSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
});

export type SignupPayload = z.infer<typeof SignupSchema>;


export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginPayload = z.infer<typeof LoginSchema>;

export const EmailSchema = z.object({
  email: z.string().email(),
});

export type EmailPayload = z.infer<typeof EmailSchema>;


export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type ResetPasswordPayload = z.infer<typeof ResetPasswordSchema>;


export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string(),
});

export type VerifyOtpPayload = z.infer<typeof VerifyOtpSchema>;
