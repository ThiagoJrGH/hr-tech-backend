import { PrismaClient } from "@prisma/client";
import { AppError } from "../../shared/errors/AppError";
import { CreateDepartmentInput } from "./dto/createDepartment.schema";

export class CatalogsService {
  constructor(private readonly prisma: PrismaClient) {}

  // Obtiene todo el árbol para el Frontend
  public async getFullCatalog() {
    return await this.prisma.department.findMany({
      include: {
        positions: true // Trae los cargos anidados
      },
      orderBy: { name: 'asc' }
    });
  }

  // Crea Departamento y Cargos al mismo tiempo
  public async createDepartmentWithPositions(data: CreateDepartmentInput) {
    const existing = await this.prisma.department.findUnique({
      where: { name: data.name }
    });

    if (existing) {
      throw new AppError("Ya existe un departamento con ese nombre", 400);
    }

    // Prisma hace la magia de crear el padre y los hijos juntos
    return await this.prisma.department.create({
      data: {
        name: data.name,
        positions: {
          create: data.positions.map(posName => ({
            name: posName
          }))
        }
      },
      include: {
        positions: true
      }
    });
  }
}