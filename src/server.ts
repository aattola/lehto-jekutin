import fastify from 'fastify'
import next from 'next'
import { parse } from 'url'

function startServer() {
  const app = next({ dev: process.env.NODE_ENV !== 'production' })
  const handle = app.getRequestHandler()
  const server = fastify()
  void app
    .prepare()
    .then(() => {
      server.post('/api/tallenna', async (req) => {
        console.log(req.body)

        return {
          message: 'test'
        }
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
          console.log('server started on port ' + (process.env.PORT as unknown as number) || 3001)
        })
    })
    .catch((err) => {
      console.log(err)
    })
}

export { startServer }
