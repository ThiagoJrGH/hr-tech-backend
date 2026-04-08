import { z } from "zod";

export const aiDepartmentInsightSchema = z.object({
  department: z.string().min(1),
  salary_equity_assessment: z.enum(["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK"]),
  performance_alignment: z.enum(["ALIGNED", "PARTIALLY_ALIGNED", "MISALIGNED"]),
  recommendations: z.array(z.string().min(1)).min(1)
});

export const aiInsightsResponseSchema = z.object({
  global_summary: z.string().min(1),
  budget_optimization_actions: z.array(z.string().min(1)).min(1),
  departments: z.array(aiDepartmentInsightSchema).min(1)
});

export type AiDepartmentInsight = z.infer<typeof aiDepartmentInsightSchema>;
export type AiInsightsResponse = z.infer<typeof aiInsightsResponseSchema>;