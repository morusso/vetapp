import { API_V1_URL } from "./auth";
import { request, type Paginated } from "./api";

export type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
  tax_rate: string | null;
  duration_minutes: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ServiceInput = {
  name: string;
  description?: string;
  price: string;
  tax_rate?: string | null;
  duration_minutes?: number | null;
  is_active?: boolean;
};

const SERVICES_URL = `${API_V1_URL}/clinical-data/services/`;

export function listServices(url: string = SERVICES_URL) {
  return request<Paginated<Service>>(url);
}

export async function listAllServices(): Promise<Service[]> {
  const all: Service[] = [];
  let url: string | undefined = SERVICES_URL;
  while (url) {
    const page = await listServices(url);
    all.push(...page.results);
    url = page.next ?? undefined;
  }
  return all;
}

export function getService(id: number) {
  return request<Service>(`${SERVICES_URL}${id}/`);
}

export function createService(data: ServiceInput) {
  return request<Service>(SERVICES_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateService(id: number, data: ServiceInput) {
  return request<Service>(`${SERVICES_URL}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteService(id: number) {
  return request<void>(`${SERVICES_URL}${id}/`, { method: "DELETE" });
}
