// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import fetch from 'node-fetch'
import { Worker, Job } from 'bullmq'
import { connection } from '../redis'
import axios from 'axios'
import { format } from 'date-fns'
async function registerWorker() {
  new Worker(
    'sendMessage',
    async (job: Job) => {
      await job.log(`Viesti ${job.data.message}`)

      let viesti = job.data.message
      if (job.data.message.includes('{{ruoka}}')) {
        await job.log(`Viestistä löytyi {{ruoka}}`)
        const meals = await axios.get('https://lukkari.jeffe.co/api/meals')
        const hassuCustomTimestampKiitosJamixOY = format(new Date(), 'yyyyMMdd')
        await job.updateProgress(50)

        const today = meals.data.meals.filter(
          (meal: { date: string }) => meal.date == hassuCustomTimestampKiitosJamixOY
        )[0]

        if (today) {
          const ruoka = today.mealoptions[0].menuItems[0].name
          viesti = viesti.replace('{{ruoka}}', ruoka)
          await job.log(`Replace {{ruoka}} => ${ruoka}`)
        }
      }

      const res = await fetch(`${process.env.SALAINEN_OSOITE}&message=${viesti}`)
      const data = await res.json()
      await job.updateProgress(100)

      return data
    },
    {
      connection
    }
  )
}

export { registerWorker }
