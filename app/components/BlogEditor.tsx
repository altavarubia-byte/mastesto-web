'use client';

import Color from '@tiptap/extension-color';
import Dropcursor from '@tiptap/extension-dropcursor';
import FontFamily from '@tiptap/extension-font-family';
import Gapcursor from '@tiptap/extension-gapcursor';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ResizeImage from 'tiptap-extension-resize-image';

export default function BlogEditor({
  content,
  setContent,
  onUploadImage,
}: {
  content: string;
  setContent: (value: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}) {
  const editor = useEditor({
    extensions: [
  StarterKit,
  Underline,
  TextStyle,
  Color,
  FontFamily.configure({
    types: ['textStyle'],
  }),
  Link.configure({
    openOnClick: false,
  }),
  Gapcursor,
  Dropcursor,
  ResizeImage.configure({
    inline: false,
    allowBase64: true,
  }),
],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-[2rem] overflow-hidden">
      <div className="flex flex-wrap gap-2 p-4 border-b border-zinc-900">
        <select
  defaultValue=""
  onChange={(e) => {
    editor.chain().focus().setFontFamily(e.target.value).run();
  }}
  className="px-4 py-2 bg-black rounded-xl text-white text-xs border border-zinc-800"
>
  <option value="" disabled>Fuente</option>
  <option value="Arial">Arial</option>
  <option value="Georgia">Georgia</option>
  <option value="Times New Roman">Times New Roman</option>
  <option value="Courier New">Courier New</option>
  <option value="Verdana">Verdana</option>
  <option value="Impact">Impact</option>
  <option value="monospace">Monospace</option>
</select>
        <input
  type="color"
  defaultValue="#ffffff"
  onChange={(e) => {
    editor.chain().focus().setColor(e.target.value).run();
  }}
  className="w-12 h-10 bg-black rounded-xl border border-zinc-800 cursor-pointer"
/>

        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="px-4 py-2 bg-black rounded-xl">
          B
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="px-4 py-2 bg-black rounded-xl">
          I
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className="px-4 py-2 bg-black rounded-xl">
          U
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="px-4 py-2 bg-black rounded-xl">
          H1
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-4 py-2 bg-black rounded-xl">
          H2
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-4 py-2 bg-black rounded-xl">
          •
        </button>

        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className="px-4 py-2 bg-black rounded-xl">
          ❝
        </button>

        <label className="px-4 py-2 bg-black rounded-xl cursor-pointer">
          🖼️
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const url = await onUploadImage(file);

              editor.chain().focus().setImage({ src: url }).run();

              e.target.value = '';
            }}
          />
        </label>
      </div>

      <div
        className="
          p-8
          min-h-[700px]
          prose
          prose-invert
          max-w-none
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror]:min-h-[650px]
          [&_.ProseMirror]:whitespace-pre-wrap
          [&_.ProseMirror]:break-words
          [&_.ProseMirror]:overflow-wrap-anywhere
          [&_.ProseMirror_p]:break-words
          [&_.ProseMirror_p]:overflow-wrap-anywhere
          [&_.ProseMirror_img]:max-w-full
          [&_.ProseMirror_img]:rounded-[24px]
          [&_.ProseMirror_img]:cursor-grab
          [&_.ProseMirror_img:active]:cursor-grabbing
        "
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}