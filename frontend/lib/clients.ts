import { API_V1_URL } from "./auth";
import { request, type Paginated } from "./api";

export type Client = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  street: string;
  city: string;
  postal_code: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type ClientInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  street: string;
  city: string;
  postal_code: string;
  notes?: string;
};

const CLIENTS_URL = `${API_V1_URL}/clients/`;

export function listClients(url: string = CLIENTS_URL) {
  return request<Paginated<Client>>(url);
}

export async function listAllClients(): Promise<Client[]> {
  const all: Client[] = [];
  let url: string | undefined = CLIENTS_URL;
  while (url) {
    const page = await listClients(url);
    all.push(...page.results);
    url = page.next ?? undefined;
  }
  return all;
}

export function getClient(id: number) {
  return request<Client>(`${CLIENTS_URL}${id}/`);
}

export function createClient(data: ClientInput) {
  return request<Client>(CLIENTS_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateClient(id: number, data: ClientInput) {
  return request<Client>(`${CLIENTS_URL}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteClient(id: number) {
  return request<void>(`${CLIENTS_URL}${id}/`, { method: "DELETE" });
}
