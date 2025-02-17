"use client";
import { useEffect, useRef, useReducer, useState } from "react";
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
import ArtBoradStyles from "@/utils/Styles";


// Initial State
const initialState: State = { shapes: [], history: [], index: -1 };

const CanvasEditorPage = () => {

  const [state, dispatch] = useReducer(reducer, initialState);
  const canvasRef = useRef<CanvasEditor | null>(null);
  const [isDraw, setIsDraw] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = new CanvasEditor("fabricCanvas", dispatch, state);
    }

    return () => {
      canvasRef.current = null;
    };
  }, []);


  useEffect(() => {

    if (isDraw) {
      canvasRef.current?.updateCanvas(state);
    }

    return () => {
      setIsDraw(false)
    }
  }, [isDraw])



  const addShape = (type: "rectangle" | "circle") => canvasRef.current?.addShape(type);
  const deleteShape = () => canvasRef.current?.deleteShape()
  const clearCanvas = () => canvasRef.current?.clearCanvas();
  const downloadCanvas = () => canvasRef.current?.downloadCanvas();

  const undo = () => {
    dispatch({ type: "UNDO" })
    setIsDraw(true)
  }

  const redo = () => {
    dispatch({ type: "REDO" })
    setIsDraw(true)
  }

  const toolsGenerator = [
    {
      icon: <FaSquare />,
      title: "Rectangle",
      fn: ()=> addShape("rectangle")
    },
    {
      icon: <FaCircle />,
      title: "Circle",
      fn: ()=> addShape("circle")
    },
    {
      icon: <FaUndo />,
      title: "Undo",
      fn: undo
    },
    {
      icon: <FaRedo />,
      title: "Redo",
      fn: redo
    },
    {
      icon: <FaTrash />,
      title: "Delete Shape",
      fn: deleteShape
    },
    {
      icon: <FaEraser />,
      title: "Clear All Permanently",
      fn: clearCanvas
    },
    {
      icon: <FaDownload />,
      title: "Download",
      fn: downloadCanvas
    },
  ];


  return (
    <div className="flex flex-col items-center p-4">

      <div className="flex gap-2 mb-4">
        {
          toolsGenerator.map(({fn, title, icon}, index) => (
            <button key={index} onClick={fn} title={title} className="p-2 bg-gray-300 rounded">
              {icon}
            </button>
          ))
        }
      </div>


      <div style={{
        position: 'relative',
        ...ArtBoradStyles.common
      }}>
        <div style={{ ...ArtBoradStyles.parent }}></div>

        <canvas
          id="fabricCanvas"
          className="border border-t-s-cyan-950 shadow-lg"
          width={ArtBoradStyles.common.width}
          height={ArtBoradStyles.common.height}
          style={{ ...ArtBoradStyles.canvas }}>
        </canvas>

      </div>

    </div>
  );
};

export default CanvasEditorPage;
