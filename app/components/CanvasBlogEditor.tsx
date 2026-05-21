'use client';

import { Rnd } from 'react-rnd';
import { useState } from 'react';

type CanvasItem = {
  id: string;
  type: 'text' | 'image';
  text?: string;
  url?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export default function CanvasBlogEditor({
  items,
  setItems,
  onUploadImage,
}: {
  items: CanvasItem[];
  setItems: (items: CanvasItem[]) => void;
  onUploadImage: (file: File) => Promise<string>;
}) {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);

  const itemActual = items.find((i) => i.id === seleccionado);

  const addText = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        type: 'text',
        text: 'Escribe aquí...',
        x: 80,
        y: 80,
        width: 500,
        height: 120,
        fontSize: 28,
        color: '#ffffff',
        fontFamily: 'Arial',
        bold: false,
        italic: false,
        underline: false,
      },
    ]);
  };

  const addImage = async (file: File) => {
    const url = await onUploadImage(file);

    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        type: 'image',
        url,
        x: 80,
        y: 240,
        width: 380,
        height: 260,
      },
    ]);
  };

  const updateItem = (id: string, cambios: Partial<CanvasItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...cambios } : item)));
  };

  const deleteItem = () => {
    if (!seleccionado) return;
    setItems(items.filter((item) => item.id !== seleccionado));
    setSeleccionado(null);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden">
      <div className="p-4 border-b border-zinc-900 flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={addText}
          className="px-4 py-3 rounded-xl bg-white text-black text-[10px] font-black uppercase"
        >
          Añadir texto
        </button>

        <label className="px-4 py-3 rounded-xl bg-orange-600 text-black text-[10px] font-black uppercase cursor-pointer">
          Añadir imagen
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              await addImage(file);
              e.target.value = '';
            }}
          />
        </label>

        {itemActual?.type === 'text' && (
          <>
            <select
              value={itemActual.fontFamily || 'Arial'}
              onChange={(e) => updateItem(itemActual.id, { fontFamily: e.target.value })}
              className="px-3 py-3 bg-black border border-zinc-800 rounded-xl text-xs"
            >
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Impact">Impact</option>
              <option value="Times New Roman">Times</option>
              <option value="Courier New">Courier</option>
              <option value="system-ui">System</option>
            </select>

            <select
              value={itemActual.fontSize || 28}
              onChange={(e) => updateItem(itemActual.id, { fontSize: Number(e.target.value) })}
              className="px-3 py-3 bg-black border border-zinc-800 rounded-xl text-xs"
            >
              {[14, 18, 24, 28, 32, 40, 48, 64, 80].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input
              type="color"
              value={itemActual.color || '#ffffff'}
              onChange={(e) => updateItem(itemActual.id, { color: e.target.value })}
              className="w-12 h-10 bg-black rounded-xl"
            />

            <button type="button" onClick={() => updateItem(itemActual.id, { bold: !itemActual.bold })} className="px-4 py-3 bg-black rounded-xl font-black">B</button>
            <button type="button" onClick={() => updateItem(itemActual.id, { italic: !itemActual.italic })} className="px-4 py-3 bg-black rounded-xl italic">I</button>
            <button type="button" onClick={() => updateItem(itemActual.id, { underline: !itemActual.underline })} className="px-4 py-3 bg-black rounded-xl underline">U</button>
          </>
        )}

        {seleccionado && (
          <button
            type="button"
            onClick={deleteItem}
            className="ml-auto px-4 py-3 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase"
          >
            Eliminar
          </button>
        )}
      </div>

      <div className="relative h-[1200px] w-full bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:40px_40px]" />

        {items.map((item) => (
          <Rnd
            key={item.id}
            size={{ width: item.width, height: item.height }}
            position={{ x: item.x, y: item.y }}
            bounds="parent"
            enableResizing
            dragGrid={[1, 1]}
            onMouseDown={() => setSeleccionado(item.id)}
            onDragStop={(_, d) => updateItem(item.id, { x: d.x, y: d.y })}
            onResizeStop={(_, __, ref, ___, position) => {
              updateItem(item.id, {
                width: parseInt(ref.style.width, 10),
                height: parseInt(ref.style.height, 10),
                x: position.x,
                y: position.y,
              });
            }}
            className={seleccionado === item.id ? 'ring-2 ring-orange-500 rounded-2xl' : ''}
          >
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover rounded-2xl select-none cursor-move"
                draggable={false}
              />
            ) : (
              <textarea
                value={item.text}
                onChange={(e) => updateItem(item.id, { text: e.target.value })}
                className="w-full h-full bg-transparent resize-none outline-none p-3 cursor-text"
                style={{
                  fontSize: item.fontSize,
                  color: item.color,
                  fontFamily: item.fontFamily,
                  fontWeight: item.bold ? 900 : 400,
                  fontStyle: item.italic ? 'italic' : 'normal',
                  textDecoration: item.underline ? 'underline' : 'none',
                  lineHeight: 1.2,
                }}
              />
            )}
          </Rnd>
        ))}
      </div>
    </div>
  );
}
