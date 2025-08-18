// scripts/seed-mom-template.ts
import { prisma } from "@/lib/prisma";
async function main() {
  await prisma.moMTemplate.create({
    data: {
      name: "Default MoM",
      body: `# Minutes of Meeting
- **Project**: {{project}}
- **Task**: {{task}} ({{wbs}})
- **Date**: {{date}}

## Attendees
- ...

## Agenda
1. ...
2. ...

## Notes
- ...

## Action Items
- Owner – Item – Due Date`,
    },
  });
  console.log("Seeded MoM template");
}
main();
