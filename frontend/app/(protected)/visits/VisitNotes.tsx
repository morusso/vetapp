"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import {
  createVisitNote,
  deleteVisitNote,
  listAllVisitNotes,
  type VisitNote,
} from "@/lib/visits";
import { TrashIcon } from "@/components/icons";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextViewer from "@/components/RichTextViewer";

export default function VisitNotes({ visitId }: { visitId: number }) {
  const [notes, setNotes] = useState<VisitNote[]>([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load() {
    try {
      setNotes(await listAllVisitNotes(visitId));
    } catch {
      setError("Could not load notes.");
    }
  }

  useEffect(() => {
    async function init() {
      try {
        setNotes(await listAllVisitNotes(visitId));
      } catch {
        setError("Could not load notes.");
      }
    }
    init();
  }, [visitId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createVisitNote({ visit: visitId, content });
      setContent("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this note.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this note?")) return;
    try {
      await deleteVisitNote(id);
      load();
    } catch {
      setError("Could not delete this note.");
    }
  }

  return (
    <div className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-sm">
      <div className="border-b border-line px-6 py-4">
        <h2 className="text-base font-semibold">Notes</h2>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        {error && <p className="text-sm text-danger">{error}</p>}

        <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
          {notes.map((n) => (
            <li key={n.id} className="rounded-md border border-line px-3 py-2 text-sm">
              <div className="flex items-start justify-between gap-2">
                <RichTextViewer html={n.content} className="text-ink" />
                <button
                  type="button"
                  onClick={() => handleDelete(n.id)}
                  title="Delete"
                  className="flex size-7 flex-none items-center justify-center rounded-md text-ink-faint hover:bg-danger-soft hover:text-danger"
                >
                  <TrashIcon />
                </button>
              </div>
              <p className="mt-1 text-xs text-ink-faint">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </li>
          ))}
          {notes.length === 0 && <p className="py-2 text-sm text-ink-faint">No notes yet.</p>}
        </ul>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-line pt-4">
          <label htmlFor="content" className="text-xs font-semibold text-ink-muted">
            Add a note
          </label>
          <RichTextEditor id="content" value={content} onChange={setContent} required />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Add note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
