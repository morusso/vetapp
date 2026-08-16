import { API_V1_URL } from "./auth";
import { request } from "./api";
import { createCrudResource } from "./crud";
import type { NotificationChannel } from "./clients";

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
  vaccine_valid_until: string | null;
  notification_channel: NotificationChannel | "";
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
  vaccine_valid_until?: string | null;
  notification_channel?: NotificationChannel | "";
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

const visits = createCrudResource<Visit, VisitInput>(VISITS_URL);
const visitNotes = createCrudResource<VisitNote, VisitNoteInput>(VISIT_NOTES_URL);
const prescribedMedicines = createCrudResource<PrescribedMedicine, PrescribedMedicineInput>(
  PRESCRIBED_MEDICINES_URL
);
const visitServices = createCrudResource<VisitService, VisitServiceInput>(
  VISIT_SERVICES_URL
);

export const listVisits = visits.list;
export const getVisit = visits.get;
export const createVisit = visits.create;
export const updateVisit = visits.update;
export const deleteVisit = visits.remove;

export function getVisitFull(id: number) {
  return request<VisitWithDetails>(`${VISITS_URL}${id}/full/`);
}

export function listVisitNotes(visitId: number, url?: string) {
  return visitNotes.list(url ?? `${VISIT_NOTES_URL}?visit=${visitId}`);
}

export function listAllVisitNotes(visitId: number): Promise<VisitNote[]> {
  return visitNotes.listAll(`${VISIT_NOTES_URL}?visit=${visitId}`);
}

export const createVisitNote = visitNotes.create;
export const deleteVisitNote = visitNotes.remove;

export function listPrescribedMedicines(visitId: number, url?: string) {
  return prescribedMedicines.list(url ?? `${PRESCRIBED_MEDICINES_URL}?visit=${visitId}`);
}

export function listAllPrescribedMedicines(visitId: number): Promise<PrescribedMedicine[]> {
  return prescribedMedicines.listAll(`${PRESCRIBED_MEDICINES_URL}?visit=${visitId}`);
}

export const createPrescribedMedicine = prescribedMedicines.create;
export const deletePrescribedMedicine = prescribedMedicines.remove;

export function listVisitServices(visitId: number, url?: string) {
  return visitServices.list(url ?? `${VISIT_SERVICES_URL}?visit=${visitId}`);
}

export function listAllVisitServices(visitId: number): Promise<VisitService[]> {
  return visitServices.listAll(`${VISIT_SERVICES_URL}?visit=${visitId}`);
}

export const createVisitService = visitServices.create;
export const deleteVisitService = visitServices.remove;
