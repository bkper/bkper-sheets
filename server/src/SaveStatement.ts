/**
 * @public
 */
interface SaveStatement {
  ledgerId: string,
  saveType?: "transactions" | "accounts",
  highlight?: boolean
}