// type declaration for wink-sentiment package
// why: wink-sentiment doesn't have built-in typescript types
// how: declare module to tell typescript about the package

declare module "wink-sentiment" {
  export function sentiment(text: string): {
    score: number;
    tokens: string[];
  };
}

