import type { ZodObject, ZodRawShape } from 'zod';

interface EnvOptions {
  source?: NodeJS.ProcessEnv;
  serviceName?: string;
}

type Env<TSchema extends ZodRawShape> = ZodObject<TSchema>['_output'];

export const createEnv = <TSchema extends ZodRawShape>(
  schema: ZodObject<TSchema>,
  options: EnvOptions = {},
): Env<TSchema> => {
  const { source = process.env, serviceName = 'service' } = options;
  const result = schema.safeParse(source);

  if (!result.success) {
    const formetErrors = result.error.format();
    console.error(`\n [${serviceName}] Environment validation failed.\n`);
    console.error(formetErrors);

    throw new Error(`[${serviceName}] Invalid environment variables.`);
  }
  return result.data;
};
