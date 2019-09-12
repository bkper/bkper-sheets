declare namespace google {

  namespace script {

    export interface Runner {

      checkUserAuthorized(): void //void;

      enableAutoRecord(enable: boolean): void //AutorecordConfig;

      enableAutoUpdate(enable: boolean): void;

      fetchQuery(fetchStatement: FetchStatement): void //void;

      loadAutoUpdateConfig(): void;

      loadLedgers(): void;

      loadQueries(ledgerId: string): void //LedgerQueries;

      recordLines(ledgerId: string, highlight: boolean): void //boolean;

      saveLastSelectedLedger(ledgerId: string): void //void;

    }

    /**
     */
    export interface FetchStatement {

      balanceType: GoogleAppsScript.Bkper.BalanceType;

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

      queries: undefined;

    }

    /**
     */
    export interface Query {

      category: string;

      query: string;

      title: string;

    }

  }

}

