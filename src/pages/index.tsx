import React, { useState } from 'react'

import later from '@breejs/later'
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  List,
  ListItem,
  Checkbox,
  Button
} from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'
import styled from '@emotion/styled'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

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
  return axios.get('/api/lista')
}

export default function Home() {
  const queryClient = useQueryClient()

  const [intervalText, setText] = useState('')
  const [value, setValue] = useState('toistuva')
  const lista = useQuery(['lista'], fetchList)
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value)
  }

  const parsedText = later.parse.text(intervalText)
  const error = parsedText.error !== -1 || intervalText === ''

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
          </RadioGroup>
        </FormControl>

        <LoadingButton
          loading={mutation.isLoading}
          variant="contained"
          disabled={error}
          onClick={() =>
            mutation.mutate({
              intervalText,
              toistuva: value
            })
          }
        >
          Tallenna
        </LoadingButton>
      </Flex>

      <List>
        {lista.data?.data.map((item: any) => (
          <ListItem key={item.id} secondaryAction={<Button size="small">Poista</Button>}>
            Moikka miten mene
          </ListItem>
        ))}
      </List>
    </Grid>
  )
}
