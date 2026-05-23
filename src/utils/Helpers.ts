export const truncate = (text: string, limit: number): string =>
  text?.length > limit ? text.slice(0, limit) + "…" : (text ?? "—");

export const formatIDR = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
