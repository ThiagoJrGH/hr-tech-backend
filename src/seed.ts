import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"; // Si aquí te marca error, cámbialo a "bcryptjs"

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando la siembra de datos...");

  // 1. Encriptamos la contraseña "Admin123!"
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash("Admin123!", saltRounds);

  // 2. Creamos al usuario en la base de datos
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@empresa.com",
      passwordHash: passwordHash,
      role: "ADMIN",
    },
  });

  console.log("✅ ¡Administrador creado con éxito!");
  console.log(`📧 Email: ${adminUser.email}`);
  console.log(`🔑 Contraseña: Admin123!`);
}

main()
  .catch((e) => {
    console.error("❌ Error al sembrar la base de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });