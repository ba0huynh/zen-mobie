import API_ROUTES from "@/constants/route";
import { PlaceSchema } from "@/entities/place.entity";
import api from "@/utils/api";
import { parseData } from "@/utils/parseData";

async function getPlaceList() {
    return parseData(PlaceSchema.array(), await api.fetchJson(API_ROUTES.place.route, { method: 'GET' }))
}

const placeApi = {
    getPlaceList,
} as const;

export default placeApi;
