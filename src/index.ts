import { startServer } from './server'
import * as dotenv from 'dotenv'
import setTZ from 'set-tz'
dotenv.config()

setTZ('Europe/Helsinki')

const main = async () => {
  console.log('Trollaus alkakoon')
  await startServer()

  // void getAgenda()
}

void main()
