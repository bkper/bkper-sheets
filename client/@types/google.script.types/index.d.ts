declare namespace google {

    namespace script {

        export interface Runner {

            withSuccessHandler(handler: Function): Runner;

            withFailureHandler(handler: (error: Error) => void): Runner;

            withUserObject(object: any): Runner;

            checkUserAuthorized(): void //void;

            enableAutoRecord(enable: boolean): void //AutorecordConfig;

            fetchQuery(fetchStatement: FetchStatement): void //void;

            insertBookId(bookId: string): void //void;

            loadAutoRecordConfig(): void //AutorecordConfig;

            loadBookId(): void //string;

            loadLedgers(): void;

            loadQueries(ledgerId: string): void //LedgerQueries;

            saveLastSelectedLedger(ledgerId: string): void //void;

            saveLines(saveStatement: SaveStatement): void //boolean;

        }

        export interface AutorecordConfig {

            bookName: string;

            enabled: boolean;

        }

        export interface ClientBook {

            id: string;

            name: string;

            selected: boolean;

            viewer: boolean;

        }

        export interface FetchStatement {

            balanceType?: "CUMULATIVE" | "PERIOD" | "TOTAL" | "TRIAL";

            expanded?: boolean;

            fetchType?: "transactions" | "balances" | "accounts" | "groups";

            groups?: boolean;

            hideDates?: boolean;

            hideNames?: boolean;

            ids?: boolean;

            lastUpdate?: number;

            ledgerId: string;

            properties?: boolean;

            query?: string;

            rangeName?: string;

            transposed?: boolean;

        }

        export interface LedgerQueries {

            ledgerId: string;

            queries: Query[];

        }

        export interface Query {

            category?: string;

            query?: string;

            title?: string;

        }

        export interface SaveStatement {

            highlight?: boolean;

            ledgerId: string;

            recordType?: "transactions" | "accounts";

        }

        export var AUTORECORD_TRIGGER_FUNCTION: string;

        export var AUTO_RECORD_BINDER_PREFIX: string;

        export var BALANCE_TYPE_CUMULATIVE_: string;

        export var BALANCE_TYPE_PERIOD_: string;

        export var BALANCE_TYPE_TOTAL_: string;

        export var BALANCE_TYPE_TRIAL_: string;

        export var LAST_UPDATE_KEY: string;

        export var LEDGER_LAST_UPDATE_PREFIX_: string;

        export var QUERY_CATEGORY_ACCOUNT_: string;

        export var QUERY_CATEGORY_GROUP_: string;

        export var QUERY_CATEGORY_SAVED_: string;

        export var RECORD_BACKGROUND_: string;

        export var run: Runner;

    }

}

