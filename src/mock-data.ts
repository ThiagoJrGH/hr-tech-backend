import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listas de nombres para combinar al azar
const firstNames = ["Ana", "Carlos", "Elena", "David", "Lucía", "Jorge", "María", "Pedro", "Sofía", "Diego", "Carmen", "Alejandro", "Valentina", "Manuel", "Isabella", "Thiago", "Camila", "Mateo", "Valeria", "Leonardo"];
const lastNames = ["García", "Martínez", "López", "González", "Rodríguez", "Fernández", "Pérez", "Gómez", "Sánchez", "Díaz", "Torres", "Ramírez", "Ruiz", "Mendoza", "Flores", "Herrera", "Medina", "Castro", "Vargas", "Rojas"];

// Funciones utilitarias
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function main() {
  console.log("⏳ Iniciando la clonación de empleados...");

  // 1. Obtener tus departamentos y cargos reales de la base de datos
  const departments = await prisma.department.findMany({
    include: { positions: true }
  });

  if (departments.length === 0) {
    console.error("❌ No hay departamentos en la BD. ¡Crea algunos en el Frontend primero!");
    return;
  }

  // 2. Fabricar exactamente 50 empleados aleatorios
  const employeesToCreate = [];
  let creados = 0;
  
  while (creados < 60) {
    const dpto = departments[randomInt(0, departments.length - 1)]!;
    if (!dpto.positions || dpto.positions.length === 0) continue;
    
    const cargo = dpto.positions[randomInt(0, dpto.positions.length - 1)]!;

    employeesToCreate.push({
      firstName: firstNames[randomInt(0, firstNames.length - 1)]!,
      lastName: lastNames[randomInt(0, lastNames.length - 1)]!,
      department: dpto.name,
      position: cargo.name,
      baseSalary: randomInt(40000, 120000),
      hireDate: randomDate(new Date(2018, 0, 1), new Date()),
      performanceRating: randomInt(2, 5)
    });
    
    creados++; // Solo sumamos cuando la creación es exitosa
  }

  // 3. Insertar todo de golpe en SQL Server
  await prisma.employee.createMany({
    data: employeesToCreate
  });

  console.log(`✅ ¡MAGIA PURA! Se insertaron ${employeesToCreate.length} empleados aleatorios.`);
}

main()
  .catch((e) => {
    console.error("❌ Error en el script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });