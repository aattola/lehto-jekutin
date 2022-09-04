import React, { useState } from 'react'
import prettyMilliseconds from 'pretty-ms'
import humanInterval from 'human-interval'
import { format, formatDistance } from 'date-fns'
import { fi } from 'date-fns/locale'

import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  ListItem,
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import LoadingButton from '@mui/lab/LoadingButton'
import styled from '@emotion/styled'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { intlFormat } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
`

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`

async function fetchList() {
  return (await axios.get('/api/jobs')).data
}

export default function Home() {
  const queryClient = useQueryClient()

  const [intervalText, setText] = useState('')
  const [value, setValue] = useState('toistuva')
  const [viesti, setViesti] = useState('')
  const lista = useQuery(['lista'], fetchList, { refetchInterval: 10000 })
  const mutation = useMutation(
    (newMessage: any) => {
      return axios.post('/api/tallenna', newMessage)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries(['lista'])
      }
    }
  )
  const cancelMutation = useMutation(
    (cancelParams: any) => {
      return axios.post('/api/cancel', cancelParams)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries(['lista'])
      }
    }
  )

  const purgeMutation = useMutation(
    (purgeParams: any) => {
      return axios.post('/api/purge', purgeParams)
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries(['lista'])
      }
    }
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value)
  }

  console.log(lista.data)
  // const parsedText = later.parse.text(intervalText)
  const parsedText = isNaN(humanInterval(intervalText) as number)
  const error = parsedText || intervalText === ''
  const submitError = parsedText || intervalText === '' || viesti === ''

  const timeZone = 'Europe/Helsinki'

  return (
    <Grid>
      <Flex>
        <h1>Jekuttaja2000</h1>

        <TextField
          error={error}
          type="text"
          value={intervalText}
          onChange={(e) => setText(e.target.value)}
          variant="filled"
          size="small"
          label="Cron tai teksti"
          helperText={
            !error && `Eli siis ${prettyMilliseconds(humanInterval(intervalText) || 0)} päästä`
          }
          sx={{ minWidth: 300 }}
        />

        <TextField
          error={viesti === ''}
          type="text"
          value={viesti}
          onChange={(e) => setViesti(e.target.value)}
          variant="outlined"
          multiline
          rows={4}
          label="Viesti joka lähetetään"
          sx={{ minWidth: 300 }}
        />

        <FormControl>
          <FormLabel id="demo-controlled-radio-buttons-group">Mitä on</FormLabel>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={value}
            onChange={handleChange}
            row
          >
            <FormControlLabel value="toistuva" control={<Radio />} label="Toistuva" />
            <FormControlLabel value="eitoistuva" control={<Radio />} label="Ei toistuva" />
            <FormControlLabel value="nyt" control={<Radio />} label="Suorita nyt" />
          </RadioGroup>
        </FormControl>

        <LoadingButton
          loading={mutation.isLoading}
          variant="contained"
          disabled={submitError}
          onClick={() =>
            mutation.mutate({
              intervalText,
              toistuva: value,
              viesti
            })
          }
        >
          Tallenna
        </LoadingButton>
      </Flex>

      <div>
        {lista.data?.jobs.map((item: any) => (
          <Accordion key={item._id}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1bh-content"
              id="panel1bh-header"
            >
              <Typography sx={{ width: '33%', flexShrink: 0 }}>
                {item.name} {item.type && `(${item.type})`} {item.repeatInterval && `(repeat)`}{' '}
                {item.nextRunAt === null && '(stale)'}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                {item.failCount > 0 && 'Epäonnistuu!'} {item.nextRunAt}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {item.failCount > 0 && (
                <Flex>
                  <Typography>
                    Syy epäonnistumiseen: <code>{JSON.stringify(item.failReason)}</code>
                  </Typography>
                  <Typography>
                    Epäonnistui viimeksi{' '}
                    {format(
                      utcToZonedTime(new Date(item.failedAt), timeZone),
                      'HH.mm EEEE d. MMMM y',
                      {
                        locale: fi
                      }
                    )}
                  </Typography>
                  <Typography>Epäonnistunut {item.failCount} kertaa</Typography>
                  <Typography>
                    Yritetään uudestaan{' '}
                    {formatDistance(new Date(item.nextRunAt), new Date(), { locale: fi })} (
                    {format(utcToZonedTime(new Date(item.nextRunAt), timeZone), 'HH.mm ss EEEE', {
                      locale: fi
                    })}
                    )
                  </Typography>
                </Flex>
              )}
              <Typography>
                Suoriutuu seuraavan kerran:{' '}
                {format(utcToZonedTime(new Date(item.nextRunAt), timeZone), 'HH.mm ss EEEE', {
                  locale: fi
                })}
              </Typography>
              <Button
                size="small"
                color="warning"
                onClick={() => cancelMutation.mutate({ id: item._id })}
              >
                Peruuta
              </Button>
              {item.failCount > 0 && 'Epäonnistuu!'} {item._id}
            </AccordionDetails>
          </Accordion>
        ))}

        <div style={{ marginTop: 10 }}>
          <Button onClick={() => purgeMutation.mutate()} variant="outlined">
            Purge
          </Button>
        </div>
      </div>
    </Grid>
  )
}
