import QRCode from 'qrcode'

let currentQr = null
let qrImage = null

export const saveQr = async (qr) => {
    currentQr = qr
    qrImage = await QRCode.toDataURL(qr)
}

export const getQr = () => {
    return {
        raw: currentQr,
        image: qrImage
    }
}

export const clearQr = () => {
    currentQr = null
    qrImage = null
}