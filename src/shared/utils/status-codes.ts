import type { ContentfulStatusCode } from "hono/utils/http-status"

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
} as const

export const resolveStatusCode = (error: Error): ContentfulStatusCode => {
    switch (error.message) {
        case "Invalid credentials.":
        case "Token is required.":
        case "Token is invalid or expired.":
        case "Refresh token not found.":
        case "Refresh token is missing.":
        case "Invalid refresh token.":
        case "Token refresh failed.":
            return HTTP_STATUS.UNAUTHORIZED

        case "User not found.":
        case "Profile not found.":
            return HTTP_STATUS.NOT_FOUND

        case "Forbidden. Insufficient permissions.":
        case "Unauthorized to update this profile.":
        case "Profile does not belong to the specified user.":
            return HTTP_STATUS.FORBIDDEN

        case "User with this email already exists.":
        case "Email already in use.":
        case "User creation failed.":
            return HTTP_STATUS.BAD_REQUEST

        default:
            return HTTP_STATUS.INTERNAL_SERVER_ERROR
    }
}
