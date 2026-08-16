import { API_V1_URL } from "./auth";
import { createCrudResource } from "./crud";

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
  purchase_price: string | null;
  sale_price: string | null;
  tax_rate: string | null;
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
  purchase_price?: string | null;
  sale_price?: string | null;
  tax_rate?: string | null;
  supplier?: string;
  expiry_date: string;
  received_at: string;
};

const MEDICINES_URL = `${API_V1_URL}/clinical-data/medicines/`;
const MEDICINE_BATCHES_URL = `${API_V1_URL}/clinical-data/medicines/batches/`;

const medicines = createCrudResource<Medicine, MedicineInput>(MEDICINES_URL);
const medicineBatches = createCrudResource<MedicineBatch, MedicineBatchInput>(
  MEDICINE_BATCHES_URL
);

export const listMedicines = medicines.list;
export const listAllMedicines = medicines.listAll;
export const getMedicine = medicines.get;
export const createMedicine = medicines.create;
export const updateMedicine = medicines.update;
export const deleteMedicine = medicines.remove;

export const listMedicineBatches = medicineBatches.list;
export const createMedicineBatch = medicineBatches.create;
export const deleteMedicineBatch = medicineBatches.remove;
