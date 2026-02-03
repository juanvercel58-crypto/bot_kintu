let sessionState = {
    status: 'INIT', // INIT | QR | AUTHENTICATED | READY | DISCONNECTED | AUTH_FAILURE
    updatedAt: Date.now()
}

export const setSessionStatus = (status) => {
    sessionState.status = status
}

export const getSessionStatus = () => {
    return sessionState
}

export const isSessionReady = () => {
    return sessionState.status === 'READY'
}