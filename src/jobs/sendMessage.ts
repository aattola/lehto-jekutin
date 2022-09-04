import fetch from 'node-fetch'
import { workerData } from 'worker_threads'

async function sendMessage(message: string) {
  await fetch(`https://lukkari.jeffe.co/api/wilma/jekutalehtoa?p=${message}`)
  process.exit(0)
}

// void sendMessage(workerData.message)
console.log('muista ottaa komnetit pois')
