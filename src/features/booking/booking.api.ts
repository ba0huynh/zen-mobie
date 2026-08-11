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

const bookingApi = {
    postBooking,
} as const

export default bookingApi