import { API_V1_URL } from "./auth";
import { ApiError, type Paginated } from "./api";
import { createCrudResource } from "./crud";

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

const users = createCrudResource<User, UserInput>(USERS_URL);
const specializations = createCrudResource<Specialization, { name: string }>(
  SPECIALIZATIONS_URL
);

export const listUsers = users.list;
export const listAllUsers = users.listAll;
export const createUser = users.create;

export const listSpecializations = specializations.list;
export const listAllSpecializations = specializations.listAll;
