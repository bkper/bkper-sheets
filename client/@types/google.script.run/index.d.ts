declare namespace google {

    namespace script {

        export interface Runner {

            withSuccessHandler(handler: Function): Runner;

            withFailureHandler(handler: (error: Error) => void): Runner;

            withUserObject(object: any): Runner;

            checkUserAuthorized(): void //void;

            enableAutoRecord(enable: boolean): void //AutorecordConfig;

            enableAutoUpdate(enable: boolean): void;

            fetchQuery(fetchStatement: FetchStatement): void //void;

            loadAutoRecordConfig(): void //AutorecordConfig;

            loadAutoUpdateConfig(): void;

            loadLedgers(): void;

            loadQueries(ledgerId: string): void //LedgerQueries;

            recordLines(ledgerId: string, highlight: boolean): void //boolean;

            saveLastSelectedLedger(ledgerId: string): void //void;

        }

        /**
         */
        export interface AutorecordConfig {

            bookName: string;

            enabled: boolean;

        }

        /**
         */
        export interface FetchStatement {

            balanceType: "CUMULATIVE" | "PERIOD" | "TOTAL";

            fetchType: string;

            lastUpdate: number;

            ledgerId: string;

            query: string;

            rangeName: string;

        }

        /**
         */
        export interface LedgerQueries {

            ledgerId: string;

            queries: Query[];

        }

        /**
         */
        export interface Query {

            category: string;

            query: string;

            title: string;

        }

        export var run: Runner;

    }

}

