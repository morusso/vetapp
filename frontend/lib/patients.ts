import { API_V1_URL } from "./auth";
import { request } from "./api";
import { createCrudResource } from "./crud";
import type { VisitWithDetails } from "./visits";

export type Sex = "male" | "female" | "unknown";

export type Patient = {
  id: number;
  name: string;
  owner: number;
  owner_name: string;
  breed: number;
  breed_name: string;
  sex: Sex;
  birth_date: string | null;
  color: string;
  microchip_number: string | null;
  note: string | null;
  is_sterilized: boolean;
  is_deceased: boolean;
  date_of_death: string | null;
  created_at: string;
  updated_at: string;
};

export type PatientInput = {
  name: string;
  owner: number;
  breed: number;
  sex: Sex;
  birth_date?: string | null;
  color?: string;
  microchip_number?: string | null;
  note?: string | null;
  is_sterilized?: boolean;
  is_deceased?: boolean;
  date_of_death?: string | null;
};

export type PatientWeight = {
  id: number;
  patient: number;
  weight_kg: string;
  recorded_at: string;
  created_at: string;
};

export type PatientWeightInput = {
  patient: number;
  weight_kg: string;
  recorded_at: string;
};

const PATIENTS_URL = `${API_V1_URL}/animals/patients/`;
const PATIENT_WEIGHTS_URL = `${API_V1_URL}/animals/patients/weights/`;

const patients = createCrudResource<Patient, PatientInput>(PATIENTS_URL);
const patientWeights = createCrudResource<PatientWeight, PatientWeightInput>(
  PATIENT_WEIGHTS_URL
);

export const listPatients = patients.list;
export const listAllPatients = patients.listAll;
export const getPatient = patients.get;
export const createPatient = patients.create;
export const updatePatient = patients.update;
export const deletePatient = patients.remove;

export type PatientWithWeights = Patient & {
  weight_records: PatientWeight[];
  visits: VisitWithDetails[];
};

export function getPatientFull(id: number) {
  return request<PatientWithWeights>(`${PATIENTS_URL}${id}/full/`);
}

export function listPatientWeights(patientId: number, url?: string) {
  return patientWeights.list(url ?? `${PATIENT_WEIGHTS_URL}?patient=${patientId}`);
}

export function listAllPatientWeights(patientId: number): Promise<PatientWeight[]> {
  return patientWeights.listAll(`${PATIENT_WEIGHTS_URL}?patient=${patientId}`);
}

export const createPatientWeight = patientWeights.create;
export const deletePatientWeight = patientWeights.remove;
