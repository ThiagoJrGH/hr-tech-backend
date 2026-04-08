import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AiService } from "./ai.service";
import { AiInsightsResponse } from "./dto/aiInsights.dto";

export class AiController {
  private readonly aiService: AiService;

  constructor(aiService: AiService) {
    this.aiService = aiService;
  }

  public getInsights = async (req: Request, res: Response<AiInsightsResponse>): Promise<void> => {
    // 🌍 Leemos el idioma de la URL (ej: ?lang=en). Por defecto usamos 'es'.
    const lang = (req.query.lang as string) || 'es';
    
    // Le pasamos el idioma al servicio
    const insights = await this.aiService.getInsights(lang);
    
    res.status(StatusCodes.OK).json(insights);
  };
}