const statusEl = document.getElementById('status')
const qrImg = document.getElementById('qr')
const hintEl = document.getElementById('hint')

async function fetchStatus() {
    const res = await fetch('/whatsapp/status')
    if (!res.ok) throw new Error('Status fetch failed')
    return await res.json() // { status, updatedAt }
}

async function fetchQr() {
    const res = await fetch('/whatsapp/qr')
    if (!res.ok) return null
    const data = await res.json()
    return data.qr
}

async function refresh() {
    try {
        const { status } = await fetchStatus()
        statusEl.textContent = status.status
        statusEl.className = `status ${status.status}`

        if (status.status === 'QR') {
            const qr = await fetchQr()
            if (qr) {
                qrImg.src = qr
                qrImg.style.display = 'block'
                hintEl.textContent = 'Escanea el QR desde WhatsApp'
            }
        }
        else if (status.status === 'READY') {
            qrImg.style.display = 'none'
            hintEl.textContent = '✅ WhatsApp conectado correctamente'
        } 
        else if (status.status === 'AUTH_FAILURE') {
            qrImg.style.display = 'none'
            hintEl.textContent = '❌ Sesión inválida. Reinicia WhatsApp.'
        }
        else if (status.status === 'DISCONNECTED') {
            qrImg.style.display = 'none'
            hintEl.textContent = '⚠️ WhatsApp desconectado. Esperando reconexión…'
        }
        else {
            qrImg.style.display = 'none'
            hintEl.textContent = '⏳ Inicializando sesión…'
        }
    } catch (err) {
        console.error(err)
        hintEl.textContent = '❌ Error conectando con el servidor'
    }
}

refresh()
setInterval(refresh, 3000)