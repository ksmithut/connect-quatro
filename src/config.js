import { z } from 'zod'

/**
 * @typedef {z.infer<configSchema>} Config
 */

export const configSchema = z.object({
  port: z
    .number()
    .min(1)
    .max(65535),
  cookieSecrets: z.array(z.string()),
  mongoURL: z.string().url()
})

const envSchema = z
  .object({
    PORT: z.string(),
    COOKIE_SECRETS: z.string(),
    MONGO_URL: z.string().url()
  })
  .transform(env =>
    configSchema.parse({
      port: Number(env.PORT),
      cookieSecrets: env.COOKIE_SECRETS.split(' '),
      mongoURL: env.MONGO_URL
    })
  )

/**
 * @param {NodeJS.ProcessEnv} env
 */
export function parseConfigFromEnv (env) {
  const result = envSchema.safeParse(env)
  if (result.success === true) return result.data
  console.log(result.error)
  throw result.error
}
