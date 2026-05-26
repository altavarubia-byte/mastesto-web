import FekoLabClient from "@/components/feko-lab/FekoLabClient";

export const metadata = {
  title: "RF Lab | +TESTO",
  description: "Laboratorio RF/EM conectado al RF Engine.",
};

export default function RfLabPage() {
  return <FekoLabClient />;
}
