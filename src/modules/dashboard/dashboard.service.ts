import { PrismaClient } from "@prisma/client";

export interface DepartmentSalaryAverage {
  department: string;
  employees_count: number;
  average_salary: number;
  average_performance_rating: number;
  min_salary: number;
  max_salary: number;
}

export interface DashboardStatsResponse {
  total_employees: number;
  overall_average_salary: number;
  overall_average_performance_rating: number;
  by_department: DepartmentSalaryAverage[];
}

interface DepartmentAggregateRaw {
  department: string;
  employees_count: bigint | number;
  average_salary: number;
  average_performance_rating: number;
  min_salary: number;
  max_salary: number;
}

interface OverallAggregateRaw {
  total_employees: bigint | number;
  overall_average_salary: number | null;
  overall_average_performance_rating: number | null;
}

export class DashboardService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async getStats(): Promise<DashboardStatsResponse> {
    const [overallRows, departmentRows] = await Promise.all([
      this.prisma.$queryRaw<OverallAggregateRaw[]>`
        SELECT
          COUNT(1) AS total_employees,
          CAST(AVG(CAST(base_salary AS FLOAT)) AS FLOAT) AS overall_average_salary,
          CAST(AVG(CAST(performance_rating AS FLOAT)) AS FLOAT) AS overall_average_performance_rating
        FROM Employees
      `,
      this.prisma.$queryRaw<DepartmentAggregateRaw[]>`
        SELECT
          department,
          COUNT(1) AS employees_count,
          CAST(AVG(CAST(base_salary AS FLOAT)) AS FLOAT) AS average_salary,
          CAST(AVG(CAST(performance_rating AS FLOAT)) AS FLOAT) AS average_performance_rating,
          CAST(MIN(CAST(base_salary AS FLOAT)) AS FLOAT) AS min_salary,
          CAST(MAX(CAST(base_salary AS FLOAT)) AS FLOAT) AS max_salary
        FROM Employees
        GROUP BY department
        ORDER BY department ASC
      `
    ]);

    const overall = overallRows[0];

    const totalEmployees = overall ? Number(overall.total_employees) : 0;
    const overallAverageSalary = overall?.overall_average_salary ?? 0;
    const overallAveragePerformance = overall?.overall_average_performance_rating ?? 0;

    return {
      total_employees: totalEmployees,
      overall_average_salary: Number(overallAverageSalary),
      overall_average_performance_rating: Number(overallAveragePerformance),
      by_department: departmentRows.map((row) => ({
        department: row.department,
        employees_count: Number(row.employees_count),
        average_salary: Number(row.average_salary),
        average_performance_rating: Number(row.average_performance_rating),
        min_salary: Number(row.min_salary),
        max_salary: Number(row.max_salary)
      }))
    };
  }
}