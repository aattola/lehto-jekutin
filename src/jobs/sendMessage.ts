// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import fetch from 'node-fetch'
import { Worker, Job } from 'bullmq'
import { connection } from '../redis'
async function registerWorker() {
  new Worker(
    'sendMessage',
    async (job: Job) => {
      await job.log(`Viesti ${job.data.message}`)
      // const res = await fetch(`${process.env.SALAINEN_OSOITE}&message=${job.data.message}`)
      // const data = await res.json()
      await job.updateProgress(100)

      console.log('oon tää kissa')

      return 'data'
    },
    {
      connection
    }
  )
}

export { registerWorker }
