import z from "zod";
import { LIMITS } from "@/lib/constants/limits";

export const emailSchema = z
  .email("Please enter a valid email")
  .min(1, "Email cannot be empty")
  .max(
    LIMITS.auth.emailMaxLength,
    `Email cannot exceed ${LIMITS.auth.emailMaxLength} characters`,
  );

export const passwordSchema = z
  .string()
  .min(
    LIMITS.auth.passwordMinLength,
    `Password must be at least ${LIMITS.auth.passwordMinLength} characters`,
  )
  .max(
    LIMITS.auth.passwordMaxLength,
    `Password cannot exceed ${LIMITS.auth.passwordMaxLength} characters`,
  )
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/\d/, "Password must include at least one number");

export const PASSWORD_REQUIREMENTS = `Password must be at least ${LIMITS.auth.passwordMinLength} characters, include at least one uppercase letter and one number`;

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean(),
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name cannot be empty")
      .max(
        LIMITS.auth.nameMaxLength,
        `Name cannot exceed ${LIMITS.auth.nameMaxLength} characters`,
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
