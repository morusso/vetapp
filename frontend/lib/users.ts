import { API_V1_URL } from "./auth";
import { ApiError, request, type Paginated } from "./api";

export { ApiError };
export type { Paginated };

export type Specialization = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  specializations: number[];
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
};

export type UserInput = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  specializations?: number[];
  is_staff?: boolean;
  is_active?: boolean;
};

const USERS_URL = `${API_V1_URL}/user/`;
const SPECIALIZATIONS_URL = `${API_V1_URL}/user/specializations/`;

export function listUsers(url: string = USERS_URL) {
  return request<Paginated<User>>(url);
}

export async function listAllUsers(): Promise<User[]> {
  const all: User[] = [];
  let url: string | undefined = USERS_URL;
  while (url) {
    const page = await listUsers(url);
    all.push(...page.results);
    url = page.next ?? undefined;
  }
  return all;
}

export function createUser(data: UserInput) {
  return request<User>(USERS_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function listSpecializations(url: string = SPECIALIZATIONS_URL) {
  return request<Paginated<Specialization>>(url);
}

export async function listAllSpecializations(): Promise<Specialization[]> {
  const all: Specialization[] = [];
  let url: string | undefined = SPECIALIZATIONS_URL;
  while (url) {
    const page = await listSpecializations(url);
    all.push(...page.results);
    url = page.next ?? undefined;
  }
  return all;
}
