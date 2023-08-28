import 'reflect-metadata'
import app from './app'

app.listen(process.env.API_PORT ?? 3333, () => {
  console.log('🚀 Backend Started.')
})
