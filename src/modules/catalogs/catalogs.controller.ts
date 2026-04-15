import { Request, Response, NextFunction } from "express";
import { CatalogsService } from "./catalogs.service";

export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  public getCatalog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const catalog = await this.catalogsService.getFullCatalog();
      res.status(200).json({ data: catalog });
    } catch (error) {
      next(error);
    }
  };

  public createDepartment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newDepartment = await this.catalogsService.createDepartmentWithPositions(req.body);
      res.status(201).json(newDepartment);
    } catch (error) {
      next(error);
    }
  };
}