/**
 * @public
 */
interface FetchStatement {
  ledgerId: string,
  query?: string,
  rangeName?: string,
  fetchType?: "transactions" | "balances" | "accounts",
  balanceType?: "CUMULATIVE" | "PERIOD" | "TOTAL" | "TRIAL",
  expanded?: boolean,
  transposed?: boolean,
  hideDates?: boolean,
  properties?: boolean,
  ids?: boolean,
  lastUpdate?: number
}
