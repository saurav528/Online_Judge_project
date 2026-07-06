export default {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://mock:mock@localhost:5432/mock?schema=public",
  },
};
