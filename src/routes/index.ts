import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { employeesRouter } from "../modules/employees/employees.routes";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes";
import { aiRouter } from "../modules/ai/ai.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/employees", employeesRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/ai", aiRouter);

export { apiRouter };