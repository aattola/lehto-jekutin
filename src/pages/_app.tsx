import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProps } from 'next/app'

import '../components/global.css'

function MyApp({ Component, pageProps }: AppProps) {
  // This ensures that data is not shared
  // between different users and requests
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}

export default MyApp
