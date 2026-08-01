import { ThemeProvider } from "@/hooks/theme.hook";
import { isDevelopment } from "@/utils/isDevelopment";
import { ObserveRoot } from "expo-observe";
import { Stack } from "expo-router";


function Layout() {

  return (
    <ThemeProvider>
      <Stack screenOptions={{headerShown:false}}>
        <Stack.Screen name="index" />
      </Stack>
    </ThemeProvider>
  );
}

export default isDevelopment() ? Layout : ObserveRoot.wrap(Layout);
