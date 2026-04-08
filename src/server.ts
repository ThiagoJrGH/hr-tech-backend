import { app } from "./app";
import { env } from "./config/env";

const server = app.listen(env.port, () => {
  const startedAt = new Date().toISOString();
  process.stdout.write(`HR Tech Backend escuchando en puerto ${env.port} | ${startedAt}\n`);
});

const shutdown = (signal: NodeJS.Signals): void => {
  process.stdout.write(`Señal recibida: ${signal}. Iniciando apagado controlado.\n`);
  server.close((error?: Error) => {
    if (error) {
      process.stderr.write(`Error al cerrar el servidor: ${error.message}\n`);
      process.exit(1);
      return;
    }
    process.stdout.write("Servidor detenido correctamente.\n");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (error: Error) => {
  process.stderr.write(`uncaughtException: ${error.message}\n`);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : "Promesa rechazada sin detalle";
  process.stderr.write(`unhandledRejection: ${message}\n`);
  process.exit(1);
});