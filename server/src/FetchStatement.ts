/**
 * @public
 */
interface FetchStatement {
  ledgerId: string,
  query?: string,
  rangeName?: string,
  fetchType?: "transactions" | "balances" | "accounts" | "groups",
  balanceType?: "CUMULATIVE" | "PERIOD" | "TOTAL" | "TRIAL",
  expanded?: boolean | number,
  transposed?: boolean,
  hideDates?: boolean,
  hideNames?: boolean,
  groups?: boolean,
  lastUpdate?: number
}
