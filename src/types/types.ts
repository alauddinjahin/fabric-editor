import * as fabric from "fabric"; // import fabric to use fabric types

export interface State {
  shapes: any[]; 
  history: any[];
  index: number;
}

// Define Action Types
export type Action =
  | { type: "ADD_SHAPE"; shape: fabric.Rect | fabric.Circle }
  | { type: "DELETE_SHAPE"; id: string }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "CLEAR_ALL" }
  | { type: "LOAD"; shapes: (fabric.Rect | fabric.Circle)[] }
  | { type: "UPDATE_SHAPE"; shape: fabric.Object & { data?: { id: string } } };
