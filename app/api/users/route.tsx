import { validateToken, WhopAPI, hasAccess } from "@whop-apps/sdk";
import { headers } from "next/headers";

export const dynamic = "force-dynamic"; // defaults to force-static
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  const { userId } = await validateToken({ headers });

  if (!process.env.DATABASE_URL) {
    return new Response(JSON.stringify({}), {
      status: 200,
    });
  }

  const sql = neon(process.env.DATABASE_URL);
  console.log(`SELECT * FROM users where user_id = '${userId}'`);

  const users = await sql(`SELECT highscore FROM users where user_id = $1`, [userId]);

    console.log("nuts")

    console.log(users)

  let user = users.at(0);

  console.log(user);
  return new Response(JSON.stringify({ user: user }), {
    status: 200,
  });
}
