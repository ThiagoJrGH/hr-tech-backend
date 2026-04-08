import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { DashboardService, DashboardStatsResponse } from "./dashboard.service";

export class DashboardController {
  private readonly dashboardService: DashboardService;

  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService;
  }

  public getStats = async (_req: Request, res: Response<DashboardStatsResponse>): Promise<void> => {
    const stats = await this.dashboardService.getStats();
    res.status(StatusCodes.OK).json(stats);
  };
}