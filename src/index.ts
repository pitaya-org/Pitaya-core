import 'core-js/stable'
import 'regenerator-runtime/runtime'

import { initIpfs } from './init'
import { getAllFollowing, isFollowing, follow, unfollow } from './follow'
import { uploadBinary, getBinaryUrl } from './util'
import {
    registerUser,
    login,
    getDbId,
    updateMyPhoto,
    getMyProfile,
    getUser,
    publishMe,
} from './user'
import { countMyPosts, getMyPosts, postMine, deleteMyPost } from './post'
import { queryAllFollowingPosts, queryNewPosts } from './timeline'
import {
    countComments,
    getComments,
    addComment,
    removeComment,
    like,
    unlike,
} from './comment'

// 向 dart 层暴露的接口
Object.assign(window, {
    initIpfs,
    // follow module
    getAllFollowing,
    isFollowing,
    follow,
    unfollow,
    // util module
    uploadBinary,
    getBinaryUrl,
    // user module
    registerUser,
    login,
    getDbId,
    updateMyPhoto,
    getMyProfile,
    getUser,
    publishMe,
    // post module
    countMyPosts,
    getMyPosts,
    postMine,
    deleteMyPost,
    // timeline module
    queryAllFollowingPosts,
    queryNewPosts,
    // comment module
    countComments,
    getComments,
    addComment,
    removeComment,
    like,
    unlike,
})
