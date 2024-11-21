// Import CSS for styling
import "./style.css";

// Application constants
const APP_NAME = "Draw Please Queen!";
const CANVAS_WIDTH = 256; // Width of the drawing canvas
const CANVAS_HEIGHT = 256; // Height of the drawing canvas
const EXPORT_WIDTH = 1024; // Width of the canvas when exporting the drawing
const EXPORT_HEIGHT = 1024; // Height of the canvas when exporting the drawing

// Set the title of the document
document.title = APP_NAME;

// Drawing modes to distinguish between using a marker or placing a sticker
enum DRAW_MODES {
  MARKER,
  STICKER,
}

// Drawable interface for elements that can be drawn and interacted with on the canvas
interface Drawable {
  draw(ctx: CanvasRenderingContext2D): void; // Method to draw the element
  drag(x: number, y: number): void; // Method to update element position
}

// Class for drawing lines on the canvas
class MarkerLine implements Drawable {
  private points: { x: number; y: number }[] = [];

  constructor(
    private x: number,
    private y: number,
    private color: string,
    private size: number
  ) {
    this.points.push({ x, y });
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.size;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    this.points.forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.stroke();
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }
}

// Class for placing sticker emojis on the canvas
class Sticker implements Drawable {
  constructor(private x: number, private y: number, private emoji: string) {}

  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px Arial";
    ctx.fillText(this.emoji, this.x, this.y);
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// Setup canvas element for drawing
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("Failed to get the drawing context"); // Ensure the drawing context is available
}

const assuredCtx: CanvasRenderingContext2D = ctx; // Use the assured context for drawing operations

const STARTING_BRUSH_COLOR = "black";
const STARTING_BRUSH_SIZE = 5;

const drawing: Drawable[] = [];
let currentMode: DRAW_MODES = DRAW_MODES.MARKER;
let currentColor = STARTING_BRUSH_COLOR;
let currentSize = STARTING_BRUSH_SIZE;
let currentEmoji = "😊";

// Predefined list of emojis for stickers
const emojis = [
  "😊",
  "😂",
  "❤️",
  "👍",
  "😒",
  "😎",
  "👏",
  "😢",
  "🔥",
  "🌈",
  "🍕",
  "🚗",
  "📅",
  "🏀",
  "🎲",
];

canvas.addEventListener("mousedown", (event) => {
  const x = event.offsetX;
  const y = event.offsetY;
  if (currentMode === DRAW_MODES.MARKER) {
    const line = new MarkerLine(x, y, currentColor, currentSize);
    drawing.push(line);
  } else if (currentMode === DRAW_MODES.STICKER) {
    const sticker = new Sticker(x, y, currentEmoji);
    drawing.push(sticker);
  }
});

canvas.addEventListener("mousemove", (event) => {
  if (event.buttons) {
    const x = event.offsetX;
    const y = event.offsetY;
    drawing[drawing.length - 1].drag(x, y);
    redrawCanvas();
  }
});

canvas.addEventListener("mouseup", redrawCanvas);

// Function to clear and redraw the canvas
function redrawCanvas() {
  assuredCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawing.forEach((drawable) => drawable.draw(assuredCtx));
}

// Creating and configuring UI elements below the canvas
const buttonContainer = document.createElement("div");
document.body.appendChild(buttonContainer);

// Add a title above the canvas
const title = document.createElement("h1");
title.textContent = APP_NAME;
document.body.insertBefore(title, canvas);

const topButtonContainer = document.createElement("div");
document.body.insertBefore(topButtonContainer, canvas);

const markerButton = document.createElement("button");
markerButton.textContent = "Marker";
markerButton.onclick = () => {
  currentMode = DRAW_MODES.MARKER;
};
topButtonContainer.appendChild(markerButton);

const emojiSelector = document.createElement("select");
emojis.forEach((emoji) => {
  const option = document.createElement("option");
  option.value = emoji;
  option.textContent = emoji;
  emojiSelector.appendChild(option);
});
emojiSelector.onchange = () => {
  currentEmoji = emojiSelector.value;
  currentMode = DRAW_MODES.STICKER; // Switch to sticker mode when selecting an emoji
};

const colorPicker = document.createElement("input");
colorPicker.type = "color";
colorPicker.value = "#000000";
colorPicker.oninput = () => {
  currentColor = colorPicker.value;
};

const sizePicker = document.createElement("input");
sizePicker.type = "range";
sizePicker.min = "1";
sizePicker.max = "10";
sizePicker.value = "5";
sizePicker.oninput = () => {
  currentSize = parseInt(sizePicker.value);
};

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.onclick = () => {
  if (drawing.length > 0) {
    drawing.pop();
    redrawCanvas();
  }
};

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.onclick = () => {
  drawing.length = 0;
  redrawCanvas();
};

topButtonContainer.appendChild(emojiSelector);
topButtonContainer.appendChild(colorPicker);
topButtonContainer.appendChild(sizePicker);

buttonContainer.appendChild(undoButton);
buttonContainer.appendChild(clearButton);

const exportButton = document.createElement("button");
exportButton.textContent = "Export";
exportButton.onclick = () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = EXPORT_WIDTH;
  exportCanvas.height = EXPORT_HEIGHT;
  const exportCtx = exportCanvas.getContext("2d");
  if (exportCtx) {
    exportCtx.fillStyle = "white";
    exportCtx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
    exportCtx.drawImage(canvas, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
    const dataURL = exportCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "export.png";
    link.click();
  }
};
buttonContainer.appendChild(exportButton);
