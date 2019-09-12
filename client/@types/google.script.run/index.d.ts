declare namespace google {
  namespace script {
    interface Runner {
      withSuccessHandler(handler: Function): Runner;
      withFailureHandler(handler: (error: Error) => void): Runner;
      withUserObject(object: any): Runner;
    }
    export var run: Runner;
  }
}