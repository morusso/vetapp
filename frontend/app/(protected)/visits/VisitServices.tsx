"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import type { NotificationChannel } from "@/lib/clients";
import { listAllServices, type Service } from "@/lib/services";
import {
  createVisitService,
  deleteVisitService,
  listAllVisitServices,
  type VisitService,
} from "@/lib/visits";
import { TrashIcon } from "@/components/icons";

const NOTIFICATION_CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  sms: "SMS",
};

export default function VisitServices({ visitId }: { visitId: number }) {
  const [visitServices, setVisitServices] = useState<VisitService[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [service, setService] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [vaccineValidUntil, setVaccineValidUntil] = useState("");
  const [notificationChannel, setNotificationChannel] = useState<NotificationChannel | "">("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load() {
    try {
      setVisitServices(await listAllVisitServices(visitId));
    } catch {
      setError("Could not load services.");
    }
  }

  useEffect(() => {
    async function init() {
      try {
        setVisitServices(await listAllVisitServices(visitId));
      } catch {
        setError("Could not load services.");
      }
    }
    init();
    listAllServices()
      .then(setServices)
      .catch(() => setError("Could not load services."));
  }, [visitId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createVisitService({
        visit: visitId,
        service: Number(service),
        quantity,
        notes,
        vaccine_valid_until: vaccineValidUntil || null,
        notification_channel: notificationChannel,
      });
      setService("");
      setQuantity("1");
      setNotes("");
      setVaccineValidUntil("");
      setNotificationChannel("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this service from the visit?")) return;
    try {
      await deleteVisitService(id);
      load();
    } catch {
      setError("Could not remove this service.");
    }
  }

  const inputClass =
    "rounded-md border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none";

  return (
    <div className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-sm">
      <div className="border-b border-line px-6 py-4">
        <h2 className="text-base font-semibold">Services</h2>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        {error && <p className="text-sm text-danger">{error}</p>}

        <ul className="flex flex-col gap-1.5">
          {visitServices.map((vs) => (
            <li
              key={vs.id}
              className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm"
            >
              <span>
                <span className="font-medium">{vs.service_name}</span>{" "}
                <span className="font-mono text-ink-muted">× {vs.quantity}</span>
                {vs.notes && <span className="text-ink-faint"> — {vs.notes}</span>}
                {vs.vaccine_valid_until && (
                  <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-ink-muted">
                    Valid until {vs.vaccine_valid_until}
                  </span>
                )}
                {vs.notification_channel && (
                  <span className="ml-1.5 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-ink-muted">
                    Remind via {NOTIFICATION_CHANNEL_LABELS[vs.notification_channel]}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(vs.id)}
                title="Remove"
                className="flex size-7 items-center justify-center rounded-md text-ink-faint hover:bg-danger-soft hover:text-danger"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
          {visitServices.length === 0 && (
            <p className="py-2 text-sm text-ink-faint">No services added yet.</p>
          )}
        </ul>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-line pt-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="service" className="text-xs font-semibold text-ink-muted">
              Service
            </label>
            <select
              id="service"
              required
              value={service}
              onChange={(e) => setService(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select a service
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="quantity" className="text-xs font-semibold text-ink-muted">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`${inputClass} w-24`}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="notes" className="text-xs font-semibold text-ink-muted">
                Notes
              </label>
              <input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50"
            >
              Add
            </button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="vaccine_valid_until"
                className="text-xs font-semibold text-ink-muted"
              >
                Vaccine valid until
              </label>
              <input
                id="vaccine_valid_until"
                type="date"
                value={vaccineValidUntil}
                onChange={(e) => setVaccineValidUntil(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label
                htmlFor="notification_channel"
                className="text-xs font-semibold text-ink-muted"
              >
                Remind client via
              </label>
              <select
                id="notification_channel"
                value={notificationChannel}
                onChange={(e) =>
                  setNotificationChannel(e.target.value as NotificationChannel | "")
                }
                className={inputClass}
              >
                <option value="">Client&apos;s default</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
