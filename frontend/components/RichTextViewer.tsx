"use client";

import DOMPurify from "dompurify";
import { useMemo } from "react";

export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).trim();
}

export default function RichTextViewer({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const safeHtml = useMemo(() => DOMPurify.sanitize(html), [html]);

  return (
    <div
      className={`prose-notes max-w-none text-sm text-ink-muted ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
