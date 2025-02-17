import * as fabric from "fabric";

// Extending the fabric.Object type
declare module "fabric" {
  interface IObject {
    data?: {
      id: string;
      [key: string]: any;
    };
  }
}