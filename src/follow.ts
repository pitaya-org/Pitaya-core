import { getStorage } from './storage'
import {User} from "./user";

export type FollowUser = User & {
    lastPost: string|undefined
}

export async function _getAllFollowing():Promise<FollowUser[]> {
    return getStorage('followDb')
        .iterator({ limit: -1 })
        .collect()
        .map((e) => e.payload.value)
}

export async function getAllFollowing() {
    const all = await _getAllFollowing()
    console.log(all)
    return JSON.stringify(all)
}

export async function isFollowing(dbId: number) {
    const all = getStorage('followDb')
        .iterator({ limit: -1 })
        .collect()
        .map((e) => e.payload.value.id)
        .filter((id) => id === dbId)
    return all.length > 0
}

export async function follow(dbId: number) {
    await getStorage('followDb').add({ postId: dbId, lastPost: null })
    await getStorage('myDb').set('followings', {
        count: getStorage('myDb').get('followings').count + 1,
    })
}

export async function unfollow(hash: string) {
    await getStorage('followDb').remove(hash)
    await getStorage('myDb').set('followings', {
        count: getStorage('myDb').get('followings').count - 1,
    })
}
