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
}

export const reservationController = new ReservationController()
