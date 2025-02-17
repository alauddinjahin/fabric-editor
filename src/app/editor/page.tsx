"use client";
import { useEffect, useRef, useReducer } from "react";
import {
  FaSquare,
  FaCircle,
  FaDownload,
  FaUndo,
  FaRedo,
  FaTrash,
  FaEraser,
} from "react-icons/fa";
import { State } from "@/types/types";
import reducer from "@/reducer";
import CanvasEditor from "@/utils/Editor";


// Initial State
const initialState: State = { shapes: [], history: [], index: -1 };

const CanvasEditorPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const canvasRef = useRef<CanvasEditor | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = new CanvasEditor("fabricCanvas", dispatch, state);
    } else {
      canvasRef.current.updateCanvas();
    }

    return () => {
      canvasRef.current = null;
    };
  }, []); 


  const addShape = (type: "rectangle" | "circle") => {
    canvasRef.current?.addShape(type);
  };

  const deleteShape = () => {
    canvasRef.current?.deleteShape();
  };

  const clearCanvas = () => {
    canvasRef.current?.clearCanvas();
  };

  const downloadCanvas = () => {
    canvasRef.current?.downloadCanvas();
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

export default CanvasEditorPage;
