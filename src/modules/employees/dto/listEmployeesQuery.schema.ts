import { z } from "zod";

export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int("page debe ser entero").min(1, "page mínimo es 1").default(1),
  page_size: z.coerce.number().int("page_size debe ser entero").min(1, "page_size mínimo es 1").max(100, "page_size máximo es 100").default(10),
  department: z.string().trim().min(1).max(120).optional(),
  position: z.string().trim().min(1).max(120).optional(),
  sort_by: z.enum(["hire_date", "base_salary", "performance_rating", "last_name"]).default("hire_date"),
  sort_order: z.enum(["asc", "desc"]).default("desc")
});

export type ListEmployeesQueryInput = z.infer<typeof listEmployeesQuerySchema>;

export interface ListEmployeesMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface ListEmployeesResponse {
  data: Array<{
    id: number;
    first_name: string;
    last_name: string;
    department: string;
    position: string;
    base_salary: number;
    hire_date: string;
    performance_rating: number;
  }>;
  meta: ListEmployeesMeta;
}