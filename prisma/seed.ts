import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando seed...");

  // Usuário owner inicial
  const passwordHash = await bcrypt.hash("admin123", 12);

  const owner = await prisma.user.upsert({
    where: { email: "admin@empresa.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@empresa.com",
      passwordHash,
      role: UserRole.owner,
      isActive: true,
    },
  });

  console.log("Usuário criado:", owner.email);

  // Categorias de serviço iniciais
  const categories = await Promise.all([
    prisma.serviceCategory.upsert({
      where: { id: "cat-desenvolvimento" },
      update: {},
      create: { id: "cat-desenvolvimento", name: "Desenvolvimento" },
    }),
    prisma.serviceCategory.upsert({
      where: { id: "cat-design" },
      update: {},
      create: { id: "cat-design", name: "Design" },
    }),
    prisma.serviceCategory.upsert({
      where: { id: "cat-consultoria" },
      update: {},
      create: { id: "cat-consultoria", name: "Consultoria" },
    }),
  ]);

  console.log("Categorias criadas:", categories.map((c) => c.name).join(", "));

  console.log("\nSeed concluído!");
  console.log("Login: admin@empresa.com");
  console.log("Senha: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
