"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type ClientWithPatients, getClientFull } from "@/lib/clients";
import { EditIcon } from "@/components/icons";

const SEX_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  unknown: "Unknown",
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientWithPatients | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClientFull(Number(id))
      .then(setClient)
      .catch(() => setError("Could not load this client."));
  }, [id]);

  if (error) {
    return (
      <main className="flex flex-1 flex-col p-6">
        <p className="text-sm text-danger">{error}</p>
      </main>
    );
  }

  if (!client) {
    return <main className="flex flex-1 flex-col p-6" />;
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-6">
      <div className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">
              {client.first_name} {client.last_name}
            </h2>
            <p className="text-xs text-ink-faint">Client details</p>
          </div>
          <Link
            href={`/clients/${client.id}/edit`}
            className="flex items-center gap-1.5 rounded-md border border-line-strong px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface-2"
          >
            <EditIcon className="size-3.5" />
            Edit
          </Link>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
              Contact
            </legend>
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs text-ink-faint">Email</div>
                <div>{client.email}</div>
              </div>
              <div>
                <div className="text-xs text-ink-faint">Phone number</div>
                <div className="font-mono">{client.phone_number}</div>
              </div>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
              Address
            </legend>
            <div className="text-sm">
              <div>{client.street}</div>
              <div className="text-ink-muted">
                {client.city}, {client.postal_code}
              </div>
            </div>
          </fieldset>

          {client.notes && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Notes
              </legend>
              <p className="text-sm whitespace-pre-wrap text-ink-muted">{client.notes}</p>
            </fieldset>
          )}
        </div>
      </div>

      <div className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-sm">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-base font-semibold">Patients</h2>
          <p className="text-xs text-ink-faint">
            {client.patients.length} registered
          </p>
        </div>

        {client.patients.length === 0 ? (
          <p className="px-6 py-6 text-center text-sm text-ink-faint">No patients yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-line bg-surface-2 px-4 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                    Name
                  </th>
                  <th className="border-b border-line bg-surface-2 px-4 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                    Breed
                  </th>
                  <th className="border-b border-line bg-surface-2 px-4 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                    Sex
                  </th>
                  <th className="border-b border-line bg-surface-2 px-4 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                    Birth date
                  </th>
                  <th className="border-b border-line bg-surface-2 px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {client.patients.map((p) => (
                  <tr key={p.id} className="group">
                    <td className="border-b border-line px-4 py-2.5 group-hover:bg-surface-2">
                      <span className="font-medium">{p.name}</span>
                      {p.is_deceased && (
                        <span className="ml-1.5 text-xs text-danger">deceased</span>
                      )}
                    </td>
                    <td className="border-b border-line px-4 py-2.5 text-ink-muted group-hover:bg-surface-2">
                      {p.breed_name}
                    </td>
                    <td className="border-b border-line px-4 py-2.5 text-ink-muted group-hover:bg-surface-2">
                      {SEX_LABELS[p.sex] ?? p.sex}
                    </td>
                    <td className="border-b border-line px-4 py-2.5 text-ink-muted group-hover:bg-surface-2">
                      {p.birth_date ?? "—"}
                    </td>
                    <td className="border-b border-line px-4 py-2.5 group-hover:bg-surface-2">
                      <div className="flex justify-end">
                        <Link
                          href={`/patients/${p.id}`}
                          title="Edit"
                          className="flex size-7 items-center justify-center rounded-md text-ink-faint hover:bg-surface-3 hover:text-ink"
                        >
                          <EditIcon />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
