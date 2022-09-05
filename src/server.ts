import fastify from 'fastify'
import next from 'next'
import { parse } from 'url'
import { z } from 'zod'
import { Job, Queue, QueueScheduler } from 'bullmq'
import humanInterval from 'human-interval'
import { registerWorker } from './jobs/sendMessage'
import { connection } from './redis'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { FastifyAdapter } from '@bull-board/fastify'
import { format } from 'date-fns'
import axios from 'axios'

const Tallenna = z.object({
  intervalText: z.string().min(1),
  toistuva: z.enum(['toistuva', 'eitoistuva', 'nyt']),
  viesti: z.string().min(1),
  cron: z.enum(['on', 'ei']),
  limit: z.number().min(1).max(5000)
})

const Id = z.object({
  id: z.string()
})

async function startServer() {
  const messageQueue = new Queue('sendMessage', { connection })
  new QueueScheduler('sendMessage', { connection })
  await registerWorker()

  const app = next({ dev: process.env.NODE_ENV !== 'production' })
  const handle = app.getRequestHandler()
  const server = fastify()
  await app.prepare()

  const serverAdapter = new FastifyAdapter()
  createBullBoard({
    queues: [new BullMQAdapter(messageQueue)],
    serverAdapter
  })

  serverAdapter.setBasePath('/admin')
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await server.register(serverAdapter.registerPlugin(), { prefix: '/admin' })

  server.post('/api/tallenna', async (req, reply) => {
    const res = Tallenna.safeParse(req.body)

    if (!res.success) {
      void reply.status(400)
      return { ...res.error }
    }
    const parsedMs = humanInterval(res.data.intervalText)
    let job
    let message = res.data.viesti

    const meals = await axios.get('https://lukkari.jeffe.co/api/meals')
    const hassuCustomTimestampKiitosJamixOY = format(new Date(), 'yyyyMMdd')

    const today = meals.data.meals.filter(
      (meal: { date: string }) => meal.date == hassuCustomTimestampKiitosJamixOY
    )[0]

    if (today) {
      const ruoka = today.mealoptions[0].menuItems[0].name
      message = message.replace('{{ruoka}}', ruoka)
    }

    if (res.data.toistuva === 'nyt') {
      job = await messageQueue.add('sendMessage', { message })
    }

    if (res.data.toistuva === 'eitoistuva') {
      job = await messageQueue.add('sendMessage', { message }, { delay: parsedMs })
    }

    if (res.data.toistuva === 'toistuva') {
      job = await messageQueue.add(
        'sendMessage',
        { message },
        res.data.cron == 'on'
          ? {
              repeat: {
                pattern: res.data.intervalText,
                limit: res.data.limit
              }
            }
          : {
              delay: parsedMs,
              repeat: {
                every: parsedMs,
                limit: res.data.limit
              }
            }
      )
    }

    return {
      message: 'success',
      job,
      toistuva: res.data.toistuva
    }
  })

  server.get('/api/jobs', async () => {
    const jobs = await messageQueue.getJobs()

    return { jobs: jobs }
  })
  //
  // server.post('/api/purge', async () => {
  //   const count = await agenda.purge()
  //
  //   return { count }
  // })
  //
  server.post('/api/cancel', async (req, reply) => {
    const res = Id.safeParse(req.body)
    if (!res.success) {
      void reply.status(400)
      return { ...res.error }
    }
    const job = await Job.fromId(messageQueue, res.data.id)
    if (!job) {
      void reply.status(400)
      return { error: 'notfound' }
    }
    const done = await job.remove()

    return { done }
  })
  //
  // server.post('/api/start', async () => {
  //   const started = await agenda.start()
  //
  //   return { started }
  // })
  //
  // server.post('/api/stop', async () => {
  //   const stopped = await agenda.stop()
  //
  //   return { stopped }
  // })

  server.all('*', (req, res) => {
    return handle(req.raw, res.raw, parse(req.url, true))
  })
  server
    .listen({
      port: (process.env.PORT as unknown as number) || 3001,
      host: '0.0.0.0'
    })
    .then(() => {
      console.log('server started')
    })
    .catch((err) => {
      console.log(err)
    })
}

export { startServer }
