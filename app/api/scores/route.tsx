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
    SELECT username, highscore FROM users
    order by highscore desc
    limit 10
  `;


  return new Response(JSON.stringify(users), {
    status: 200,
  });
}

export async function POST(request: Request) {
    let body = await request.json();
    console.log(body);
    const { userId } = await validateToken({ headers });

    if (process.env.DATABASE_URL) {
      const sql = neon(process.env.DATABASE_URL);

      // Upsert a score for this user and return the username
      const command = `
        INSERT INTO users (user_id, highscore, last_played)
        VALUES ('${userId}', ${body.score}, '${new Date().toISOString()}')
        ON CONFLICT (user_id)
        DO UPDATE SET
            highscore = GREATEST(users.highscore, EXCLUDED.highscore),
            last_played = EXCLUDED.last_played
        RETURNING username;
      `;
      console.log(command);

      const upsertResponse = await sql(command);
      let username = upsertResponse?.rows?.[0]?.username;

      // If username is not set, make API call and update it
      if (!username) {
        const user = await WhopAPI.me({ headers }).GET("/me", {});
        if (user.isErr) {
            return console.error("couldn't fetch username")
        }


        // Update the username in the users table
        const updateUsernameQuery = `
          UPDATE users
          SET username = '${user.data.username}'
          WHERE user_id = '${userId}'
        `;
        console.log(updateUsernameQuery)
        await sql(updateUsernameQuery);
      }
    }

    return new Response(JSON.stringify({ message: "success" }), {
      status: 200,
    });
  }
