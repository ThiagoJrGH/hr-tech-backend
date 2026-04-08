import { Employee, PrismaClient } from "@prisma/client";
import { CreateEmployeeInput, EmployeeOutput } from "./dto/createEmployee.schema";
import { ListEmployeesQueryInput, ListEmployeesResponse } from "./dto/listEmployeesQuery.schema";

type EmployeeSortBy = "hire_date" | "base_salary" | "performance_rating" | "last_name";
type SortOrder = "asc" | "desc";

export class EmployeesService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async createEmployee(payload: CreateEmployeeInput): Promise<EmployeeOutput> {
    const createdEmployee = await this.prisma.employee.create({
      data: {
        firstName: payload.first_name.trim(),
        lastName: payload.last_name.trim(),
        department: payload.department.trim(),
        position: payload.position.trim(),
        baseSalary: payload.base_salary,
        hireDate: new Date(payload.hire_date),
        performanceRating: payload.performance_rating
      }
    });

    return this.mapEmployeeToOutput(createdEmployee);
  }

  public async listEmployees(query: ListEmployeesQueryInput): Promise<ListEmployeesResponse> {
    const page = query.page;
    const pageSize = query.page_size;
    const skip = (page - 1) * pageSize;

    const whereClause = {
      department: query.department
        ? {
            equals: query.department.trim(),
            mode: "insensitive" as const
          }
        : undefined,
      position: query.position
        ? {
            equals: query.position.trim(),
            mode: "insensitive" as const
          }
        : undefined
    };

    const orderByClause = this.mapSortToPrisma(query.sort_by, query.sort_order);

    const [employees, totalItems] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        orderBy: orderByClause
      }),
      this.prisma.employee.count({
        where: whereClause
      })
    ]);

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);

    return {
      data: employees.map((employee) => this.mapEmployeeToOutput(employee)),
      meta: {
        page,
        page_size: pageSize,
        total_items: totalItems,
        total_pages: totalPages
      }
    };
  }

  private mapSortToPrisma(sortBy: EmployeeSortBy, sortOrder: SortOrder): Record<string, SortOrder> {
    if (sortBy === "hire_date") {
      return { hireDate: sortOrder };
    }

    if (sortBy === "base_salary") {
      return { baseSalary: sortOrder };
    }

    if (sortBy === "performance_rating") {
      return { performanceRating: sortOrder };
    }

    return { lastName: sortOrder };
  }

  private mapEmployeeToOutput(employee: Employee): EmployeeOutput {
    return {
      id: employee.id,
      first_name: employee.firstName,
      last_name: employee.lastName,
      department: employee.department,
      position: employee.position,
      base_salary: Number(employee.baseSalary),
      hire_date: employee.hireDate.toISOString().split("T")[0] as string,
      performance_rating: employee.performanceRating
    };
  }
}