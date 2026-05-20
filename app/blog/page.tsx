import Link from "next/link";

const blogs = [
  {
    titulo: "Beneficios reales de ducharse con agua fría",
    ruta: "/blog/beneficios-ducha-fria",
    descripcion:"Más energía, disciplina y claridad mental"
  },

  {
    titulo:"Cómo dejar la procrastinación",
    ruta:"/blog/dejar-procrastinacion",
    descripcion:"Recupera foco y elimina distracciones"
  },

  {
    titulo:"Cómo aumentar testosterona naturalmente",
    ruta:"/blog/testosterona-natural",
    descripcion:"Hábitos que sí afectan"
  }
];

export default function BlogPage(){

return(

<div className="
min-h-screen
bg-black
text-white
p-8
">

<h1 className="
text-5xl
font-black
mb-10
italic
">

BLOG MASTESTO ⚔️

</h1>

<div className="
grid
md:grid-cols-3
gap-6
">

{blogs.map((post)=>(

<Link
key={post.ruta}
href={post.ruta}
>

<div className="
bg-zinc-950
border
border-zinc-800
rounded-[2rem]
p-6
hover:border-orange-600
transition
h-full
">

<h2 className="
font-black
mb-3
">

{post.titulo}

</h2>

<p className="text-zinc-400">

{post.descripcion}

</p>

</div>

</Link>

))}

</div>

</div>

)

}
