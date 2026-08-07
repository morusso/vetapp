import { API_URL, getAccessToken } from "./auth";

export type AnimalType = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Animal = {
  id: number;
  name: string;
  animal_type: number;
  animal_type_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export class ApiError extends Error {
  fieldErrors: Record<string, string[]>;

  constructor(fieldErrors: Record<string, string[]>) {
    super(Object.values(fieldErrors).flat().join(" "));
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
      ...options.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    if (res.status === 400) {
      throw new ApiError(await res.json());
    }
    throw new ApiError({ detail: [`Request failed with status ${res.status}.`] });
  }

  return res.json();
}

const ANIMAL_TYPES_URL = `${API_URL}/api/animals/types/`;
const ANIMALS_URL = `${API_URL}/api/animals/`;

export function listAnimalTypes(url: string = ANIMAL_TYPES_URL) {
  return request<Paginated<AnimalType>>(url);
}

export async function listAllAnimalTypes(): Promise<AnimalType[]> {
  const all: AnimalType[] = [];
  let url: string | undefined = ANIMAL_TYPES_URL;
  while (url) {
    const page = await listAnimalTypes(url);
    all.push(...page.results);
    url = page.next ?? undefined;
  }
  return all;
}

export function getAnimalType(id: number) {
  return request<AnimalType>(`${ANIMAL_TYPES_URL}${id}/`);
}

export function createAnimalType(data: { name: string; description?: string }) {
  return request<AnimalType>(ANIMAL_TYPES_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAnimalType(id: number, data: { name: string; description?: string }) {
  return request<AnimalType>(`${ANIMAL_TYPES_URL}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAnimalType(id: number) {
  return request<void>(`${ANIMAL_TYPES_URL}${id}/`, { method: "DELETE" });
}

export function listAnimals(url: string = ANIMALS_URL) {
  return request<Paginated<Animal>>(url);
}

export function getAnimal(id: number) {
  return request<Animal>(`${ANIMALS_URL}${id}/`);
}

export function createAnimal(data: { name: string; animal_type: number; description?: string }) {
  return request<Animal>(ANIMALS_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAnimal(
  id: number,
  data: { name: string; animal_type: number; description?: string }
) {
  return request<Animal>(`${ANIMALS_URL}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAnimal(id: number) {
  return request<void>(`${ANIMALS_URL}${id}/`, { method: "DELETE" });
}
