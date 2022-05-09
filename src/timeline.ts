import { _getAllFollowing } from './follow'
import { getOrbitDb, getStorage } from './storage'
import { getBinaryUrl } from './util'
import { Post } from './post'

export async function queryAllFollowingPosts(limit: number) {
    const following = await _getAllFollowing()
    const dbList = await Promise.all(
        following.map((it) =>
            (async function () {
                const dbId = it.postDbId
                const db = await (await getOrbitDb()).feed(dbId)
                await db.load()
                return { db, lastPost: it.lastPost }
            })()
        )
    )
    console.log(dbList)
    dbList.push({ db: getStorage('postDb'), lastPost: undefined })
    let posts = dbList
        .flatMap((it) => {
            const { db, lastPost } = it
            return db.iterator({ limit, gte: lastPost }).collect()
        })
        .map((it) => {
            const result: Post = <Post>it.payload.value
            result.postId = it.hash
            return result
        })
        .sort((a, b) => a.timestamp - b.timestamp)
    const urls: string[] = <string[]>await Promise.all(
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
