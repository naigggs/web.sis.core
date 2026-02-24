import type { Metadata } from "./metadata"
import { createMetadata } from "./metadata"
import type { Pagination } from "./pagination"
import type { ApiError } from "./errors"

export interface ApiResponse<T = any> {
    success: boolean
    message: string
    data: T | null
    errors: ApiError[]
    pagination: Pagination | null
    metadata: Metadata
}

export const createResponse = <T>(
    success: boolean,
    message: string,
    data: T | null = null,
    errors: (ApiError | string)[] = [],
    pagination: Pagination | null = null,
    requestId: string = crypto.randomUUID(),
): ApiResponse<T> => {
    const normalizedErrors: ApiError[] = errors.map((err) =>
        typeof err === "string" ? { code: "ERROR", message: err } : err,
    )

    return {
        success,
        message,
        data,
        errors: normalizedErrors,
        pagination,
        metadata: createMetadata(requestId),
    }
}
