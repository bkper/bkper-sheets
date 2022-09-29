/**
 * @public
 */
interface SaveStatement {
  ledgerId: string,
  recordType?: "transactions" | "accounts" | "groups",
  highlight?: boolean
}