'use client';

import { Rnd } from 'react-rnd';
import { useState } from 'react';

type CanvasItem = {
  id: string;
  type: 'text' | 'image' | 'shape';
  shapeType?: 'square' | 'circle';

  text?: string;
  url?: string;

  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;

  fontSize?: number;
  color?: string;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;

  backgroundColor?: string;
  borderColor?: string;
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

  const updateItem = (id: string, cambios: Partial<CanvasItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...cambios } : item)));
  };

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
        height: 140,
        zIndex: items.length + 1,
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
        zIndex: items.length + 1,
      },
    ]);
  };

  const addShape = (shapeType: 'square' | 'circle') => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        type: 'shape',
        shapeType,
        x: shapeType === 'circle' ? 160 : 120,
        y: shapeType === 'circle' ? 160 : 120,
        width: shapeType === 'circle' ? 220 : 300,
        height: shapeType === 'circle' ? 220 : 190,
        zIndex: items.length + 1,
        backgroundColor: shapeType === 'circle' ? '#3b82f6' : '#f97316',
        borderColor: '#ffffff',
      },
    ]);
  };

  const deleteItem = () => {
    if (!seleccionado) return;

    setItems(items.filter((item) => item.id !== seleccionado));
    setSeleccionado(null);
  };

  const traerDelante = () => {
    if (!itemActual) return;

    const maxZ = Math.max(...items.map((i) => i.zIndex || 1), 1);

    updateItem(itemActual.id, {
      zIndex: maxZ + 1,
    });
  };

  const enviarDetras = () => {
    if (!itemActual) return;

    updateItem(itemActual.id, {
      zIndex: 1,
    });
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

        <button
          type="button"
          onClick={() => addShape('square')}
          className="px-4 py-3 rounded-xl bg-black text-white text-[10px] font-black uppercase"
        >
          □ Cuadrado
        </button>

        <button
          type="button"
          onClick={() => addShape('circle')}
          className="px-4 py-3 rounded-xl bg-black text-white text-[10px] font-black uppercase"
        >
          ◯ Círculo
        </button>

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
              {[14, 18, 24, 28, 32, 40, 48, 64, 80, 110, 140].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => updateItem(itemActual.id, { bold: !itemActual.bold })}
              className="px-4 py-3 bg-black rounded-xl font-black"
            >
              B
            </button>

            <button
              type="button"
              onClick={() => updateItem(itemActual.id, { italic: !itemActual.italic })}
              className="px-4 py-3 bg-black rounded-xl italic"
            >
              I
            </button>

            <button
              type="button"
              onClick={() => updateItem(itemActual.id, { underline: !itemActual.underline })}
              className="px-4 py-3 bg-black rounded-xl underline"
            >
              U
            </button>
          </>
        )}

        {itemActual && (
          <>
            <input
              type="color"
              value={
                itemActual.type === 'shape'
                  ? itemActual.backgroundColor || '#ffffff'
                  : itemActual.color || '#ffffff'
              }
              onChange={(e) => {
                if (itemActual.type === 'shape') {
                  updateItem(itemActual.id, {
                    backgroundColor: e.target.value,
                  });
                } else {
                  updateItem(itemActual.id, {
                    color: e.target.value,
                  });
                }
              }}
              className="w-12 h-10 bg-black rounded-xl"
            />

            {itemActual.type === 'shape' && (
              <input
                type="color"
                value={itemActual.borderColor || '#ffffff'}
                onChange={(e) =>
                  updateItem(itemActual.id, {
                    borderColor: e.target.value,
                  })
                }
                className="w-12 h-10 bg-black rounded-xl"
                title="Color del borde"
              />
            )}

            <button
              type="button"
              onClick={traerDelante}
              className="px-4 py-3 rounded-xl bg-black text-white text-[10px] font-black uppercase"
            >
              ⬆ Delante
            </button>

            <button
              type="button"
              onClick={enviarDetras}
              className="px-4 py-3 rounded-xl bg-black text-white text-[10px] font-black uppercase"
            >
              ⬇ Detrás
            </button>

            <button
              type="button"
              onClick={deleteItem}
              className="ml-auto px-4 py-3 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase"
            >
              Eliminar
            </button>
          </>
        )}
      </div>

      <div className="relative h-[4000px] w-full bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:40px_40px]" />

        {items.map((item) => (
          <Rnd
            key={item.id}
            size={{
              width: item.width,
              height: item.height,
            }}
            position={{
              x: item.x,
              y: item.y,
            }}
            bounds="parent"
            enableResizing
            dragGrid={[1, 1]}
            style={{
              zIndex: item.zIndex || 1,
            }}
            onMouseDown={() => setSeleccionado(item.id)}
            onDragStop={(_, d) =>
              updateItem(item.id, {
                x: d.x,
                y: d.y,
              })
            }
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
            ) : item.type === 'shape' ? (
              <div
                className="w-full h-full cursor-move"
                style={{
                  background: item.backgroundColor || '#f97316',
                  border: `3px solid ${item.borderColor || '#ffffff'}`,
                  borderRadius: item.shapeType === 'circle' ? '9999px' : '24px',
                }}
              />
            ) : (
              <textarea
                value={item.text}
                onChange={(e) =>
                  updateItem(item.id, {
                    text: e.target.value,
                  })
                }
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
