// @ts-ignore
import OrbitDB from 'orbit-db'
import KeyValueStore from 'orbit-db-kvstore'
import { ipfs } from './init'
import { getOrbitDb, getStorage, setStorage } from './storage'
import { getBinaryUrl } from './util'
import { _commentsDbMap } from './comment'

export type User = {
    username: string
    email: string
    photoUrl: string
    country: string
    bio: string
    id: string
    signedUpAt: number
    lastSeen: number
    isOnline: boolean
    followDbId: string
    postDbId: string
}
export function publishMe() {
    setInterval(() => {
        ;(async () => {
            await ipfs.pubsub.publish(
                'news',
                new TextEncoder().encode(
                    JSON.stringify({
                        postDbId: getStorage('postDb').identity.id,
                    })
                )
            )
        })()
    }, 1000)
}

export async function registerUser(username: string) {
    const orbitdb = await getOrbitDb()
    const db = await orbitdb.keyvalue(username)
    const followDb = await orbitdb.feed(`${username}.follow`)
    const postDb = await orbitdb.feed(`${username}.posts`)
    await db.load()
    await followDb.load()
    await postDb.load()
    db.events.on('replicated', () => {
        console.log(db.all)
    })
    console.log('UserDb:', db)
    console.log('FollowDb:', followDb)
    console.log('PostDb:', postDb)
    const previous = db.get('user')
    console.log('Previous', previous, db.get('posts'), db.get('followings'))

    if (!previous) {
        console.log('Create New User')
        db.set('user', {
            username,
            email: db.identity.id,
            country: db.identity.id,
            photoUrl: 'https://avatars.githubusercontent.com/u/1',
            bio: '',
            id: db.identity.id,
            followDbId: followDb.identity.id,
            postDbId: postDb.identity.id,
        })
        db.set('posts', { count: 0 })
        db.set('followings', { count: 0 })
    }

    setStorage('myDb', db)
    setStorage('followDb', followDb)
    setStorage('postDb', postDb)

    publishMe()
    return db.identity.id
}

export async function login(dbId: string) {
    const orbitdb = await getOrbitDb()
    const db = await orbitdb.keyvalue(dbId, { localOnly: true })
    await db.load()
    const me: User = <User>db.get('user')
    console.log('Login', me)
    const followDb = await orbitdb.feed(me.followDbId)
    const postDb = await orbitdb.feed(me.postDbId)
    await followDb.load()
    await postDb.load()

    setStorage('myDb', db)
    setStorage('followDb', followDb)
    setStorage('postDb', postDb)

    publishMe()
    return db.identity.id
}

export function getDbId() {
    return getStorage('myDb').identity.id
}

export async function updateMyPhoto(path: string) {
    const me = getStorage('myDb').get('user')
    me.photoUrl = path
    getStorage('myDb').set('user', me)
}

export async function getMyProfile() {
    const me = getStorage('myDb').get('user')
    if (me.photoUrl.indexOf('blob') < 0) {
        me.photoUrl = await getBinaryUrl(me.photoUrl)
    }
    return JSON.stringify(me)
}

const _userMap: Record<string, KeyValueStore<any>> = {}

export async function getUser(userAddr: string) {
    const userDb =
        _userMap[userAddr] ||
        (await (async () => {
            const db = await (await getOrbitDb()).keyvalue(userAddr)
            await db.load()
            _userMap[userAddr] = db
            return db
        })())
    const user = userDb.get('user')
    if (user.photoUrl.indexOf('blob') < 0) {
        user.photoUrl = await getBinaryUrl(user.photoUrl)
    }
    return JSON.stringify(user)
}
