import { describe, expect, it } from "vitest";
import {
  ChangePasswordRequestSchema,
  getPasswordRequirementStatus,
  PasswordSchema,
  ResetPasswordRequestSchema,
} from "./password.schema.js";

describe("shared password policy", () => {
  it("accepts a password satisfying every requirement", () => {
    expect(PasswordSchema.safeParse("Correct!7").success).toBe(true);
  });

  it.each([
    "lowercase!7", "UPPERCASE!7", "NoNumber!", "NoSpecial7", "Ab1!",
  ])("rejects password %s when a rule is missing", (password) => {
    expect(PasswordSchema.safeParse(password).success).toBe(false);
  });

  it("measures UTF-8 bytes without normalizing or truncating", () => {
    const exactLimit = `Aa1!${"é".repeat(34)}`; // 72 UTF-8 bytes
    expect(getPasswordRequirementStatus(exactLimit).maxBytes).toBe(true);
    expect(getPasswordRequirementStatus(`${exactLimit}é`).maxBytes).toBe(false);
  });

  it("validates register, reset, and change payloads with the same policy", () => {
    expect(ResetPasswordRequestSchema.safeParse({ token: "t", password: "Correct!7" }).success).toBe(true);
    expect(ChangePasswordRequestSchema.safeParse({ currentPassword: "legacy", newPassword: "Correct!7" }).success).toBe(true);
    expect(ChangePasswordRequestSchema.safeParse({ currentPassword: "x", newPassword: "weak" }).success).toBe(false);
  });
});
