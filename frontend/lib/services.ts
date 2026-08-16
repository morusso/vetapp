import { API_V1_URL } from "./auth";
import { createCrudResource } from "./crud";

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

const services = createCrudResource<Service, ServiceInput>(SERVICES_URL);

export const listServices = services.list;
export const listAllServices = services.listAll;
export const getService = services.get;
export const createService = services.create;
export const updateService = services.update;
export const deleteService = services.remove;
