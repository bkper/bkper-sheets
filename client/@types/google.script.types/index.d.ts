declare namespace google {

    namespace script {

        export interface Runner {

            withSuccessHandler(handler: Function): Runner;

            withFailureHandler(handler: (error: Error) => void): Runner;

            withUserObject(object: any): Runner;

            checkUserAuthorized(): void //void;

            enableAutoRecord(enable: boolean): void //AutorecordConfig;

            fetchQuery(fetchStatement: FetchStatement): void //void;

            loadAutoRecordConfig(): void //AutorecordConfig;

            loadLedgers(): void;

            loadQueries(ledgerId: string): void //LedgerQueries;

            recordLines(ledgerId: string, highlight: boolean): void //boolean;

            saveLastSelectedLedger(ledgerId: string): void //void;

        }

        export interface AutorecordConfig {

            bookName: string;

            enabled: boolean;

        }

        export interface FetchStatement {

            balanceType?: "CUMULATIVE" | "PERIOD" | "TOTAL";

            expanded?: boolean;

            fetchType?: "transactions" | "balances" | "accounts";

            hideDates?: boolean;

            lastUpdate?: number;

            ledgerId: string;

            query?: string;

            rangeName?: string;

            transposed?: boolean;

        }

        export interface LedgerQueries {

            ledgerId: string;

            queries: Query[];

        }

        export interface Query {

            category: string;

            query: string;

            title: string;

        }

        export var AUTORECORD_TRIGGER_FUNCTION: string;

        export var AUTO_RECORD_BINDER_PREFIX: string;

        export var BALANCE_TYPE_CUMULATIVE_: string;

        export var BALANCE_TYPE_PERIOD_: string;

        export var BALANCE_TYPE_TOTAL_: string;

        export var LAST_UPDATE_KEY: string;

        export var LEDGER_LAST_UPDATE_PREFIX_: string;

        export var QUERY_CATEGORY_ACCOUNT_: string;

        export var QUERY_CATEGORY_GROUP_: string;

        export var QUERY_CATEGORY_SAVED_: string;

        export var RECORD_BACKGROUND_: string;

        export var STATEMENT_PREFIX: string;

        export var run: Runner;

    }

}

