// app/api/login/route.ts

import { logout } from "@/actions/auth-actions"; // Import server action
import { cookies } from "next/headers";

export async function POST() {
  try {
    console.log("Signing out"); // Log the request for debugging
    const result = await logout(); // Call the server action

    if (result?.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // const cookieStore = await cookies();
    // cookieStore.set("userId", user.id, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 60 * 60 * 24 * 7,
    //   path: "/",
    // });

    // cookieStore.set("role", user.role, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: 60 * 60 * 24 * 7,
    //   path: "/",
    // });

    // const serializedCookie = `userId=${user.id}; role=${user.role}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    // const responseHeaders = new Headers({
    //   "Content-Type": "application/json",
    //   "Set-Cookie": serializedCookie,
    // });

    // console.log("User ID set in cookie:", user.id); // Log the user ID for debugging
    // // console.log(cookieStore.get("userId")); // Log the cookie for debugging

    return new Response(JSON.stringify({ success: true, redirectUrl: result?.redirectUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred here" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
