import { redirect } from "next/navigation";

export function redirectToSignIn(): never {
  redirect("/auth/sign-in");
}

export function redirectToMainApp(): never {
  redirect("/");
}
