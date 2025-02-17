import { Action, State } from "@/types/types";
import * as fabric from "fabric";


class CanvasEditor {
    
  private canvas: fabric.Canvas;
  private state: State;
  private dispatch: React.Dispatch<Action>;

  constructor(canvasElementId: string, dispatch: React.Dispatch<Action>, initialState: State) {
    this.canvas = new fabric.Canvas(canvasElementId, {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      selection: true,
    });

    this.state = initialState;

    this.dispatch = dispatch;
    this.loadCanvas();
    this.addCanvasEvents();

  }

  private getId(id=null){
    return id || String(Date.now());
  }

  private addCanvasEvents() {
    this.canvas.on("object:modified", (e: any) => {
      const updatedShape = e.target;
      if (updatedShape && updatedShape.data) {
        this.dispatch({ type: "UPDATE_SHAPE", shape: updatedShape, cb: this.saveCanvas });
      }
    });
  }
  

  private loadCanvas() {
    const savedData = localStorage.getItem("canvasData");
    if (savedData) {
      const loadedShapes = JSON.parse(savedData).map((obj: any) =>
        obj.type === "Rect" ? new fabric.Rect(obj) : new fabric.Circle(obj)
      );

      this.dispatch({ type: "LOAD", shapes: loadedShapes });
      this.updateCanvas(this.getShapes(loadedShapes))
    }
  }

  private getShapes(shapes:any[]=[]){
    return {
      ...this.state,
      index: 0,
      shapes: shapes,
      history: [shapes]
    };

  }

  private addCircle(shapeColor="red"){
    return new fabric.Circle({
        left: 50,
        top: 50,
        radius: 50,
        fill: shapeColor,
        data: { id: this.getId() },
        hasControls: true,
    });
  }

  private addRect(shapeColor="yellow"){
    return new fabric.Rect({
        left: 50,
        top: 50,
        width: 100,
        height: 100,
        fill: shapeColor,
        data: { id: this.getId() },
        hasControls: true,
    });
  }

  public addShape(type: "rectangle" | "circle") {
    let shape: fabric.Rect | fabric.Circle & { data?: { id: string } };

    if (type === "rectangle") {
      shape = this.addRect();
    } else {
      shape = this.addCircle();
    }

    this.dispatch({ type: "ADD_SHAPE", shape });
    this.saveCanvas([...this.state.shapes, shape]);

    this.canvas.add(shape);
    this.canvas.setActiveObject(shape);
    this.canvas.renderAll();
  }

  public deleteShape() {
    const activeObject = this.canvas.getActiveObject() as any;

    if (activeObject?.data?.id) {
      this.dispatch({ type: "DELETE_SHAPE", id: activeObject.data.id });
      const filteredShapes = this.state.shapes.filter((shape) => shape.data?.id !== activeObject.data.id);
      this.saveCanvas(filteredShapes);
      this.canvas.remove(activeObject);
    }
  }

  public clearCanvas() {
    this.dispatch({ type: "CLEAR_ALL" });
    localStorage.removeItem("canvasData");
    this.canvas.clear();
  }

  private saveCanvas(shapes: any[]) {
    localStorage.setItem("canvasData", JSON.stringify(shapes.map((s) => {
      return {...s.toObject(), data: s?.data || null}
    })));
  }

  public downloadCanvas() {
    const dataURL = this.canvas.toDataURL({ format: "png", multiplier: 1 });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "design.png";
    link.click();
  }
  
  public updateCanvas(state:State|null = null) {
    this.canvas.clear();
    if(state !== null) this.state = state

    const updatedShapes:any = [];

    this.state.shapes.forEach((shape) => {
      const existingShape = this.canvas.getObjects().find((obj) => (obj as any).data?.id === shape.data?.id);

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

        fabricShape.set({ data: { id: this.getId(shape.data?.id) } });

        updatedShapes.push(fabricShape);
        this.canvas.add(fabricShape);
      }
    });

    this.canvas.renderAll();

    this.saveCanvas(updatedShapes)
  }
}

export default CanvasEditor
