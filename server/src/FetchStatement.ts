/**
 * @public
 */
interface FetchStatement {
  ledgerId: string,
  query?: string,
  rangeName?: string,
  fetchType?: "transactions" | "balances" | "accounts",
  balanceType?: "CUMULATIVE" | "PERIOD" | "TOTAL",
  expanded?: boolean,
  transposed?: boolean,
  hideDates?: boolean,
  lastUpdate?: number
}
