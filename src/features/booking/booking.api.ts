import API_ROUTES from "@/constants/route";
import api from "@/utils/api";
import BookingApiTypes from "./booking.api.type";
const bookingRoute = API_ROUTES.booking;
async function postBooking(body: BookingApiTypes['postBooking']['payload']) {
    return await api.fetchJson(bookingRoute.route, {
        method: "POST",
        body,
    });
}

/**
 * GET /bookings/accept answers with an HTML page — the same link is opened straight
 * from the therapist's email — so there is no JSON body to read. 200 means accepted,
 * 400 means the server refused it (already taken, unknown id, stale link).
 */
async function acceptBooking({ email, id }: BookingApiTypes['acceptBooking']['query']) {
    const query = `email=${encodeURIComponent(email)}&id=${encodeURIComponent(id)}`;
    const response = await api.fetch(`${bookingRoute.accept}?${query}`, { method: "GET" });

    return { ok: response.ok, status: response.status };
}

const bookingApi = {
    postBooking,
    acceptBooking,
} as const

export default bookingApi
