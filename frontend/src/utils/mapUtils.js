import { toRaw } from "vue"

export function immutableSet(map, key, value) {
    const newMap = new Map(map)
    const rawValue = value ? structuredClone(toRaw(value)) : value
    newMap.set(key, rawValue)
    return newMap
}

export function immutableDelete(map, key) {
    const newMap = new Map(map)
    newMap.delete(key)
    return newMap
}