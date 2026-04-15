import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "El nombre del departamento debe tener al menos 2 caracteres"),
  positions: z.array(z.string().min(2, "El nombre del cargo debe tener al menos 2 caracteres"))
    .min(1, "Debes incluir al menos 1 cargo para crear el departamento")
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;