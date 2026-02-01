let sessionStatus = 'INIT'

export const setSessionStatus = (status) => {
    sessionStatus = status
}

export const getSessionStatus = () => {
    return sessionStatus
}

export const isSessionReady = () => {
    return sessionStatus === 'READY'
}