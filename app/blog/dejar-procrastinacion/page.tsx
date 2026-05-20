import { Metadata } from "next";
import BlogCliente from "./BlogCliente";

export const metadata: Metadata = {
  title: "Cómo dejar de procrastinar | La trampa del mañana | +TESTO",

  description:
    "La ciencia detrás de la procrastinación: neurociencia, regulación emocional, productividad y el protocolo Mastesto para dejar de posponer.",

  keywords: [
    "procrastinación",
    "cómo dejar de procrastinar",
    "procrastinar",
    "productividad",
    "disciplina",
    "hábitos",
    "psicología",
    "Mastesto"
  ],

  openGraph: {
    title: "Cómo dejar de procrastinar | La trampa del mañana | +TESTO",

    description:
      "La ciencia detrás de la procrastinación y cómo dejar de posponer.",

    url: "https://mastesto.es/blog/la-trampa-del-manana",

    type: "article",

    images: [
      {
        url: "https://mastesto.es/images/procrastinacion.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function Page() {
  return <BlogCliente />;
}
