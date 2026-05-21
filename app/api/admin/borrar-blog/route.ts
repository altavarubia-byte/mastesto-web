import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { id, imagen_path } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Falta id del blog' }, { status: 400 });
    }

    if (imagen_path) {
      await supabaseAdmin.storage.from('blog-images').remove([imagen_path]);
    }

    const { error } = await supabaseAdmin
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Error eliminando blog' },
      { status: 500 }
    );
  }
}
