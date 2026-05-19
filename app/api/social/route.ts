import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const discordRes = await fetch(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}?with_counts=true`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
        cache: 'no-store',
      }
    );

    const discord = await discordRes.json();

    const tiktokRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=username,follower_count,likes_count,video_count',
      {
        headers: {
          Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
        },
        cache: 'no-store',
      }
    );

    const tiktok = await tiktokRes.json();

    return NextResponse.json({
      discord: {
        usuarios: discord.approximate_member_count || 0,
        activos: discord.approximate_presence_count || 0,
      },
      tiktok: {
        seguidores: tiktok?.data?.user?.follower_count || 0,
        likes: tiktok?.data?.user?.likes_count || 0,
      },
    });
  } catch {
    return NextResponse.json({
      discord: { usuarios: 0, activos: 0 },
      tiktok: { seguidores: 0, likes: 0 },
    });
  }
}
