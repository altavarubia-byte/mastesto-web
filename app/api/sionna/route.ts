import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export async function POST(req: Request) {
  try {
    const datos = await req.json();

    const base = path.join(process.cwd(), "sionna");
    const configDir = path.join(base, "config");
    const resultDir = path.join(process.cwd(), "public", "resultados");

    fs.mkdirSync(configDir, { recursive: true });
    fs.mkdirSync(resultDir, { recursive: true });

    const configPath = path.join(configDir, "piso.json");
    fs.writeFileSync(configPath, JSON.stringify(datos, null, 2), "utf-8");

    const scriptPath = path.join(base, "simular_piso.py");

    await new Promise<void>((resolve, reject) => {
      const proceso = spawn("python", [scriptPath], {
        cwd: base,
        shell: true,
      });

      proceso.stderr.on("data", (data) => {
        console.error(data.toString());
      });

      proceso.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error("Sionna falló"));
      });
    });

    return NextResponse.json({
      ok: true,
      mensaje: "Simulación completada",
      cobertura: "/resultados/cobertura.json",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        ok: false,
        error: "Error ejecutando simulación",
      },
      { status: 500 }
    );
  }
}
