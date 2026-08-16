import { API_V1_URL } from "./auth";
import { ApiError, type Paginated } from "./api";
import { createCrudResource } from "./crud";

export { ApiError };
export type { Paginated };

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

type AnimalTypeInput = { name: string; description?: string };
type AnimalInput = { name: string; animal_type: number; description?: string };

const ANIMAL_TYPES_URL = `${API_V1_URL}/animals/types/`;
const ANIMALS_URL = `${API_V1_URL}/animals/`;

const animalTypes = createCrudResource<AnimalType, AnimalTypeInput>(ANIMAL_TYPES_URL);
const animals = createCrudResource<Animal, AnimalInput>(ANIMALS_URL);

export const listAnimalTypes = animalTypes.list;
export const listAllAnimalTypes = animalTypes.listAll;
export const getAnimalType = animalTypes.get;
export const createAnimalType = animalTypes.create;
export const updateAnimalType = animalTypes.update;
export const deleteAnimalType = animalTypes.remove;

export const listAnimals = animals.list;
export const listAllAnimals = animals.listAll;
export const getAnimal = animals.get;
export const createAnimal = animals.create;
export const updateAnimal = animals.update;
export const deleteAnimal = animals.remove;
