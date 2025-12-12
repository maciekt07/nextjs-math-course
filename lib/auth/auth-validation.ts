import z from "zod";
import { AUTH_LIMITS } from "@/lib/constants/limits";

export const emailSchema = z
  .email("Please enter a valid email")
  .min(1, "Email cannot be empty")
  .max(
    AUTH_LIMITS.email,
    `Email cannot exceed ${AUTH_LIMITS.email} characters`,
  );

export const passwordSchema = z
  .string()
  .min(
    AUTH_LIMITS.passwordMin,
    `Password must be at least ${AUTH_LIMITS.passwordMin} characters`,
  )
  .max(
    AUTH_LIMITS.passwordMax,
    `Password cannot exceed ${AUTH_LIMITS.passwordMax} characters`,
  )
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/\d/, "Password must include at least one number");

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name cannot be empty")
      .max(
        AUTH_LIMITS.name,
        `Name cannot exceed ${AUTH_LIMITS.name} characters`,
      ),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
