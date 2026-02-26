import type { Context } from "hono"

import { reservationService } from "./reservation.service"
import { createResponse } from "../../shared/utils/response/response"
import { HTTP_STATUS, resolveStatusCode } from "../../shared/utils/status-codes"

export class ReservationController {
  async handleGetByStudent(c: Context) {
    try {
      const { id } = c.req.param()
      const reservations = await reservationService.getByStudent(id)

      const response = createResponse(
        true,
        "Reservations retrieved successfully.",
        { reservations },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to retrieve reservations.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleReserve(c: Context) {
    try {
      const { id } = c.req.param()
      const body = await c.req.json()
      const { subjectId } = body

      if (!subjectId) {
        return c.json(
          createResponse(
            false,
            "subjectId is required.",
            null,
            ["subjectId is required"],
            null,
            c.req.header("x-request-id"),
          ),
          HTTP_STATUS.BAD_REQUEST,
        )
      }

      const reservation = await reservationService.reserve(id, subjectId)

      const response = createResponse(
        true,
        "Subject reserved successfully.",
        { reservation },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, HTTP_STATUS.CREATED)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Reservation failed.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleCancel(c: Context) {
    try {
      const { id, reservationId } = c.req.param()
      await reservationService.cancel(id, reservationId)

      const response = createResponse(
        true,
        "Reservation cancelled successfully.",
        null,
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to cancel reservation.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  async handleUpdateStatus(c: Context) {
    try {
      const { reservationId } = c.req.param()
      const body = await c.req.json()
      const { status } = body

      if (!status || !["APPROVED", "DENIED"].includes(status)) {
        return c.json(
          createResponse(
            false,
            "Invalid status.",
            null,
            ["status must be APPROVED or DENIED"],
            null,
            c.req.header("x-request-id"),
          ),
          HTTP_STATUS.BAD_REQUEST,
        )
      }

      const reservation = await reservationService.updateStatus(
        reservationId,
        status,
      )

      const response = createResponse(
        true,
        `Reservation ${status.toLowerCase()}.`,
        { reservation },
        [],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response)
    } catch (error: any) {
      const response = createResponse(
        false,
        "Failed to update reservation status.",
        null,
        [error.message],
        null,
        c.req.header("x-request-id"),
      )
      return c.json(response, resolveStatusCode(error))
    }
  }

  // ── Student "me" handlers ─────────────────────────────────────────────────

  async handleMeGetReservations(c: Context) {
    try {
      const user = c.get("user") as { studentId?: string }
      if (!user.studentId) {
        return c.json(
          createResponse(
            false,
            "No student profile linked to this account.",
            null,
            [],
            null,
            c.req.header("x-request-id"),
          ),
          HTTP_STATUS.BAD_REQUEST,
        )
      }
      const reservations = await reservationService.getByStudent(user.studentId)
      return c.json(
        createResponse(
          true,
          "Reservations retrieved successfully.",
          { reservations },
          [],
          null,
          c.req.header("x-request-id"),
        ),
      )
    } catch (error: any) {
      return c.json(
        createResponse(
          false,
          "Failed to retrieve reservations.",
          null,
          [error.message],
          null,
          c.req.header("x-request-id"),
        ),
        resolveStatusCode(error),
      )
    }
  }

  async handleMeReserve(c: Context) {
    try {
      const user = c.get("user") as { studentId?: string }
      if (!user.studentId) {
        return c.json(
          createResponse(
            false,
            "No student profile linked to this account.",
            null,
            [],
            null,
            c.req.header("x-request-id"),
          ),
          HTTP_STATUS.BAD_REQUEST,
        )
      }
      const body = await c.req.json()
      const { subjectId } = body
      if (!subjectId) {
        return c.json(
          createResponse(
            false,
            "subjectId is required.",
            null,
            ["subjectId is required"],
            null,
            c.req.header("x-request-id"),
          ),
          HTTP_STATUS.BAD_REQUEST,
        )
      }
      const reservation = await reservationService.reserve(
        user.studentId,
        subjectId,
      )
      return c.json(
        createResponse(
          true,
          "Subject reserved successfully.",
          { reservation },
          [],
          null,
          c.req.header("x-request-id"),
        ),
        HTTP_STATUS.CREATED,
      )
    } catch (error: any) {
      return c.json(
        createResponse(
          false,
          "Reservation failed.",
          null,
          [error.message],
          null,
          c.req.header("x-request-id"),
        ),
        resolveStatusCode(error),
      )
    }
  }

  async handleMeCancel(c: Context) {
    try {
      const user = c.get("user") as { studentId?: string }
      if (!user.studentId) {
        return c.json(
          createResponse(
            false,
            "No student profile linked to this account.",
            null,
            [],
            null,
            c.req.header("x-request-id"),
          ),
          HTTP_STATUS.BAD_REQUEST,
        )
      }
      const { reservationId } = c.req.param()
      await reservationService.cancel(user.studentId, reservationId)
      return c.json(
        createResponse(
          true,
          "Reservation cancelled successfully.",
          null,
          [],
          null,
          c.req.header("x-request-id"),
        ),
      )
    } catch (error: any) {
      return c.json(
        createResponse(
          false,
          "Failed to cancel reservation.",
          null,
          [error.message],
          null,
          c.req.header("x-request-id"),
        ),
        resolveStatusCode(error),
      )
    }
  }
}

export const reservationController = new ReservationController()
