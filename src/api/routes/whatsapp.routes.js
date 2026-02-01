import { Router } from 'express'
import { getQr, getSessionStatus } from '../controllers/whatsapp.controller.js'

const router = Router()

router.get('/qr', getQr)
router.get('/status', getSessionStatus)

export default router