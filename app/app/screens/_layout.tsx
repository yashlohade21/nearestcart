import { Stack } from "expo-router";
import { Colors } from "../../lib/colors";
import { useT } from "../../lib/i18n";

export default function ScreensLayout() {
  const t = useT();

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
        headerStatusBarHeight: 0,
      }}
    >
      <Stack.Screen name="new-deal" options={{ headerTitle: t("headerNewDeal") }} />
      <Stack.Screen name="inventory" options={{ headerTitle: t("headerInventory") }} />
      <Stack.Screen name="profile" options={{ headerTitle: t("headerProfile") }} />
      <Stack.Screen name="weekly-pnl" options={{ headerTitle: t("headerWeeklyPnl") }} />
      <Stack.Screen name="advances" options={{ headerTitle: t("headerAdvances") }} />
      <Stack.Screen name="deal/[id]" options={{ headerTitle: t("headerDealDetails") }} />
      <Stack.Screen name="deal/edit" options={{ headerTitle: t("headerEditDeal") }} />
      <Stack.Screen name="deal/invoice" options={{ headerTitle: t("headerInvoice") }} />
      <Stack.Screen name="deal/bilty" options={{ headerTitle: t("headerBilty") }} />
      <Stack.Screen name="farmer/[id]" options={{ headerTitle: t("headerFarmerDetails") }} />
      <Stack.Screen name="buyer/[id]" options={{ headerTitle: t("headerBuyerDetails") }} />
      <Stack.Screen name="transporters" options={{ headerTitle: t("headerTransporters") }} />
      <Stack.Screen name="agents" options={{ headerTitle: t("headerAgents") }} />
      <Stack.Screen name="banks" options={{ headerTitle: t("headerBanks") }} />
      <Stack.Screen name="suppliers" options={{ headerTitle: t("headerSuppliers") }} />
      <Stack.Screen name="customers" options={{ headerTitle: t("headerCustomers") }} />
      <Stack.Screen name="analytics" options={{ headerTitle: t("headerAnalytics") }} />
      <Stack.Screen name="mandi-rates" options={{ headerTitle: t("headerMandiRates") }} />
      <Stack.Screen name="purchase-entry" options={{ headerTitle: t("headerPurchaseEntry") }} />
      <Stack.Screen name="sale-entry" options={{ headerTitle: t("headerSaleEntry") }} />
      <Stack.Screen name="receipt-voucher" options={{ headerTitle: t("headerReceiptVoucher") }} />
      <Stack.Screen name="payment-voucher" options={{ headerTitle: t("headerPaymentVoucher") }} />
      <Stack.Screen name="ledger" options={{ headerTitle: t("headerLedger") }} />
      <Stack.Screen name="stock-register" options={{ headerTitle: t("headerStockRegister") }} />
      <Stack.Screen name="daybook" options={{ headerTitle: t("headerDayBook") }} />
      <Stack.Screen name="outstanding" options={{ headerTitle: t("headerOutstanding") }} />
      <Stack.Screen name="gst-report" options={{ headerTitle: t("headerGstReport") }} />
      <Stack.Screen name="admin-panel" options={{ headerTitle: "Admin Panel" }} />
      <Stack.Screen name="print-deals" options={{ headerTitle: t("headerPrintCenter") }} />
      <Stack.Screen name="farmer-entry" options={{ headerTitle: t("headerFarmerEntry") }} />
      <Stack.Screen name="farmer-sale" options={{ headerTitle: t("headerFarmerSale") }} />
      <Stack.Screen name="farmer-payment" options={{ headerTitle: t("headerFarmerPayment") }} />
      <Stack.Screen name="nave-bill" options={{ headerTitle: t("headerNaveBill") }} />
      <Stack.Screen name="cash-entry" options={{ headerTitle: t("headerCashEntry") }} />
      <Stack.Screen name="bank-txn" options={{ headerTitle: t("headerBankTxn") }} />
      <Stack.Screen name="expense-entry" options={{ headerTitle: t("headerExpenseEntry") }} />
      <Stack.Screen name="vehicle-master" options={{ headerTitle: t("headerVehicleMaster") }} />
      <Stack.Screen name="delivery-places" options={{ headerTitle: t("headerDeliveryPlaces") }} />
      <Stack.Screen name="kharidar-master" options={{ headerTitle: t("headerKharidarMaster") }} />
      <Stack.Screen name="balance-check" options={{ headerTitle: t("headerBalanceCheck") }} />
      <Stack.Screen name="reports-hub" options={{ headerTitle: t("headerReportsHub") }} />
      <Stack.Screen name="agent-payment" options={{ headerTitle: t("headerAgentCommission") }} />
      <Stack.Screen name="user-management" options={{ headerTitle: t("headerUserManagement") }} />
    </Stack>
  );
}
