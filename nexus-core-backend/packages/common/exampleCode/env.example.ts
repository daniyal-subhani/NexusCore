import { z } from 'zod';
import type { ZodRawShape, ZodObject } from 'zod';

//1. Arguments ki types define ki
interface EnvSecretArgs {
  dataKiTypeKonsiHogi?: NodeJS.ProcessEnv;
  konsiServiceUseKarRahiHai?: string;
}

//2. Apni custom output type banayi jo modern standards ke mutabiq hai
type EnvOutput<TSchema extends ZodRawShape> = z.output<ZodObject<TSchema>>;

//3. Main Function jo validation karega
export const createEnvFileSchema = <TSchema extends ZodRawShape>(
  envData: TSchema, // Tumhara key-value blueprint (ZodRawShape)
  joAyegaUskiValue: EnvSecretArgs = {}, // Options argument, default khali object
): EnvOutput<TSchema> => {
  // Destructure kiya aur default values set keen
  const { dataKiTypeKonsiHogi = process.env, konsiServiceUseKarRahiHai = 'unknown-service' } =
    joAyegaUskiValue;
  // Raw Shape(blueprint) ko ZodObject (validator machine) mein convert kiya
  const schemaValidator = z.object(envData);

  // Data ko check/parse kiya
  const result = schemaValidator.safeParse(dataKiTypeKonsiHogi);
  // Ager fail hua to error throw karo
  if (!result.success) {
    const formattedErrors = result.error.format();
    console.error(`\n [${konsiServiceUseKarRahiHai}] Env validation fail ho gayi hai!\n`);
    console.error(formattedErrors);

    throw new Error(`[${konsiServiceUseKarRahiHai}] sahi environment variables nahi mile.`);
  }
  // Ager pass ho gaya to typed data return karo
  return result.data;
};
