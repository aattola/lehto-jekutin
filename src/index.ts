import { startServer } from './server'
import * as dotenv from 'dotenv'
dotenv.config()

const main = async () => {
  console.log('Trollaus alkakoon')
  await startServer()

  // void getAgenda()
}

void main()
