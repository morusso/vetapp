import { API_V1_URL } from "./auth";
import { request, type Paginated } from "./api";

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

export function listPatients(url: string = PATIENTS_URL) {
  return request<Paginated<Patient>>(url);
}

export function getPatient(id: number) {
  return request<Patient>(`${PATIENTS_URL}${id}/`);
}

export function createPatient(data: PatientInput) {
  return request<Patient>(PATIENTS_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updatePatient(id: number, data: PatientInput) {
  return request<Patient>(`${PATIENTS_URL}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deletePatient(id: number) {
  return request<void>(`${PATIENTS_URL}${id}/`, { method: "DELETE" });
}

export function listPatientWeights(patientId: number, url?: string) {
  return request<Paginated<PatientWeight>>(
    url ?? `${PATIENT_WEIGHTS_URL}?patient=${patientId}`
  );
}

export async function listAllPatientWeights(patientId: number): Promise<PatientWeight[]> {
  const all: PatientWeight[] = [];
  let url: string | undefined = `${PATIENT_WEIGHTS_URL}?patient=${patientId}`;
  while (url) {
    const page = await listPatientWeights(patientId, url);
    all.push(...page.results);
    url = page.next ?? undefined;
  }
  return all;
}

export function createPatientWeight(data: PatientWeightInput) {
  return request<PatientWeight>(PATIENT_WEIGHTS_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deletePatientWeight(id: number) {
  return request<void>(`${PATIENT_WEIGHTS_URL}${id}/`, { method: "DELETE" });
}
