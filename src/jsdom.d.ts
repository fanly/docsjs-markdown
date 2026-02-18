declare module "jsdom" {
  export class JSDOM {
    window: {
      DOMParser: typeof DOMParser;
    };
    constructor(html?: string);
  }
}
