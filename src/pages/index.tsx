import React, { useState } from 'react'
import prettyMilliseconds from 'pretty-ms'
import humanInterval from 'human-interval'
import {
  Alert,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import styled from '@emotion/styled'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import Head from 'next/head'
import { Cron } from 'react-js-cron'
import 'react-js-cron/dist/styles.css'

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100vh;
`

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`

const Paperi = styled(Paper)`
  && {
    margin: 15px 10px;
    padding: 15px;
    max-width: 420px;
  }
`

const PaperiIframelle = styled(Paper)`
  && {
    margin: 15px 10px;
  }
`

const LogoDiv = styled.div`
  display: flex;
  font-weight: 600;
  align-items: center;
  gap: 18px;
`

export default function Home() {
  const [value, setValue] = useState('toistuva')
  const [isCron, setIsCron] = useState('ei')
  const [viesti, setViesti] = useState('')
  const [cron, setCron] = useState('')
  const [limit, setLimit] = useState(1000)

  // const lista = useQuery(['lista'], fetchList, { refetchInterval: 10000 })
  const mutation = useMutation(
    (newMessage: any) => {
      return axios.post('/api/tallenna', newMessage)
    },
    {
      onSuccess: () => {
        setCron('')
        setValue('')
        setViesti('')
        setIsCron('ei')
      }
    }
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value)
  }

  const handleCronChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = (event.target as HTMLInputElement).value
    setIsCron(val)
    if (val === 'on') {
      setValue('toistuva')
    }
  }

  // const parsedText = later.parse.text(intervalText)
  const parsedText = isNaN(humanInterval(cron) as number)
  const error = isCron === 'on' ? false : parsedText
  const submitError = error || cron === '' || viesti === ''
  const mutationError = mutation.isError

  return (
    <div>
      <Head>
        <title>Jekuttaja2000 & Co</title>
      </Head>

      <Grid>
        <Paperi elevation={4} sx={{ borderRadius: 2, overflowY: 'scroll' }}>
          <Flex>
            <LogoDiv>
              <img
                src="https://jeffe.co/images/jeffeco/co.svg"
                alt="Logo"
                style={{ maxHeight: '20px', width: '40px' }}
              />
              <Typography fontSize={34} style={{ fontFamily: 'Poppins', fontWeight: 600 }}>
                Jekuttaja2000
              </Typography>
            </LogoDiv>

            {mutationError && (
              <Alert severity="error" style={{ maxWidth: 310 }}>
                Hei luonnissa tapahtui virhe tai jotain kannattaa korjata se nopeaa.
              </Alert>
            )}

            <TextField
              error={error}
              type="text"
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              variant="outlined"
              size="small"
              label="Cron tai teksti"
              helperText={
                !error && `Eli siis ${prettyMilliseconds(humanInterval(cron) || 0)} päästä`
              }
              sx={{ minWidth: 300 }}
            />

            {isCron == 'on' && <Cron value={cron} setValue={setCron} />}

            <TextField
              type="text"
              value={viesti}
              onChange={(e) => setViesti(e.target.value)}
              variant="outlined"
              multiline
              rows={4}
              label="Viesti joka lähetetään"
              helperText="{{ruoka}} listaa viestiin tämän päivän ruuan"
              sx={{ minWidth: 300 }}
            />

            {value === 'toistuva' && (
              <TextField
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value as unknown as number)}
                variant="outlined"
                label="Montako kertaa. (Loop)"
                sx={{ minWidth: 300 }}
              />
            )}

            <FormControl>
              <FormLabel id="demo-controlled-radio-buttons-group">Toistetaanko?</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={value}
                onChange={handleChange}
                row
              >
                <FormControlLabel value="toistuva" control={<Radio />} label="Toistuva" />
                <FormControlLabel
                  disabled={isCron == 'on'}
                  value="eitoistuva"
                  control={<Radio />}
                  label="Ei toistuva"
                />
                <FormControlLabel
                  disabled={isCron == 'on'}
                  value="nyt"
                  control={<Radio />}
                  label="Suorita nyt"
                />
              </RadioGroup>
            </FormControl>

            <FormControl>
              <FormLabel id="demo-controlled-radio-buttons-group">Cron?</FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={isCron}
                onChange={handleCronChange}
                row
              >
                <FormControlLabel value="on" control={<Radio />} label="On" />
                <FormControlLabel value="ei" control={<Radio />} label="Ei" />
              </RadioGroup>
            </FormControl>

            <LoadingButton
              loading={mutation.isLoading}
              variant="contained"
              disabled={submitError}
              color={mutationError ? 'error' : 'primary'}
              onClick={() => {
                mutation.mutate({
                  intervalText: cron,
                  toistuva: value,
                  viesti,
                  cron: isCron,
                  limit: Number(limit)
                })
              }}
            >
              Tallenna
            </LoadingButton>

            {mutationError && (
              <>
                <p style={{ maxWidth: 310, wordBreak: 'break-word' }}>
                  {JSON.stringify(mutation.error, null, 2)}
                </p>
              </>
            )}
          </Flex>
        </Paperi>

        <PaperiIframelle elevation={4} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <iframe
            src="/admin"
            style={{
              width: '-webkit-fill-available',
              height: '-webkit-fill-available',
              border: 'none'
            }}
          />
        </PaperiIframelle>
      </Grid>
    </div>
  )
}
