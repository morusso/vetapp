"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { useAuth } from "@/lib/auth-context";

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  const diffDays = Math.round((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: "long" });

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

type NoteGroup = { label: string; notes: VisitNote[] };

function groupNotesByDate(notes: VisitNote[]): NoteGroup[] {
  const groups: NoteGroup[] = [];
  for (const note of notes) {
    const label = formatDateLabel(note.created_at);
    const current = groups[groups.length - 1];
    if (current && current.label === label) {
      current.notes.push(note);
    } else {
      groups.push({ label, notes: [note] });
    }
  }
  return groups;
}

export default function VisitNotes({ visitId }: { visitId: number }) {
  const { currentUser } = useAuth();
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

  const noteGroups = useMemo(() => groupNotesByDate(notes), [notes]);

  function canDelete(note: VisitNote): boolean {
    if (!currentUser) return false;
    return currentUser.isAdmin || note.author === currentUser.id;
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

        <div className="flex max-h-96 flex-col gap-4 overflow-y-auto pr-1">
          {noteGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {group.label}
              </p>
              <ul className="flex flex-col gap-2">
                {group.notes.map((n) => (
                  <li
                    key={n.id}
                    className="group/note rounded-lg border border-line px-3.5 py-2.5 text-sm transition-colors hover:border-ink-faint/40"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span
                        className="text-xs text-ink-faint"
                        title={new Date(n.created_at).toLocaleString()}
                      >
                        {n.author_name ? `${n.author_name} · ` : ""}
                        {formatTime(n.created_at)}
                      </span>
                      {canDelete(n) && (
                        <button
                          type="button"
                          onClick={() => handleDelete(n.id)}
                          title="Delete"
                          className="flex size-6 flex-none items-center justify-center rounded-md text-ink-faint opacity-0 transition-opacity hover:bg-danger-soft hover:text-danger focus-visible:opacity-100 group-hover/note:opacity-100"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                    <RichTextViewer html={n.content} className="text-ink" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {notes.length === 0 && <p className="py-2 text-sm text-ink-faint">No notes yet.</p>}
        </div>

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
