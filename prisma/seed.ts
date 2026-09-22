import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_PASSWORD;

  if (!email || !password) {
    throw new Error("Defina SEED_EMAIL e SEED_PASSWORD antes de executar npm run seed.");
  }

  if (password.length < 8) {
    throw new Error("SEED_PASSWORD deve ter pelo menos 8 caracteres.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "NullShell User" }
  });

  console.log(`Usuário pronto: ${email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
