'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

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
      Link.configure({
        openOnClick: false,
      }),
      Image,
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

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="px-4 py-2 bg-black rounded-xl"
        >
          B
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="px-4 py-2 bg-black rounded-xl"
        >
          I
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="px-4 py-2 bg-black rounded-xl"
        >
          U
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className="px-4 py-2 bg-black rounded-xl"
        >
          H1
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className="px-4 py-2 bg-black rounded-xl"
        >
          H2
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          className="px-4 py-2 bg-black rounded-xl"
        >
          •
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
          className="px-4 py-2 bg-black rounded-xl"
        >
          ❝
        </button>
      </div>

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
    }}
  />
</label>

      <div className="p-8 min-h-[600px] prose prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
