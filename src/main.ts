// Import necessary styles
import "./style.css";

// Setup the canvas and its context
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
if (!canvas) {
    throw new Error('Canvas element not found');
}
const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('Failed to get the canvas context');
}

// Here, we're using the non-null assertion operator because we know ctx is not null past this point.
const context = ctx!;

// Retrieve buttons and assert their existence
const clearButton = document.getElementById('clearButton') as HTMLButtonElement;
const undoButton = document.getElementById('undoButton') as HTMLButtonElement;
const redoButton = document.getElementById('redoButton') as HTMLButtonElement;
const emojiSelector = document.getElementById('emojiSelector') as HTMLSelectElement;

// Define types for points and emojis
type Point = { x: number, y: number };
type EmojiPoint = { x: number, y: number, emoji: string };
type LineItem = Point | EmojiPoint;

// Setup state for drawing
let isDrawing = false;
let currentLine: LineItem[] = [];
let lines: LineItem[][] = [];
let undoStack: LineItem[][] = [];
let redoStack: LineItem[][] = [];

function startDrawing(event: MouseEvent) {
    isDrawing = true;
    currentLine = [];
    lines.push(currentLine);
    addPointOrEmoji(event);
}

function stopDrawing() {
    isDrawing = false;
    if (currentLine.length > 0) {
        undoStack.push([...currentLine]);
    }
}

function addPointOrEmoji(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const selectedEmoji = emojiSelector.value;

    if (selectedEmoji && selectedEmoji !== 'None') {
        currentLine.push({ x, y, emoji: selectedEmoji });
    } else {
        currentLine.push({ x, y });
    }
    redrawCanvas();
}

function redrawCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach(line => {
        context.beginPath();
        line.forEach((item, index) => {
            if ('emoji' in item) {
                context.font = '32px Arial'; // Adjust as needed
                context.fillText(item.emoji, item.x, item.y);
            } else {
                if (index === 0) context.moveTo(item.x, item.y);
                else context.lineTo(item.x, item.y);
                context.stroke();
            }
        });
    });
}

// Event listeners for mouse interactions
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', (event) => {
    if (isDrawing) {
        addPointOrEmoji(event);
    }
});

// Clear the canvas
clearButton.onclick = () => {
    lines = [];
    undoStack = [];
    redoStack = [];
    redrawCanvas();
};

// Undo the last action
undoButton.onclick = () => {
    if (undoStack.length > 0) {
        redoStack.push(undoStack.pop()!);
        lines.pop();
        redrawCanvas();
    }
};

// Redo the last undone action
redoButton.onclick = () => {
    if (redoStack.length > 0) {
        const lastLine = redoStack.pop()!;
        undoStack.push(lastLine);
        lines.push(lastLine);
        redrawCanvas();
    }
};
