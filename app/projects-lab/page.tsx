"use client";

import { useEffect, useState } from "react";
import { deleteProject, downloadJson, getProjects, loadProject, saveProject, type TelecomProject } from "@/lib/telecomFinal/core";
import { Button, Card, CodeBox, Shell, Stat } from "@/components/telecomFinal/ui";

export default function ProjectsLabPage() {
  const [projects, setProjects] = useState<TelecomProject[]>([]);
  const [name, setName] = useState("Proyecto Telecom");
  const [description, setDescription] = useState("Escenario guardado localmente");

  function reload() {
    setProjects(getProjects());
  }

  useEffect(() => {
    reload();
    const h = () => reload();
    window.addEventListener("mastesto-final-projects", h);
    return () => window.removeEventListener("mastesto-final-projects", h);
  }, []);

  return (
    <Shell title="Projects Lab" badge="Persistencia local · preparado para Supabase" description="Guarda, carga, elimina y exporta escenarios como proyectos. Esto está preparado para sustituir localStorage por Supabase más adelante.">
      <section className="grid gap-3 md:grid-cols-4">
        <Stat label="Proyectos" value={projects.length} />
        <Stat label="Persistencia" value="localStorage" />
        <Stat label="Supabase" value="preparado" />
        <Stat label="Export" value="JSON" />
      </section>

      <Card title="Nuevo guardado">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl border border-zinc-800 bg-black p-3 text-white" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-2xl border border-zinc-800 bg-black p-3 text-white" />
          <Button onClick={() => { saveProject(name, description); reload(); }} variant="orange">Guardar actual</Button>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id} title={p.name} subtitle={p.description}>
            <p className="mb-3 text-xs text-zinc-500">Actualizado: {p.updatedAt}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => loadProject(p.id)} variant="green">Cargar</Button>
              <Button onClick={() => downloadJson(`${p.name}.json`, p)}>Exportar</Button>
              <Button onClick={() => { deleteProject(p.id); reload(); }} variant="red">Eliminar</Button>
            </div>
            <div className="mt-4"><CodeBox data={Object.keys(p.scenario)} /></div>
          </Card>
        ))}
      </section>
    </Shell>
  );
}
