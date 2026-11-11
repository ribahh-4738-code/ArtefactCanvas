import { prisma } from "../db/prisma.js";

const COMPANY_NAME = "___ Instituto";
const PROJECT_NAME = "White Grid";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Idempotent bootstrap used by `npm run seed` and API boot. */
export async function ensureSeedData() {
  let company = await prisma.company.findFirst({
    where: { name: COMPANY_NAME },
  });
  if (!company) {
    company = await prisma.company.create({
      data: { name: COMPANY_NAME },
    });
  }

  let project = await prisma.project.findFirst({
    where: { companyId: company.id, name: PROJECT_NAME },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        companyId: company.id,
        name: PROJECT_NAME,
        artefato: "ferramenta web",
        iniciativa: "buscar oportunidades (efetivo, freelancer e temporário)",
        aposta:
          "tempo de desenvolvimento ver CHANGELOG, um profissional, licença do Cursor",
        lastOpenedAt: new Date(),
        tasks: {
          create: [
            {
              title: "atualizar o Sólides",
              status: "IN_DEVELOPMENT",
              sortOrder: 0,
              instructions:
                "aguarde meus testes antes do commit commit tag e push / lembre-se de atualizar README, CHANGELOG e mova os plans para a pasta MDs",
            },
            {
              title: "usar essa organização para gerenciador de projetos",
              status: "NEXT",
              sortOrder: 0,
            },
            {
              title: "apenas para ilustrar",
              status: "NEXT",
              sortOrder: 1,
            },
            {
              title: "colocar freelas em uma aba...",
              status: "DONE",
              sortOrder: 0,
              completedAt: startOfDay(new Date(2026, 10, 10)),
            },
          ],
        },
      },
    });
  } else if (!project.lastOpenedAt) {
    await prisma.project.update({
      where: { id: project.id },
      data: { lastOpenedAt: new Date() },
    });
  }

  return { company, project };
}

async function main() {
  const result = await ensureSeedData();
  console.log(
    `Seed ok: company=${result.company.name} project=${result.project.name}`,
  );
}

const isDirect =
  process.argv[1]?.includes("seed.ts") || process.argv[1]?.includes("seed.js");

if (isDirect) {
  main()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
