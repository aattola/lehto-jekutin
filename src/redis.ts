import * as dotenv from 'dotenv'
dotenv.config()

const connection = {
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  username: process.env.REDIS_USERNAME,
  port: 7333
}

export { connection }
