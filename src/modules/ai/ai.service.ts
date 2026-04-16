import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/AppError";
import { aiInsightsResponseSchema, AiInsightsResponse } from "./dto/aiInsights.dto";

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

interface AggregatedPayload {
  generated_at_utc: string;
  total_employees: number;
  overall_average_salary: number;
  overall_average_performance_rating: number;
  by_department: Array<{
    department: string;
    employees_count: number;
    average_salary: number;
    average_performance_rating: number;
    min_salary: number;
    max_salary: number;
    salary_range: number;
  }>;
}

export class AiService {
  private readonly prisma: PrismaClient;
  private readonly geminiClient: GoogleGenerativeAI;
  private readonly geminiModel: GenerativeModel;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.geminiClient = new GoogleGenerativeAI(env.geminiApiKey);
    this.geminiModel = this.geminiClient.getGenerativeModel({
      model: env.geminiModel
    });
  }

  // 🌍 Ahora recibe el parámetro lang
  public async getInsights(lang: string = 'es'): Promise<AiInsightsResponse> {
    const payload = await this.buildAggregatedPayload();

    if (payload.total_employees === 0 || payload.by_department.length === 0) {
      throw new AppError("No hay datos suficientes para generar insights", 404);
    }

    // Le pasamos el idioma al constructor de instrucciones
    const systemInstruction = this.buildSystemInstruction(lang);
    const userPrompt = this.buildUserPrompt(payload);

    const modelResponse = await this.callGeminiWithTimeout(systemInstruction, userPrompt, env.geminiTimeoutMs);
    const jsonText = this.extractJsonText(modelResponse);
    const parsedJson = this.parseJsonResponse(jsonText);

    return parsedJson;
  }

  private async buildAggregatedPayload(): Promise<AggregatedPayload> {
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
    const overallAveragePerformanceRating = overall?.overall_average_performance_rating ?? 0;

    const byDepartment = departmentRows.map((row) => {
      const minSalary = Number(row.min_salary);
      const maxSalary = Number(row.max_salary);
      return {
        department: row.department,
        employees_count: Number(row.employees_count),
        average_salary: Number(row.average_salary),
        average_performance_rating: Number(row.average_performance_rating),
        min_salary: minSalary,
        max_salary: maxSalary,
        salary_range: maxSalary - minSalary
      };
    });

    return {
      generated_at_utc: new Date().toISOString(),
      total_employees: totalEmployees,
      overall_average_salary: Number(overallAverageSalary),
      overall_average_performance_rating: Number(overallAveragePerformanceRating),
      by_department: byDepartment
    };
  }

  // 🌍 MAGIA SENIOR: Inyección dinámica de idioma en el Prompt de IA
  private buildSystemInstruction(lang: string): string {
    const languageName = lang.toLowerCase() === 'en' ? 'English' : 'Spanish';

    return [
      "You are a Senior HR Compensation Consultant specialized in Spain labor market practices.",
      "You must analyze salary equity, compensation fairness and performance-to-pay alignment.",
      "Respond only with strict JSON.",
      "Do not include markdown, code fences or extra commentary.",
      `CRITICAL REQUIREMENT: All generated text values inside the JSON (like global_summary, recommendations, actions) MUST be written strictly in ${languageName}.`,
      "Expected JSON shape:",
      "{",
      "\"global_summary\": \"string\",",
      "\"budget_optimization_actions\": [\"string\"],",
      "\"departments\": [",
      "{",
      "\"department\": \"string\",",
      "\"salary_equity_assessment\": \"LOW_RISK|MEDIUM_RISK|HIGH_RISK\",",
      "\"performance_alignment\": \"ALIGNED|PARTIALLY_ALIGNED|MISALIGNED\",",
      "\"recommendations\": [\"string\"]",
      "}",
      "]",
      "}"
    ].join("\n");
  }

  private buildUserPrompt(payload: AggregatedPayload): string {
    const serialized = JSON.stringify(payload, null, 2);
    return [
      "Analyze this HR dataset and provide salary equity and budget optimization insights.",
      "Data:",
      serialized
    ].join("\n");
  }

  private async callGeminiWithTimeout(systemInstruction: string, userPrompt: string, timeoutMs: number): Promise<string> {
    const generationPromise = this.geminiModel.generateContent({
      systemInstruction: {
        role: "system",
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(new AppError("Timeout al invocar Gemini", 504));
      }, timeoutMs);
    });

    let resultText = "";
    try {
      const result = await Promise.race([generationPromise, timeoutPromise]);
      const response = result.response;
      resultText = response.text();
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new AppError("Error al invocar Gemini", 502, { cause: error.message });
      }

      throw new AppError("Error al invocar Gemini", 502);
    }

    if (resultText.trim().length === 0) {
      throw new AppError("Gemini devolvió una respuesta vacía", 502);
    }

    return resultText;
  }

  private extractJsonText(rawText: string): string {
    const trimmed = rawText.trim();

    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return trimmed;
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return trimmed.slice(firstBrace, lastBrace + 1);
    }

    console.error("[AI] Gemini raw response (no JSON found):", rawText.slice(0, 500));
    throw new AppError("La respuesta de Gemini no contiene JSON válido", 502);
  }

  private parseJsonResponse(jsonText: string): AiInsightsResponse {
    let parsedUnknown: unknown;

    try {
      parsedUnknown = JSON.parse(jsonText);
    } catch (error: unknown) {
      console.error("[AI] Failed to parse JSON. First 500 chars:", jsonText.slice(0, 500));
      console.error("[AI] Last 200 chars:", jsonText.slice(-200));
      if (error instanceof Error) {
        throw new AppError("No se pudo parsear el JSON de Gemini", 502, { cause: error.message });
      }
      throw new AppError("No se pudo parsear el JSON de Gemini", 502);
    }

    const validated = aiInsightsResponseSchema.safeParse(parsedUnknown);

    if (!validated.success) {
      throw new AppError("El JSON de Gemini no cumple el contrato esperado", 502, {
        issues: validated.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    return validated.data;
  }
}