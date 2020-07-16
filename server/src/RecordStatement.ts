/**
 * @public
 */
interface SaveStatement {
  ledgerId: string,
  recordType?: "transactions" | "accounts",
  highlight?: boolean
}