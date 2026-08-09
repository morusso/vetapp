import { API_V1_URL } from "./auth";
import { request, type Paginated } from "./api";

export type DosageForm =
  | "tablet"
  | "capsule"
  | "liquid"
  | "injection"
  | "ointment"
  | "powder"
  | "drops"
  | "spray"
  | "other";

export type Medicine = {
  id: number;
  name: string;
  manufacturer: string;
  active_substance: string;
  form: DosageForm;
  strength: string;
  unit: string;
  description: string | null;
  withdrawal_period_days: number | null;
  minimum_stock_level: string | null;
  requires_prescription: boolean;
  is_controlled_substance: boolean;
  created_at: string;
  updated_at: string;
};

export type MedicineInput = {
  name: string;
  manufacturer?: string;
  active_substance?: string;
  form?: DosageForm;
  strength?: string;
  unit: string;
  description?: string | null;
  withdrawal_period_days?: number | null;
  minimum_stock_level?: string | null;
  requires_prescription?: boolean;
  is_controlled_substance?: boolean;
};

export type MedicineBatch = {
  id: number;
  medicine: number;
  medicine_name: string;
  batch_number: string;
  quantity: string;
  unit_price: string | null;
  supplier: string;
  expiry_date: string;
  received_at: string;
  created_at: string;
  updated_at: string;
};

export type MedicineBatchInput = {
  medicine: number;
  batch_number: string;
  quantity: string;
  unit_price?: string | null;
  supplier?: string;
  expiry_date: string;
  received_at: string;
};

const MEDICINES_URL = `${API_V1_URL}/clinical-data/medicines/`;
const MEDICINE_BATCHES_URL = `${API_V1_URL}/clinical-data/medicines/batches/`;

export function listMedicines(url: string = MEDICINES_URL) {
  return request<Paginated<Medicine>>(url);
}

export async function listAllMedicines(): Promise<Medicine[]> {
  const all: Medicine[] = [];
  let url: string | undefined = MEDICINES_URL;
  while (url) {
    const page = await listMedicines(url);
    all.push(...page.results);
    url = page.next ?? undefined;
  }
  return all;
}

export function getMedicine(id: number) {
  return request<Medicine>(`${MEDICINES_URL}${id}/`);
}

export function createMedicine(data: MedicineInput) {
  return request<Medicine>(MEDICINES_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateMedicine(id: number, data: MedicineInput) {
  return request<Medicine>(`${MEDICINES_URL}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteMedicine(id: number) {
  return request<void>(`${MEDICINES_URL}${id}/`, { method: "DELETE" });
}

export function listMedicineBatches(url: string = MEDICINE_BATCHES_URL) {
  return request<Paginated<MedicineBatch>>(url);
}

export function createMedicineBatch(data: MedicineBatchInput) {
  return request<MedicineBatch>(MEDICINE_BATCHES_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteMedicineBatch(id: number) {
  return request<void>(`${MEDICINE_BATCHES_URL}${id}/`, { method: "DELETE" });
}
