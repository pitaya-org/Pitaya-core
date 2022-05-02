import md5 from 'md5'
import { getStorage } from './storage'
import { getBinaryUrl } from './util'
import { getDbId } from './user'

export async function countMyPosts() {
    return getStorage('myDb').get('posts').count
}

export async function getMyPosts(offset: number, limit: number) {
    const all = getStorage('postDb')
        .iterator({ limit, gt: offset || undefined })
        .collect()
        .map((it) => {
            const result = it.payload.value
            result.postId = it.hash
            return result
        })
    const urls = await Promise.all(
        all.map((it) => {
            if (it.mediaUrl.indexOf('blob') < 0) {
                return getBinaryUrl(it.mediaUrl)
            }
            return new Promise((resolve) => resolve(it.mediaUrl))
        })
    )
    const result = all.map((it, i) => {
        it.mediaUrl = urls[i]
        return it
    })
    console.log(result)
    return JSON.stringify(result)
}

export async function postMine(p: string) {
    const json = JSON.parse(p)
    const commentsDb = await getStorage('orbitDb').feed(md5(p))
    json.commentAddr = commentsDb.id
    json.ownerId = getDbId()
    json.username = getStorage('myDb').get('user').username
    json.timestamp = new Date().getTime()
    await getStorage('postDb').add(json)
    await getStorage('myDb').set('posts', {
        count: getStorage('myDb').get('posts').count + 1,
    })
}

export async function deleteMyPost(hash: string) {
    await getStorage('postDb').remove(hash)
    await getStorage('myDb').set('posts', {
        count: getStorage('myDb').get('posts').count - 1,
    })
}
