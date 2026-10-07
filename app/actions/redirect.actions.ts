"use server";

import { redirect } from "next/navigation";

function getBaseURL() {
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
}

export async function redirectToSignIn() {
  try {
  } catch {
  } finally {
    const baseURL = getBaseURL();
    const url = new URL(`${baseURL}/auth/sign-in`);
    redirect(url.toString());
  }
}

export async function redirectToMainApp() {
  try {
  } catch {
  } finally {
    const baseURL = getBaseURL();
    const url = new URL(`${baseURL}`);
    redirect(url.toString());
  }
}
