import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { EmployeesService } from "./employees.service";
import { CreateEmployeeInput, EmployeeOutput } from "./dto/createEmployee.schema";
import { ListEmployeesQueryInput, ListEmployeesResponse } from "./dto/listEmployeesQuery.schema";

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
}