"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(prevState, formData) {
  try {
    const data = Object.fromEntries(formData);
    await signIn("credentials", { ...data, redirect: false });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}
