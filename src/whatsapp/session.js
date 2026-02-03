let sessionState = {
    status: 'INIT', // INIT | QR | AUTHENTICATED | READY | DISCONNECTED | AUTH_FAILURE
    lastStatus: null,
    updatedAt: Date.now()
}

export const setSessionStatus = (status) => {
    if (sessionState.status !== status) {
        sessionState.lastStatus = sessionState.status
        sessionState.status = status
        sessionState.updatedAt = Date.now()
    }
}

export const getSessionStatus = () => {
    return sessionState
}

export const getLastSessionStatus = () => {
    return sessionState.lastStatus
}

export const isSessionReady = () => {
    return sessionState.status === 'READY'
}