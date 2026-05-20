import { Metadata } from "next";
import BlogCliente from "./BlogCliente";

export const metadata: Metadata = {
  title: "Beneficios reales de ducharse con agua fría | +TESTO",

  description:
    "Qué dice la ciencia sobre las duchas frías: estudios, beneficios reales, disciplina, energía y experiencias.",

  openGraph: {
    title: "Beneficios reales de ducharse con agua fría | +TESTO",
    description:
      "Ciencia, experiencias y beneficios reales de ducharse con agua fría.",
    url: "https://mastesto.es/blog/beneficios-ducha-fria",
    type: "article",
  },
};

export default function Page() {
  return <BlogCliente />;
}
