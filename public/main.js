const statusEl = document.getElementById('status')
const qrImg = document.getElementById('qr')
const hintEl = document.getElementById('hint')

async function fetchStatus() {
    const res = await fetch('/whatsapp/status')
    const data = await res.json()
    return data.status
}

async function fetchQr() {
    const res = await fetch('/whatsapp/qr')
    if (!res.ok) return null
    const data = await res.json()
    return data.qr
}

async function refresh() {
    try {
        const status = await fetchStatus()
        statusEl.textContent = status
        statusEl.className = status

        if (status === 'QR') {
            const qr = await fetchQr()
            if (qr) {
                qrImg.src = qr
                qrImg.style.display = 'block'
                hintEl.textContent = 'Escanea el QR desde WhatsApp'
            }
        } else if (status === 'READY') {
            qrImg.style.display = 'none'
            hintEl.textContent = 'WhatsApp conectado correctamente'
        } else {
            qrImg.style.display = 'none'
            hintEl.textContent = 'Inicializando sesión…'
        }
    } catch (err) {
        hintEl.textContent = 'Error conectando con el servidor'
    }
}

refresh()
setInterval(refresh, 3000)