import { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema.ts',
  out: './drizzle/local',
  dialect: 'sqlite',
  dbCredentials: {
    url: './local.db',
  },
} satisfies Config;