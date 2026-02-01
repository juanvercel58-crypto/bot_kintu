import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

import healthRoutes from './api/routes/health.routes.js'
import whatsappRoutes from './api/routes/whatsapp.routes.js'

const app = express()

// Middlewares base
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicPath = path.join(__dirname, '..', 'public')
console.log('📂 Serving static from:', publicPath)
app.use(express.static(publicPath))

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'))
})

// Routes
app.use('/health', healthRoutes)
app.use('/whatsapp', whatsappRoutes)

// Fallback
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' })
})

export default app