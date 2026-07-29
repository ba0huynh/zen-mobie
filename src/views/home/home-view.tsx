import View from "@/components/ui/view";
import useHomeView from "./home-view.hook";
import { FlashList } from "@shopify/flash-list";
import MassageCard from "./components/massage-card";
export default function HomeView() {
    const { isLoading, massageList } = useHomeView()
    if (isLoading) return <div>Loading...</div>
    return <FlashList
        data={massageList}
        renderItem={({ item }) => <MassageCard item={item} />}
    />
}