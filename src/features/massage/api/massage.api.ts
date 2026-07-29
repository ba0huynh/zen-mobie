import API_ROUTES from "@/constants/route";
import { parseData } from "@/utils/parseData";
import { MassageItemSchema } from "../massage.type";
import api from "@/utils/api";

async function getMassageList() {
    return parseData(MassageItemSchema.array(), api.fetchJson(API_ROUTES.massage.route, { method: 'GET' }))
}

const massageApi = {
    getMassageList
} as const;
export default massageApi;