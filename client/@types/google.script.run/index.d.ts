declare namespace google {
  namespace script {
    interface Run {
      withSuccessHandler(handler: Function): Run;
      withFailureHandler(handler: Function): any;
    }
    export var run: Run;
  }
}