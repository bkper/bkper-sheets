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
    /**
     */
    /**
     */
  }

}

