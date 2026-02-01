import { getQr as getQrData } from '../../whatsapp/qr.js'
import { getSessionStatus as getStatus } from '../../whatsapp/session.js'

export const getQr = (req, res) => {
    const qr = getQrData()

    if (!qr.image) {
        return res.status(404).json({
            message: 'QR not available'
        })
    }

    res.json({
        qr: qr.image
    })
}

export const getSessionStatus = (req, res) => {
    res.json({
        status: getStatus()
    })
}