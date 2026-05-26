import FekoLabClient from "@/components/feko-lab/FekoLabClient";

export const metadata = {
  title: "FEKO Lab | +TESTO RF Engine",
  description: "Laboratorio RF/EM FEKO-like conectado al RF Engine v500.",
};

export default function FekoLabPage() {
  return <FekoLabClient />;
}
