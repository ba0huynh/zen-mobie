import env from "@/../env";

const base = env.API_URL || "";

function massageRoute() {
    const route = `${base}/massage`;
    return { route }
}
function bookingRoute() {
    const route = `${base}/booking`;
    return { route }
}

const baseRoutes = {
    massage: massageRoute(),
    booking: bookingRoute(),
}
const API_ROUTES = { ...baseRoutes } as const;
export default API_ROUTES;
