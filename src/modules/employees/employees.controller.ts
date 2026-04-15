import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { EmployeesService } from "./employees.service";
import { CreateEmployeeInput, EmployeeOutput, updateEmployeeSchema } from "./dto/createEmployee.schema";
import { ListEmployeesQueryInput, ListEmployeesResponse } from "./dto/listEmployeesQuery.schema";
import { AppError } from "../../shared/errors/AppError";

export class EmployeesController {
  private readonly employeesService: EmployeesService;

  constructor(employeesService: EmployeesService) {
    this.employeesService = employeesService;
  }

  public createEmployee = async (req: Request, res: Response<EmployeeOutput>): Promise<void> => {
    const payload = req.body as CreateEmployeeInput;
    const employee = await this.employeesService.createEmployee(payload);
    res.status(StatusCodes.CREATED).json(employee);
  };

  public listEmployees = async (
    req: Request<Record<string, string>, ListEmployeesResponse, unknown, ListEmployeesQueryInput>,
    res: Response<ListEmployeesResponse>
  ): Promise<void> => {
    const query = req.query;
    const result = await this.employeesService.listEmployees(query);
    res.status(StatusCodes.OK).json(result);
  };


  public updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new AppError("ID de empleado inválido", 400);

      const updated = await this.employeesService.updateEmployee(id, req.body);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  public deleteEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw new AppError("ID de empleado inválido", 400);

      await this.employeesService.deleteEmployee(id);
      res.status(200).json({ message: "Empleado eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  };
}