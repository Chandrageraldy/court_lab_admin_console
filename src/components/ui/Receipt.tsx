import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PDFImage,
} from "@react-pdf/renderer";

import { formatIDR } from "../../utils/Helpers";
import type { TransactionItemInput } from "../../hooks/useTransactionService";
import type { Product } from "../../types/Product";
import courtlabGrayscale from "../../assets/courtlab_logo_grayscale.png";

const styles = StyleSheet.create({
  page: {
    paddingTop: 16,
    paddingHorizontal: 14,
    paddingBottom: 24,
    fontSize: 9,
    fontFamily: "Courier",
    color: "#000",
    lineHeight: 1.4,
  },

  center: {
    textAlign: "center",
    alignItems: "center",
  },

  logo: {
    height: 30,
    objectFit: "contain",
    marginBottom: 10,
    opacity: 0.9,
  },

  storeInfo: {
    fontSize: 8,
    color: "#444",
  },

  divider: {
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "dashed",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  bold: {
    fontFamily: "Courier-Bold",
  },

  itemContainer: {
    marginBottom: 6,
  },

  itemName: {
    fontFamily: "Courier-Bold",
    marginBottom: 1,
  },

  itemSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#333",
  },

  totalSection: {
    marginTop: 4,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },

  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#000",
    borderTopStyle: "dashed",
    fontSize: 11,
    fontFamily: "Courier-Bold",
  },

  footer: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 8,
    color: "#555",
  },

  noteText: {
    fontSize: 7,
    marginTop: 1,
    color: "#666",
  },
});

interface ReceiptProps {
  transactionId: number;
  items: (TransactionItemInput & { product: Product })[];
  totalAmount: number;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

const Receipt = ({
  transactionId,
  items,
  totalAmount,
  paymentMethod,
  notes,
  createdAt,
}: ReceiptProps) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Document>
      <Page size={[226, 600]} style={styles.page}>
        {/* Store Header */}
        <View style={styles.center}>
          {/* <PDFImage src={courtlabGrayscale} style={styles.logo} /> */}

          <Text style={styles.storeInfo}>Jl. Example Street No. 123</Text>

          <Text style={styles.storeInfo}>Jakarta, Indonesia</Text>

          <Text style={styles.storeInfo}>0812-3456-7890</Text>
        </View>

        <View style={styles.divider} />

        {/* Transaction Info */}
        <View>
          <View style={styles.row}>
            <Text>Receipt</Text>
            <Text>#{transactionId}</Text>
          </View>

          <View style={styles.row}>
            <Text>Date</Text>
            <Text>{new Date(createdAt).toLocaleDateString("id-ID")}</Text>
          </View>

          <View style={styles.row}>
            <Text>Time</Text>
            <Text>{new Date(createdAt).toLocaleTimeString("id-ID")}</Text>
          </View>

          <View style={styles.row}>
            <Text>Payment</Text>

            <Text style={styles.bold}>{paymentMethod.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items */}
        <View>
          {items.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemName}>{item.product.name}</Text>

              <View style={styles.itemSubRow}>
                <Text>
                  {item.quantity} x {formatIDR(item.unit_price)}
                </Text>

                <Text>{formatIDR(item.quantity * item.unit_price)}</Text>
              </View>

              {item.notes && (
                <Text style={styles.noteText}>Note: {item.notes}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text>Total Items</Text>
            <Text>{totalItems}</Text>
          </View>

          <View style={styles.grandTotal}>
            <Text>TOTAL</Text>
            <Text>{formatIDR(totalAmount)}</Text>
          </View>
        </View>

        {/* Order Notes */}
        {notes && (
          <>
            <View style={styles.divider} />

            <Text style={{ fontSize: 8 }}>Notes: {notes}</Text>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for shopping!</Text>
          <Text>Please come again</Text>
        </View>
      </Page>
    </Document>
  );
};

export default Receipt;
