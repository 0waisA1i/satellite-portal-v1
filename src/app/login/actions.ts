"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase";

export async function loginAction(
  formData: FormData,
): Promise<{ error: string } | void> {
  const email = ((formData.get("email") as string | null) ?? "").trim();
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = getServerSupabase();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return {
      error: authError?.message ?? "Login failed. Check your credentials.",
    };
  }

  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
  // email is stored so the middleware can gate /admin without an async DB lookup.
  cookieStore.set("satellite_user_id", authData.user.id, cookieOpts);
  cookieStore.set("satellite_user_email", authData.user.email ?? "", cookieOpts);

  // Admin bypasses the client lookup entirely and lands on /admin.
  if (authData.user.email === "admin@satellite.com") {
    redirect("/admin");
  }

  // Look up which client this user belongs to.
  // user_clients schema: { user_id uuid FK auth.users, client_id text FK icp_configs.client_id }
  const { data: uc, error: ucError } = await supabase
    .from("user_clients")
    .select("client_id")
    .eq("user_id", authData.user.id)
    .single();

  if (ucError || !uc) {
    return {
      error: "No client assigned to this account. Contact your administrator.",
    };
  }

  cookieStore.set("satellite_client_id", uc.client_id, cookieOpts);

  redirect("/");
}
