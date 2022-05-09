import FeedStore from 'orbit-db-feedstore'
import { getOrbitDb, getStorage } from './storage'
import { getBinaryUrl } from './util'
import { getDbId } from './user'

export type Comment = {
    username: string
    comment: string
    timestamp: string
    userDp: string
    userId: string
}

export const _commentsDbMap: Record<string, FeedStore<any>> = {}

export async function countComments(commentAddr: string) {
    const commentDb =
        _commentsDbMap[commentAddr] ||
        (await (async () => {
            const db = await (await getOrbitDb()).feed(commentAddr)
            await db.load()
            _commentsDbMap[commentAddr] = db
            return db
        })())
    return commentDb.iterator({ limit: -1 }).collect().length
}

async function _getComments(
    commentAddr: string,
    offset: number | null,
    limit: number
): Promise<LogEntry<any>[]> {
    const commentDb =
        _commentsDbMap[commentAddr] ||
        (await (async () => {
            const db = await (await getOrbitDb()).feed(commentAddr)
            await db.load()
            _commentsDbMap[commentAddr] = db
            return db
        })())
    const comments = commentDb
        .iterator({ limit, gt: offset?.toString() || undefined })
        .collect()
    console.log(comments)
    return comments
}
export async function getComments(
    commentAddr: string,
    offset: number,
    limit: number
): Promise<string> {
    const all = (await _getComments(commentAddr, offset, limit)).map(
        (it) => it.payload.value
    )
    const urls = await Promise.all(
        all.map((it) => {
            if (it.userDp.indexOf('blob') < 0) {
                return getBinaryUrl(it.userDp)
            }
            return new Promise((resolve) => resolve(it.userDp))
        })
    )
    all.forEach((it, i) => {
        it.userDp = urls[i]
    })
    console.log('Comments', all)
    return JSON.stringify(all)
}

export async function addComment(commentAddr: string, jsonStr: string) {
    console.log(commentAddr)
    const json = JSON.parse(jsonStr)
    const commentDb =
        _commentsDbMap[commentAddr] ||
        (await (async () => {
            const db = await (await getOrbitDb()).feed(commentAddr)
            await db.load()
            _commentsDbMap[commentAddr] = db
            return db
        })())
    json.username = getStorage('myDb').get('user').username
    json.userId = getDbId()
    json.timestamp = new Date().getTime()
    json.userDp = getStorage('myDb').get('user').photoUrl
    await commentDb.add(json)
}

export async function removeComment(commentAddr: string, hash: string) {
    const commentDb =
        _commentsDbMap[commentAddr] ||
        (await (async () => {
            const db = await (await getOrbitDb()).feed(commentAddr)
            await db.load()
            _commentsDbMap[commentAddr] = db
            return db
        })())
    await commentDb.remove(hash)
}

export async function like(commentAddr: string) {
    const json = {
        username: getStorage('myDb').get('user').username,
        userId: getDbId(),
        comment: 'liked',
        timestamp: new Date().getTime() * 1000,
        userDp: getStorage('myDb').get('user').photoUrl,
        isLike: true,
    }
    await addComment(commentAddr, JSON.stringify(json))
}

export async function unlike(commentAddr: string) {
    const all = await _getComments(commentAddr, null, -1)
    const json = all.find(
        (it) => it.payload.value.userId === getDbId() && it.payload.value.isLike
    )
    if (!json) {
        return
    }
    await removeComment(commentAddr, json.hash)
}
