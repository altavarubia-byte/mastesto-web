'use client';

import { Rnd } from 'react-rnd';
import { useState } from 'react';

type CanvasItem = {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
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

  const addImage = async (file: File) => {
    const url = await onUploadImage(file);

    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        url,
        x: 40,
        y: 40,
        width: 300,
        height: 220,
      },
    ]);
  };

  const updateItem = (id: string, cambios: Partial<CanvasItem>) => {
    setItems(items.map((item) => (item.id === id ? { ...item, ...cambios } : item)));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden">
      <div className="p-4 border-b border-zinc-900 flex items-center justify-between gap-4">
        <div>
          <p className="text-orange-500 text-[10px] uppercase font-black tracking-[0.4em]">
            Canvas visual
          </p>
          <p className="text-zinc-600 text-[9px] uppercase font-black mt-1">
            Arrastra imágenes, cambia tamaño y colócalas libremente.
          </p>
        </div>

        <label className="bg-orange-600 text-black px-5 py-3 rounded-xl text-[10px] font-black uppercase cursor-pointer">
          Subir imagen
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
      </div>

      <div className="relative h-[1000px] w-full bg-black overflow-hidden">
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
            dragHandleClassName="drag-handle"
            onMouseDown={() => setSeleccionado(item.id)}
            onDragStop={(_, d) => {
              updateItem(item.id, {
                x: d.x,
                y: d.y,
              });
            }}
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
            <div className="relative w-full h-full drag-handle cursor-move">
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover rounded-2xl select-none cursor-move"
                draggable={false}
              />

              {seleccionado === item.id && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 text-white text-xs font-black z-20"
                >
                  ×
                </button>
              )}
            </div>
          </Rnd>
        ))}
      </div>
    </div>
  );
}
