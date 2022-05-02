import { _getAllFollowing } from './follow'
import { getStorage } from './storage'
import { getBinaryUrl } from './util'

export async function queryAllFollowingPosts(limit: number) {
    const following = await _getAllFollowing()
    const dbList = await Promise.all(
        following.map((it) =>
            (async function () {
                const dbId = it.postId
                const db = await getStorage('orbitDb').feed(dbId)
                await db.load()
                return { db, lastPost: it.lastPost }
            })()
        )
    )
    console.log(dbList)
    dbList.push({ db: _postDb, lastPost: null })
    let posts = dbList
        .flatMap((it) => {
            const { db, lastPost } = it
            return db.iterator({ limit, gte: lastPost }).collect()
        })
        .map((it) => {
            const result = it.payload.value
            result.postId = it.hash
            return result
        })
        .sort((a, b) => a.timestamp - b.timestamp)
    const urls = await Promise.all(
        posts.map((it) => {
            if (it.mediaUrl.indexOf('blob') < 0) {
                return getBinaryUrl(it.mediaUrl)
            }
            return new Promise((resolve) => resolve(it.mediaUrl))
        })
    )
    posts = posts.map((it, i) => {
        it.mediaUrl = urls[i]
        return it
    })
    console.log(posts)
    return JSON.stringify(posts)
}

export async function queryNewPosts(_limit: unknown) {
    /** TODO */
}
