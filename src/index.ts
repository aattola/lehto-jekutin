// import Bree from 'bree'
import { startServer } from './server'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// import { getAgenda } from './agenda'
dotenv.config()

const main = async () => {
  console.log('trolling shall commence')
  await startServer()

  // void getAgenda()
}

void main()
