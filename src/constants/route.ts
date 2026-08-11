import env from "@/../env";

const base = env.API_URL || "";

function massageRoute() {
    const route = `${base}/massages`;
    return { route }
}
function bookingRoute() {
    const route = `${base}/bookings`;
    return { route, accept: `${route}/accept` }
}
function placeRoute() {
    const route = `${base}/places`;
    return { route }
}

const baseRoutes = {
    massage: massageRoute(),
    booking: bookingRoute(),
    place: placeRoute(),
}
const API_ROUTES = { ...baseRoutes } as const;
export default API_ROUTES;
