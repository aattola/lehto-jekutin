import fetch from 'node-fetch'
import { Agenda, Job } from '@hokify/agenda'

function initSendMessage(agenda: Agenda) {
  agenda.define('sendMessage', async (job: Job, done) => {
    console.log(job.attrs.data?.message)
    const res = await fetch('https://api.jeffe.co/projects')
    await res.json()
    return done()
  })
}

export { initSendMessage }
