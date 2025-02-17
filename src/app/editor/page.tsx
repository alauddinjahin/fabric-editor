"use client";
import { useEffect, useRef, useReducer } from "react";
import * as fabric from "fabric";
import {
  FaSquare,
  FaCircle,
  FaDownload,
  FaUndo,
  FaRedo,
  FaTrash,
  FaEraser,
} from "react-icons/fa";

// Define the State type
interface State {
  shapes: any[];
  history: any[];
  index: number;
}

// Define Action Types
type Action =
  | { type: "ADD_SHAPE"; shape: fabric.Rect | fabric.Circle }
  | { type: "DELETE_SHAPE"; id: string }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "CLEAR_ALL" }
  | { type: "LOAD"; shapes: (fabric.Rect | fabric.Circle)[] }
  | { type: "UPDATE_SHAPE"; shape: fabric.Object & { data?: { id: string } } };

// Initial State
const initialState: State = { shapes: [], history: [], index: -1 };

// Reducer Function
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
      const filteredShapes = state.shapes.filter((shape) => {
        console.log(shape.data?.id , action.id)
        return shape.data?.id !== action.id
      });

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
      return { shapes: action.shapes, history: [action.shapes], index: 0 };

    default:
      return state;
  }
};

const CanvasEditor = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const canvas = new fabric.Canvas("fabricCanvas", {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      selection: true,
    });
    canvasRef.current = canvas;

    // Add event listener for modified shapes
    // canvas.on("object:modified", (e: any) => {
    //   const updatedShape = e.target;
    //   if (updatedShape && updatedShape.data) {
    //     dispatch({ type: "UPDATE_SHAPE", shape: updatedShape });
    //     saveCanvas(state.shapes); // Update localStorage when shape is modified
    //   }
    // });

    loadCanvas();

    return () => {
      canvas.dispose();
    };
  }, []); // Empty dependency array ensures this effect only runs once on mount


  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
  
    // Only update shapes that need to be updated (i.e., not re-adding all of them)
    state.shapes.forEach((shape) => {
      const existingShape = canvas.getObjects().find((obj) => (obj as any).data?.id === shape.data?.id);
      
      let fabricShape: fabric.Rect | fabric.Circle;
      const shapeObj = shape.toObject();
  
      if (existingShape) {
        existingShape.set(shapeObj);
      } else {
        if (shape.type === "rect") {
          fabricShape = new fabric.Rect(shapeObj as fabric.TOptions<fabric.RectProps>);
        } else {
          fabricShape = new fabric.Circle(shapeObj as fabric.TOptions<fabric.CircleProps>);
        }
  
        fabricShape.set({ data: { id: shape.data?.id || String(Date.now()) } });
        canvas.add(fabricShape);
      }
    });
  
    canvas.renderAll();
  }, [state.shapes]);
  

  // useEffect(() => {
  //   if (!canvasRef.current) return;
  //   const canvas = canvasRef.current;
  //   canvas.clear();

  //   state.shapes.forEach((shape) => {
  //     let fabricShape: fabric.Rect | fabric.Circle;
  //     const shapeObj = shape.toObject();
  //     if (shape.type === "rect") {
  //       fabricShape = new fabric.Rect(shapeObj as fabric.TOptions<fabric.RectProps>);
  //     } else {
  //       fabricShape = new fabric.Circle(shapeObj as fabric.TOptions<fabric.CircleProps>);
  //     }

  //     fabricShape.set({ data: { id: shape.data?.id || String(Date.now()) } });

  //     canvas.add(fabricShape);
      
  //   });

  // }, [state.shapes]); // This effect is only triggered when `state.shapes` changes


  const loadCanvas = () => {
    const savedData = localStorage.getItem("canvasData");
    if (savedData) {
      const loadedShapes = JSON.parse(savedData).map((obj: any) =>
        obj.type === "rect" ? new fabric.Rect(obj) : new fabric.Circle(obj)
      );
      dispatch({ type: "LOAD", shapes: loadedShapes });
    }
  };

  const addShape = (type: "rectangle" | "circle") => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    let shape: fabric.Rect | fabric.Circle & { data?: { id: string } };

    if (type === "rectangle") {
      shape = new fabric.Rect({
        left: 50,
        top: 50,
        width: 100,
        height: 100,
        fill: "yellow",
        data: { id: String(Date.now()) },
        hasControls: true,
      });
    } else {
      shape = new fabric.Circle({
        left: 50,
        top: 50,
        radius: 50,
        fill: "red",
        data: { id: String(Date.now()) },
        hasControls: true,
      });
    }

    dispatch({ type: "ADD_SHAPE", shape });
    saveCanvas([...state.shapes, shape]);

    canvas.add(shape);
    canvasRef.current.setActiveObject(shape);
    canvasRef.current.renderAll();
  };

  const deleteShape = () => {
    if (!canvasRef.current) return;
    const activeObject = canvasRef.current.getActiveObject() as any;

    if (activeObject?.data?.id) {
      dispatch({ type: "DELETE_SHAPE", id: activeObject.data.id });
      const filteredShapes = state.shapes.filter((shape) => shape.data?.id !== activeObject.data.id);
      saveCanvas(filteredShapes);
      canvasRef.current.remove(activeObject);
    }
  };

  const clearCanvas = () => {
    dispatch({ type: "CLEAR_ALL" });
    localStorage.removeItem("canvasData");
  };

  const saveCanvas = (shapes: (fabric.Rect | fabric.Circle)[]) => {
    localStorage.setItem("canvasData", JSON.stringify(shapes.map((s) => s.toObject())));
  };



  const downloadCanvas = () => {
    if (!canvasRef.current) return;
    const dataURL = canvasRef.current.toDataURL({ format: "png", multiplier: 1 });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "design.png";
    link.click();
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="flex gap-2 mb-4">
        <button onClick={() => addShape("rectangle")} className="p-2 bg-gray-300 rounded">
          <FaSquare />
        </button>
        <button onClick={() => addShape("circle")} className="p-2 bg-gray-300 rounded">
          <FaCircle />
        </button>
        <button onClick={() => dispatch({ type: "UNDO" })} className="p-2 bg-gray-300 rounded">
          <FaUndo />
        </button>
        <button onClick={() => dispatch({ type: "REDO" })} className="p-2 bg-gray-300 rounded">
          <FaRedo />
        </button>
        <button onClick={deleteShape} className="p-2 bg-gray-300 rounded">
          <FaTrash />
        </button>
        <button onClick={clearCanvas} className="p-2 bg-gray-300 rounded">
          <FaEraser />
        </button>
        <button onClick={downloadCanvas} className="p-2 bg-gray-300 rounded">
          <FaDownload />
        </button>
      </div>
      <div style={{
        position: 'relative',
        width: '500px',
        height: '500px',
      }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'url(bg.jpg)',
            backgroundSize: 'cover',
            filter: 'blur(10px)', 
            zIndex: -1, 
          }}
        ></div>
        <canvas id="fabricCanvas" className="border shadow-lg" width={500} height={500} style={{ position: 'absolute', top: 0, left: 0 }}></canvas>
      </div>
    </div>
  );
};

export default CanvasEditor;
