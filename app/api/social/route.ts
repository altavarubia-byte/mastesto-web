import { NextResponse } from 'next/server';

export async function GET() {
  try {

    // ---------- DISCORD ----------

    const discordRes = await fetch(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}?with_counts=true`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
        cache: "no-store"
      }
    );

    const discord = await discordRes.json();


    // ---------- TIKTOK ----------

    const tokenResponse = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method:"POST",

        headers:{
          "Content-Type":"application/x-www-form-urlencoded"
        },

        body:new URLSearchParams({

          client_key:
          process.env.TIKTOK_CLIENT_KEY!,

          client_secret:
          process.env.TIKTOK_CLIENT_SECRET!,

          grant_type:"client_credentials"

        })

      }
    );

    const tokenData =
    await tokenResponse.json();


    let seguidores=0;
    let likes=0;


    if(tokenData.access_token){

      const tiktokRes=await fetch(

      "https://open.tiktokapis.com/v2/user/info/?fields=follower_count,likes_count",

      {

      headers:{
      Authorization:
      `Bearer ${tokenData.access_token}`
      }

      }

      );

      const tiktok=
      await tiktokRes.json();

      seguidores=
      tiktok?.data?.user?.follower_count||0;

      likes=
      tiktok?.data?.user?.likes_count||0;

    }


    return NextResponse.json({

      discord:{

        usuarios:
        discord.approximate_member_count||0,

        activos:
        discord.approximate_presence_count||0

      },

      tiktok:{

        seguidores,

        likes

      }

    });

  } catch(error){

    console.log(error);

    return NextResponse.json({

      discord:{
        usuarios:0,
        activos:0
      },

      tiktok:{
        seguidores:0,
        likes:0
      }

    });

  }
}
