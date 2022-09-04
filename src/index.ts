import Bree from 'bree'
import path from 'path'

// import later from '@breejs/later'

// console.log(later.parse.text('at 12:15 am'))

const main = async () => {
  console.log('trolling shall commence')

  const bree = new Bree({
    root: path.resolve('dist', 'jobs'),
    defaultExtension: 'mjs',
    jobs: [
      {
        name: 'sendMessage',
        interval: 'every 555 seconds',
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
