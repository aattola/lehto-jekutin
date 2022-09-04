import Bree from 'bree'
import path from 'path'
import { startServer } from './server'

const main = async () => {
  console.log('trolling shall commence')

  const bree = new Bree({
    root: path.resolve('dist', 'jobs'),
    defaultExtension: 'js',
    jobs: [
      {
        name: 'sendMessage',
        interval: 'every 50 days',
        worker: {
          workerData: {
            message: 'jekutus 2000'
          }
        }
      }
    ]
  })

  await bree.start()
}

void main()
startServer()
