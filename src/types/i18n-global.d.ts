export {};

declare global {
  var t: (key: string) => string;

  interface GlobalThis {
    t: (key: string) => string;
  }
}