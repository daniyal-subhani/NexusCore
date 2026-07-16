import type { ZodObject, ZodRawShape } from 'zod';
// zodrawshape === means ke iske ander  hamesha key-value pairs(object shape) hi ayegi, jaha key string hogi or value koi zod schema (jaise: a.string(), z.number())hogi.  
// zodobject === ye explicit object hota hai means ke ye ensure kerta he ke parameter/data object ki form me hi hona chahiye object ke ilawa kisi or datatype ko accept hi nahi kerna ?

interface EnvOptions {
  source?: NodeJS.ProcessEnv;
  // ye source hai means ke hum function ko kya dene wale hain, means ke hun source ko env ka data jese port = 3000 dene wale hain, but hum us se pehla isko types ker rahe hain ke Nodejs.processEnv hi honi chahiye type.
  serviceName?: string;
  // ye wo service hai jo is function ko use ker rahi hai like: auth, user, chat, notification
}
// TSchema kya he === ye aik generic variable(placeholder hai). bilkul mathematics ke variable x ki terha. iski apni koi fixed type nahi hoti, jo type tum isko do gay ye wohi ban jaega.
type Env<TSchema extends ZodRawShape> = ZodObject<TSchema>['_output'];
// extends ZodRawShape === ye TS ko rokta hai, or kehta hia: Bhai TSchema mein tum kuch b pass kro, lekin wo lazmi aik ZodRawShape(aik object jisme zod types ho) hona chahiye. Tum yahan direct number ya string pass nahi ker sakte.
// Assign kisko ho rha he or _output kya he === hum aik new utility type bna rahe hain jiska name he Env
// ZodObject<TSchema>['_output']  means: zod achema jab final parse/validation complete ker lega, to uske baad jo clean aur correct type return hogi, wo type utha kar Env ko assign kar do.
export const createEnv = <TSchema extends ZodRawShape>(
  // yaha humne tschema extends zod raw shape dubara q likha?
  // or yha schema or options kya hian??
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
