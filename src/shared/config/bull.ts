const bullConfig = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT) ?? 6379,
  password: process.env.REDIS_PASS ?? undefined,
}

export default bullConfig
