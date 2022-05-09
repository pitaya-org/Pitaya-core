import OrbitDB from "orbit-db";
import {ipfs} from "./init";
import FeedStore from "orbit-db-feedstore";
import KeyValueStore from "orbit-db-kvstore";

const store = {
    "knownPostDb": {},
    "followDb": {},
    "myDB": {},
    "postDb": {},
}
let orbitDb: OrbitDB | null = null;

export async function getOrbitDb(): Promise<OrbitDB> {
    if (orbitDb == null) {
        // @ts-ignore
        orbitDb = await OrbitDB.createInstance(ipfs);
    }
    return orbitDb;
}

type StorageName = "postDb" | "myDb" | "followDb" | "knownPostDb"
type StorageType<T> =
    T extends "postDb" ? FeedStore<any> :
        T extends "myDb" ? KeyValueStore<any> :
            T extends "followDb" ? FeedStore<any> :
                T extends "knownPostDb" ? KeyValueStore<any> : never;

export function getStorage<T extends StorageName>(key: T): StorageType<T> {
    // @ts-ignore
    return store[key]
}

export function setStorage<T extends StorageName>(key: T, value: StorageType<T>) {
    // @ts-ignore
    store[key] = value
}
