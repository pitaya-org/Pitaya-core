const store = {
    knownPostDb: {},
    followDb: {},
    myDB: {},
    orbitDb: {},
    postDb: {},
}

export function getStorage(key: string): any {
    return store[key]
}

export function setStorage(key: string, value: unknown) {
    store[key] = value
}
