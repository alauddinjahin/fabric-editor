import { Action, State } from "@/types/types";

const reducer = (state: State, action: Action): State => {
  
    switch (action.type) {
      case "ADD_SHAPE": {
        const newShapes = [...state.shapes, action.shape];
        return {
          ...state,
          shapes: newShapes,
          history: [...state.history.slice(0, state.index + 1), newShapes],
          index: state.index + 1,
        };
      }

      case "DELETE_SHAPE": {
        const deletedShape = state.shapes.find((shape) => shape.data?.id === action.id);
        if (!deletedShape) return state;
      
        const filteredShapes = state.shapes.filter((shape) => shape.data?.id !== action.id);
        return {
          ...state,
          shapes: filteredShapes,
          history: [...state.history.slice(0, state.index + 1), filteredShapes],
          index: state.index + 1,
        };
      }
  
      case "UPDATE_SHAPE": {
        const updatedShapes = state.shapes.map((shape) =>
          shape.data?.id === action.shape.data?.id ? action.shape : shape
        );

        
        if(action?.cb) {
          action.cb(updatedShapes)
        }

        return {
          ...state,
          shapes: updatedShapes,
          history: [...state.history.slice(0, state.index + 1), updatedShapes],
          index: state.index + 1,
        };

      }
      
  
      case "UNDO":
        if (state.index > 0) {
          return {
            ...state,
            index: state.index - 1,
            shapes: [...state.history[state.index - 1]],
          };
        }
        return state;
  
      case "REDO":

        if (state.index < state.history.length - 1) {
          return {
            ...state,
            index: state.index + 1,
            shapes: [...state.history[state.index + 1]],
          };
        }
        return state;
  
      case "CLEAR_ALL":
        return { shapes: [], history: [[]], index: 0 };
  
      case "LOAD":
        return {
          ...state,
          index: 0,
          shapes: action.shapes,
          history: [action.shapes]
        };
  
      default:
        return state;
    }
  };

  export default reducer