import { API_V1_URL } from "./auth";
import { request, type Paginated } from "./api";

export type Visit = {
  id: number;
  patient: number;
  patient_name: string;
  veterinarian: number;
  veterinarian_name: string;
  visit_date: string;
  diagnosis: string;
  created_at: string;
  updated_at: string;
};

export type VisitInput = {
  patient: number;
  veterinarian: number;
  visit_date: string;
  diagnosis?: string;
};

export type VisitNote = {
  id: number;
  visit: number;
  content: string;
  author: number | null;
  author_name: string | null;
  created_at: string;
  updated_at: string;
};

export type VisitNoteInput = {
  visit: number;
  content: string;
};

export type PrescribedMedicine = {
  id: number;
  visit: number;
  medicine: number;
  medicine_name: string;
  quantity: string;
  dosage: string;
  created_at: string;
  updated_at: string;
};

export type PrescribedMedicineInput = {
  visit: number;
  medicine: number;
  quantity: string;
  dosage?: string;
};

export type VisitService = {
  id: number;
  visit: number;
  service: number;
  service_name: string;
  quantity: string;
  price: string | null;
  tax_rate: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type VisitServiceInput = {
  visit: number;
  service: number;
  quantity: string;
  price?: string | null;
  tax_rate?: string | null;
  notes?: string;
};

export type VisitWithDetails = Visit & {
  notes: VisitNote[];
  prescribed_medicines: PrescribedMedicine[];
  visit_services: VisitService[];
};

const VISITS_URL = `${API_V1_URL}/clinical-data/visits/`;
const VISIT_NOTES_URL = `${API_V1_URL}/clinical-data/visits/notes/`;
const PRESCRIBED_MEDICINES_URL = `${API_V1_URL}/clinical-data/visits/medicines/`;
const VISIT_SERVICES_URL = `${API_V1_URL}/clinical-data/visits/services/`;

export function listVisits(url: string = VISITS_URL) {
  return request<Paginated<Visit>>(url);
}

export function getVisit(id: number) {
  return request<Visit>(`${VISITS_URL}${id}/`);
}

export function getVisitFull(id: number) {
  return request<VisitWithDetails>(`${VISITS_URL}${id}/full/`);
}

export function createVisit(data: VisitInput) {
  return request<Visit>(VISITS_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateVisit(id: number, data: VisitInput) {
  return request<Visit>(`${VISITS_URL}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteVisit(id: number) {
  return request<void>(`${VISITS_URL}${id}/`, { method: "DELETE" });
}

export function listVisitNotes(visitId: number, url?: string) {
  return request<Paginated<VisitNote>>(url ?? `${VISIT_NOTES_URL}?visit=${visitId}`);
}

export async function listAllVisitNotes(visitId: number): Promise<VisitNote[]> {
  const all: VisitNote[] = [];
  let url: string | undefined = `${VISIT_NOTES_URL}?visit=${visitId}`;
  while (url) {
    const page = await listVisitNotes(visitId, url);
    all.push(...page.results);
    url = page.next ?? undefined;
  }
  return all;
}

export function createVisitNote(data: VisitNoteInput) {
  return request<VisitNote>(VISIT_NOTES_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteVisitNote(id: number) {
  return request<void>(`${VISIT_NOTES_URL}${id}/`, { method: "DELETE" });
}

export function listPrescribedMedicines(visitId: number, url?: string) {
  return request<Paginated<PrescribedMedicine>>(
    url ?? `${PRESCRIBED_MEDICINES_URL}?visit=${visitId}`
  );
}

export async function listAllPrescribedMedicines(
  visitId: number
): Promise<PrescribedMedicine[]> {
  const all: PrescribedMedicine[] = [];
  let url: string | undefined = `${PRESCRIBED_MEDICINES_URL}?visit=${visitId}`;
  while (url) {
    const page = await listPrescribedMedicines(visitId, url);
    all.push(...page.results);
    url = page.next ?? undefined;
  }
  return all;
}

export function createPrescribedMedicine(data: PrescribedMedicineInput) {
  return request<PrescribedMedicine>(PRESCRIBED_MEDICINES_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deletePrescribedMedicine(id: number) {
  return request<void>(`${PRESCRIBED_MEDICINES_URL}${id}/`, { method: "DELETE" });
}

export function listVisitServices(visitId: number, url?: string) {
  return request<Paginated<VisitService>>(
    url ?? `${VISIT_SERVICES_URL}?visit=${visitId}`
  );
}

export async function listAllVisitServices(visitId: number): Promise<VisitService[]> {
  const all: VisitService[] = [];
  let url: string | undefined = `${VISIT_SERVICES_URL}?visit=${visitId}`;
  while (url) {
    const page = await listVisitServices(visitId, url);
    all.push(...page.results);
    url = page.next ?? undefined;
  }
  return all;
}

export function createVisitService(data: VisitServiceInput) {
  return request<VisitService>(VISIT_SERVICES_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteVisitService(id: number) {
  return request<void>(`${VISIT_SERVICES_URL}${id}/`, { method: "DELETE" });
}
