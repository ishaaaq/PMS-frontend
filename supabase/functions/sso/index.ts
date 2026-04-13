import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import jwt from "https://esm.sh/jsonwebtoken@9";

serve(async (req: any) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Missing token", { status: 400 });
    }

    // 🔐 Verify ProTrack JWT
    let payload: any;
    try {
      payload = jwt.verify(token, Deno.env.get("SSO_SECRET")!);
    } catch {
      return new Response("Invalid or expired token", { status: 401 });
    }

    if (payload.iss !== "protrack" || payload.aud !== "pms") {
      return new Response("Invalid token", { status: 401 });
    }

    const protrackUserId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const phone = payload.phone;

    if (!protrackUserId || !email || !name) {
      return new Response("Invalid payload", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let userId: string;

    // 1. Check mapping
    const { data: mapping } = await supabase
      .from("protrack_users_map")
      .select("*")
      .eq("protrack_user_id", protrackUserId)
      .maybeSingle();

    if (mapping) {
      userId = mapping.supabase_user_id;
    } else {
      // 2. Check if user exists by email
      const { data: users } = await supabase.auth.admin.listUsers();

      const existing = users.users.find(u => u.email === email);

      if (existing) {
        userId = existing.id;
      } else {
        // 3. Create new auth user
        const { data: newUser, error } =
          await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
          });

        if (error) {
          return new Response("User creation failed", { status: 500 });
        }

        userId = newUser.user.id;
      }

      // 4. Save mapping
      await supabase.from("protrack_users_map").insert({
        protrack_user_id: protrackUserId,
        supabase_user_id: userId,
      });
    }

    // 5. Ensure profile exists + role = admin
    const profileData: Record<string, any> = {
      user_id: userId,
      role: "ADMIN",
      full_name: name,
    };

    if (phone) {
      profileData.phone = phone;
    }

    const { error: profileError } = await supabase.from("profiles").upsert(profileData);

    if (profileError) {
      console.error("PROFILE UPSERT ERROR:", profileError);
      return new Response("Profile creation failed", { status: 500 });
    }

    // 6. Generate magic link
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: "https://pms-frontend-git-dev-deint.vercel.app/dashboard/admin",
        },
      });

    if (linkError) {
      return new Response("Failed to generate login link", { status: 500 });
    }

    const redirectUrl = linkData.properties.action_link;

    // 7. Redirect → login happens here
    return Response.redirect(redirectUrl, 302);

  } catch {
    return new Response("Server error", { status: 500 });
  }
});