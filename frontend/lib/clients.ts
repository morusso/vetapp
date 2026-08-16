import { API_V1_URL } from "./auth";
import { request } from "./api";
import { createCrudResource } from "./crud";
import type { Patient } from "./patients";

export type NotificationChannel = "email" | "sms";

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
  preferred_notification_channel: NotificationChannel;
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
  preferred_notification_channel?: NotificationChannel;
};

const CLIENTS_URL = `${API_V1_URL}/clients/`;

const clients = createCrudResource<Client, ClientInput>(CLIENTS_URL);

export const listClients = clients.list;
export const listAllClients = clients.listAll;
export const getClient = clients.get;
export const createClient = clients.create;
export const updateClient = clients.update;
export const deleteClient = clients.remove;

export type ClientWithPatients = Client & { patients: Patient[] };

export function getClientFull(id: number) {
  return request<ClientWithPatients>(`${CLIENTS_URL}${id}/full/`);
}
