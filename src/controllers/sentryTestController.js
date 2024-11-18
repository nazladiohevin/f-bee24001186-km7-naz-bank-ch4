export default class SentryTestController {
  static sentryDebugTest1() {
    throw new Error("This is sentry error!");
  }

  static sentryDebugTest2() {
    throw new Error("You found an error, please wait a moment");
  }
}