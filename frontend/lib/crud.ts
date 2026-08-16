import { request, type Paginated } from "./api";

export function createCrudResource<T, TInput = Partial<T>>(baseUrl: string) {
  function list(url: string = baseUrl) {
    return request<Paginated<T>>(url);
  }

  async function listAll(url: string = baseUrl): Promise<T[]> {
    const all: T[] = [];
    let next: string | undefined = url;
    while (next) {
      const page = await list(next);
      all.push(...page.results);
      next = page.next ?? undefined;
    }
    return all;
  }

  function get(id: number) {
    return request<T>(`${baseUrl}${id}/`);
  }

  function create(data: TInput) {
    return request<T>(baseUrl, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  function update(id: number, data: TInput) {
    return request<T>(`${baseUrl}${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  function remove(id: number) {
    return request<void>(`${baseUrl}${id}/`, { method: "DELETE" });
  }

  return { list, listAll, get, create, update, remove };
}
