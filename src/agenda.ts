import { Agenda } from '@hokify/agenda'
import { initSendMessage } from './jobs/sendMessage'

let agendaTemp: Agenda | undefined
async function getAgenda() {
  if (agendaTemp) return agendaTemp
  const agenda = new Agenda({ db: { address: process.env.MONGO_URL || '' } })

  initSendMessage(agenda)
  await agenda.start()

  agendaTemp = agenda
  return agenda
}

export { getAgenda }
