import { ipfs } from './init'

export async function uploadBinary(binary: Blob) {
    console.log(binary)
    const file = {
        content: binary,
    }
    const result = await ipfs.add(file)
    console.log(result)
    return result.path
}

export async function getBinaryUrl(path: string): Promise<string> {
    const array = []
    for await (const buf of ipfs.cat(path)) {
        array.push(buf)
    }
    console.log(array)
    return URL.createObjectURL(
        new Blob(array, { type: 'application/octet-stream' })
    )
}
