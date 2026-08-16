import Link from "next/link";
import { EditIcon, EyeIcon, TrashIcon } from "@/components/icons";

const linkButtonClass =
  "flex size-7 items-center justify-center rounded-md text-ink-faint hover:bg-surface-3 hover:text-ink";
const deleteButtonClass =
  "flex size-7 items-center justify-center rounded-md text-ink-faint hover:bg-danger-soft hover:text-danger";

export function ViewAction({ href }: { href: string }) {
  return (
    <Link href={href} title="View" className={linkButtonClass}>
      <EyeIcon />
    </Link>
  );
}

export function EditAction({ href }: { href: string }) {
  return (
    <Link href={href} title="Edit" className={linkButtonClass}>
      <EditIcon />
    </Link>
  );
}

export function DeleteAction({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title="Delete" className={deleteButtonClass}>
      <TrashIcon />
    </button>
  );
}
