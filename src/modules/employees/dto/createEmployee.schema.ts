import { z } from "zod";

export const createEmployeeSchema = z.object({
  first_name: z.string().trim().min(2, "first_name debe tener al menos 2 caracteres").max(120, "first_name supera el máximo permitido"),
  last_name: z.string().trim().min(2, "last_name debe tener al menos 2 caracteres").max(120, "last_name supera el máximo permitido"),
  department: z.string().trim().min(2, "department debe tener al menos 2 caracteres").max(120, "department supera el máximo permitido"),
  position: z.string().trim().min(2, "position debe tener al menos 2 caracteres").max(120, "position supera el máximo permitido"),
  base_salary: z.coerce.number().positive("base_salary debe ser mayor que 0").max(999999999999.99, "base_salary supera el máximo permitido"),
  hire_date: z.string().date("hire_date debe tener formato YYYY-MM-DD"),
  performance_rating: z.coerce.number().int("performance_rating debe ser entero").min(1, "performance_rating mínimo es 1").max(5, "performance_rating máximo es 5")
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export interface EmployeeOutput {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
  position: string;
  base_salary: number;
  hire_date: string;
  performance_rating: number;
}