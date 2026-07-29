import { isDevelopment } from "@/utils/isDevelopment";
import { ObserveRoot } from "expo-observe";
import { Stack } from "expo-router";


function Layout() {
  return <Stack>
    <Stack.Screen name="index" />
  </Stack>
}

export default isDevelopment() ? Layout : ObserveRoot.wrap(Layout);
