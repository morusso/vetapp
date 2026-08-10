"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { BoldIcon, ItalicIcon, BulletListIcon, OrderedListIcon } from "@/components/icons";

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`flex size-7 items-center justify-center rounded-md text-ink-faint hover:bg-surface-3 hover:text-ink ${
        active ? "bg-accent-soft text-accent-soft-ink" : ""
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-line px-1.5 py-1">
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        <BulletListIcon />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered list"
      >
        <OrderedListIcon />
      </ToolbarButton>
    </div>
  );
}

export default function RichTextEditor({
  id,
  value,
  onChange,
  required = false,
  className = "",
  editorClassName = "min-h-20",
}: {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  required?: boolean;
  className?: string;
  editorClassName?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: `prose-notes max-w-none focus:outline-none ${editorClassName}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? "" : editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const isSynced = value === editor.getHTML() || (value === "" && editor.isEmpty);
    if (!isSynced) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div
      className={`flex flex-col rounded-md border border-line-strong bg-surface focus-within:border-accent ${className}`}
    >
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="px-3 py-2 text-sm" />
      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value={editor && !editor.isEmpty ? "x" : ""}
          onChange={() => {}}
          className="sr-only"
        />
      )}
    </div>
  );
}
