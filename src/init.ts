import type { IPFS } from 'ipfs-core'
import { create } from 'ipfs-core'
// @ts-ignore
import WS from 'libp2p-websockets'
// @ts-ignore
import filters from 'libp2p-websockets/src/filters'
import { REPO_NAME, SWARM, BOOTSTRAP } from './constants'
import { getStorage } from './storage'

const transportKey = WS.prototype[Symbol.toStringTag]

export let ipfs: IPFS

export async function initIpfs() {
    ipfs = await create({
        repo: REPO_NAME,
        start: true,
        preload: {
            enabled: false,
        },
        EXPERIMENTAL: {
            ipnsPubsub: true,
        },
        config: {
            Addresses: {
                Swarm: [SWARM],
            },
            Bootstrap: [BOOTSTRAP],
        },
        libp2p: {
            config: {
                transport: {
                    [transportKey]: {
                        filter: filters.all,
                    },
                },
            },
        },
    })
    console.log('Create Ipfs:', ipfs)
    console.log('2')
    await ipfs.pubsub.subscribe('news', (msg) => {
        if (msg.from === ipfs.id) {
            return
        }
        const payload = JSON.parse(new TextDecoder('utf-8').decode(msg.data))
        const _knownPostDb = getStorage('knownPostDb')
        if (!_knownPostDb[payload.postDbId]) {
            console.log('New post:', payload)
            _knownPostDb[payload.postDbId] = { last: null }
        }
    })
    console.log('Subscribe to news')
}
