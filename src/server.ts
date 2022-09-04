import fastify from 'fastify'
import next from 'next'
import { parse } from 'url'
import { z } from 'zod'
import { getAgenda } from './agenda'

const Tallenna = z.object({
  intervalText: z.string().min(1),
  toistuva: z.enum(['toistuva', 'eitoistuva', 'nyt']),
  viesti: z.string().min(1)
})

const Id = z.object({
  id: z.string()
})

async function startServer() {
  const agenda = await getAgenda()
  const app = next({ dev: process.env.NODE_ENV !== 'production' })
  const handle = app.getRequestHandler()
  const server = fastify()
  await app.prepare()

  server.post('/api/tallenna', async (req, reply) => {
    const res = Tallenna.safeParse(req.body)

    if (!res.success) {
      void reply.status(400)
      return { ...res.error }
    }

    if (res.data.toistuva === 'nyt') {
      await agenda.now('sendMessage', { message: res.data.viesti })
    }

    if (res.data.toistuva === 'eitoistuva') {
      await agenda.schedule(res.data.intervalText, 'sendMessage', { message: res.data.viesti })
    }

    if (res.data.toistuva === 'toistuva') {
      await agenda.every(res.data.intervalText, 'sendMessage', { message: res.data.viesti })
    }

    return {
      message: 'success',
      toistuva: res.data.toistuva
    }
  })

  server.get('/api/jobs', async () => {
    const jobs = await agenda.jobs()

    return { jobs: jobs.map((a) => a.toJson()) }
  })

  server.post('/api/purge', async () => {
    const count = await agenda.purge()

    return { count }
  })

  server.post('/api/cancel', async (req, reply) => {
    const res = Id.safeParse(req.body)
    if (!res.success) {
      void reply.status(400)
      return { ...res.error }
    }
    const count = await agenda.cancel({ _id: res.data.id as any })

    return { count }
  })

  server.post('/api/start', async () => {
    const started = await agenda.start()

    return { started }
  })

  server.post('/api/stop', async () => {
    const stopped = await agenda.stop()

    return { stopped }
  })

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
