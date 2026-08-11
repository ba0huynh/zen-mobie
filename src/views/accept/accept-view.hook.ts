import bookingApi from "@/features/booking/booking.api"
import { useLocalSearchParams } from "expo-router"
import { useState } from "react"

type AcceptStatus = "idle" | "accepting" | "accepted" | "failed"

/** Reads the booking straight off the accept link — nothing here is typed by hand. */
export default function useAcceptView() {
    const params = useLocalSearchParams<{ id?: string; email?: string }>()
    const id = typeof params.id === "string" ? params.id : ""
    const email = typeof params.email === "string" ? params.email : ""

    const [status, setStatus] = useState<AcceptStatus>("idle")
    const [message, setMessage] = useState<string | null>(null)

    const hasLink = !!id && !!email

    async function handleAccept() {
        if (!hasLink || status === "accepting") return

        setStatus("accepting")
        setMessage(null)

        try {
            const result = await bookingApi.acceptBooking({ id, email })

            if (result.ok) {
                setStatus("accepted")
                return
            }

            setStatus("failed")
            setMessage(
                result.status === 400
                    ? "This booking could not be accepted. It may already have been taken, or the link is no longer valid."
                    : `The booking service refused the request (${result.status}).`
            )
        } catch {
            setStatus("failed")
            setMessage("We could not reach the booking service. Please try again.")
        }
    }

    return { id, email, hasLink, status, message, handleAccept }
}
