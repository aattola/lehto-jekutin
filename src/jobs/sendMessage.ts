import { got } from 'got'
import { workerData } from 'worker_threads'

async function sendMessage(message: string) {
  await got.get(`https://lukkari.jeffe.co/api/wilma/jekutalehtoa?p=${message}`).json()
  process.exit(0)
}

// void sendMessage(workerData.message)
console.log('muista ottaa komnetit pois')
