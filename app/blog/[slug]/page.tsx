import { createClient } from "@supabase/supabase-js";
import BlogCliente from "./BlogCliente";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!blog) {
    return (
      <main className="min-h-screen bg-black text-white p-10">
        <h1 className="text-3xl font-black">No encuentra el blog</h1>
        <pre>{slug}</pre>
      </main>
    );
  }

  return <BlogCliente blog={blog} />;
}
