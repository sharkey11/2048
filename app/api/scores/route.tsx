import { validateToken, WhopAPI, hasAccess } from "@whop-apps/sdk";
import { headers } from "next/headers";

export const dynamic = "force-dynamic"; // defaults to force-static
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  const { userId } = await validateToken({ headers });

  if (!process.env.DATABASE_URL) {
    return new Response(JSON.stringify([]), {
      status: 200,
    });
  }

  const sql = neon(process.env.DATABASE_URL);

  const users = await sql`
    SELECT user_id, highscore FROM users
    order by highscore desc
    limit 20
  `;

  const usersWithUsernames = await Promise.all(
    users.map(async (user) => {
      let response = await WhopAPI.app().GET("/app/users/{id}", {
        params: { path: { id: user.user_id } },
        next: { revalidate: 10 * 60 },
      });
      return { ...user, username: response.data?.username };
    })
  );

  return new Response(JSON.stringify(usersWithUsernames), {
    status: 200,
  });
}

export async function POST(request: Request) {
  let body = await request.json();
  const { userId } = await validateToken({ headers });

  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);

    const command = `
        INSERT INTO users (user_id, highscore, last_played)
        VALUES ('${userId}', ${body.score}, '${new Date().toISOString()}')
        ON CONFLICT (user_id)
        DO UPDATE SET
            highscore = GREATEST(users.highscore, EXCLUDED.highscore),
            last_played = EXCLUDED.last_played;
      `;

    await sql(command);
  }

  return new Response(JSON.stringify({ message: "success" }), {
    status: 200,
  });
}
