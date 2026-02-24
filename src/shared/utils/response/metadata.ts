import { env } from "../../../config/env"

export interface Metadata {
    requestId: string
    version: string
    timestamp: string
    serverTime: string
}

export const createMetadata = (requestId: string): Metadata => {
    const now = new Date().toISOString()
    return {
        requestId,
        version: env.VERSION,
        timestamp: now,
        serverTime: now,
    }
}
