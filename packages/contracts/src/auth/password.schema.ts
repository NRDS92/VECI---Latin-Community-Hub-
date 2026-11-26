import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_UTF8_BYTES = 72;

export const PASSWORD_REQUIREMENTS = {
  minLength: PASSWORD_MIN_LENGTH,
  uppercase: /\p{Lu}/u,
  lowercase: /\p{Ll}/u,
  number: /\p{Nd}/u,
  special: /[\p{P}\p{S}]/u,
} as const;

export type PasswordRequirementStatus = {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  maxBytes: boolean;
};

export const getPasswordRequirementStatus = (
  password: string
): PasswordRequirementStatus => ({
  minLength: password.length >= PASSWORD_MIN_LENGTH,
  uppercase: PASSWORD_REQUIREMENTS.uppercase.test(password),
  lowercase: PASSWORD_REQUIREMENTS.lowercase.test(password),
  number: PASSWORD_REQUIREMENTS.number.test(password),
  special: PASSWORD_REQUIREMENTS.special.test(password),
  maxBytes: new TextEncoder().encode(password).length <= PASSWORD_MAX_UTF8_BYTES,
});

export const PasswordSchema = z.string().superRefine((password, context) => {
  const status = getPasswordRequirementStatus(password);
  const addIssue = (message: string) => context.addIssue({ code: "custom", message });

  if (!status.minLength) addIssue("Password must contain at least 8 characters.");
  if (!status.uppercase) addIssue("Password must contain an uppercase letter.");
  if (!status.lowercase) addIssue("Password must contain a lowercase letter.");
  if (!status.number) addIssue("Password must contain a number.");
  if (!status.special) addIssue("Password must contain a special character.");
  if (!status.maxBytes) addIssue("Password must not exceed 72 UTF-8 bytes.");
});

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: PasswordSchema,
});

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1),
  password: PasswordSchema,
});

export const RegisterPasswordSchema = PasswordSchema;

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type RegisterPassword = z.infer<typeof RegisterPasswordSchema>;
