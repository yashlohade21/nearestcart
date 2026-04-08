import { Stack } from "expo-router";
import { Colors } from "../../lib/colors";

export default function ScreensLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.green,
        },
        headerTintColor: Colors.textWhite,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen name="new-deal" options={{ headerTitle: "New Deal" }} />
      <Stack.Screen name="inventory" options={{ headerTitle: "Inventory" }} />
      <Stack.Screen name="profile" options={{ headerTitle: "Profile" }} />
      <Stack.Screen name="weekly-pnl" options={{ headerTitle: "Weekly P&L" }} />
      <Stack.Screen name="advances" options={{ headerTitle: "Advances" }} />
      <Stack.Screen name="deal/[id]" options={{ headerTitle: "Deal Details" }} />
      <Stack.Screen name="deal/edit" options={{ headerTitle: "Edit Deal" }} />
      <Stack.Screen name="deal/invoice" options={{ headerTitle: "Invoice" }} />
      <Stack.Screen name="farmer/[id]" options={{ headerTitle: "Farmer Details" }} />
      <Stack.Screen name="buyer/[id]" options={{ headerTitle: "Buyer Details" }} />
      <Stack.Screen name="transporters" options={{ headerTitle: "Transporters" }} />
      <Stack.Screen name="analytics" options={{ headerTitle: "Analytics" }} />
      <Stack.Screen name="mandi-rates" options={{ headerTitle: "Mandi Rates" }} />
    </Stack>
  );
}
