import React, { useRef, useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { useLocation, useNavigate } from 'react-router-dom';
import { EventRecord } from './EventTable';

interface EditorProps {
    event: EventRecord;
    editLog: string[];
    setEditLog: React.Dispatch<React.SetStateAction<string[]>>;
}

const ImageEditor: React.FC<EditorProps> = ({ event, editLog, setEditLog }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState(false);
    const [tool, setTool] = useState<'pen' | 'rect' | 'ellipse' | 'text'>('pen');
    const [color, setColor] = useState('#ff0000');
    const [text, setText] = useState('');
    const [shapes, setShapes] = useState<any[]>([]);
    const [start, setStart] = useState<{ x: number, y: number } | null>(null);
    const [currentShape, setCurrentShape] = useState<any>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = event.fullImageUrl || event.snapshotUrl;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            shapes.forEach(shape => drawShape(ctx, shape));
            if (currentShape) drawShape(ctx, currentShape);
        };
    }, [event, shapes, currentShape]);

    const drawShape = (ctx: CanvasRenderingContext2D, shape: any) => {
        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.fillStyle = shape.color;
        ctx.lineWidth = 2;
        if (shape.type === 'pen') {
            ctx.beginPath();
            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            shape.points.forEach((pt: any) => ctx.lineTo(pt.x, pt.y));
            ctx.stroke();
        } else if (shape.type === 'rect') {
            ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
        } else if (shape.type === 'ellipse') {
            ctx.beginPath();
            ctx.ellipse(shape.x + shape.w / 2, shape.y + shape.h / 2, Math.abs(shape.w / 2), Math.abs(shape.h / 2), 0, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (shape.type === 'text') {
            ctx.font = '20px Arial';
            ctx.fillText(shape.text, shape.x, shape.y);
        }
        ctx.restore();
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setDrawing(true);
        setStart({ x, y });
        if (tool === 'pen') {
            setCurrentShape({ type: 'pen', color, points: [{ x, y }] });
            setEditLog(log => [...log, `Started pen at (${x.toFixed(0)}, ${y.toFixed(0)}) with color ${color}`]);
        } else if (tool === 'text') {
            setShapes([...shapes, { type: 'text', color, x, y, text }]);
            setEditLog(log => [...log, `Added text '${text}' at (${x.toFixed(0)}, ${y.toFixed(0)}) with color ${color}`]);
            setText('');
            setDrawing(false);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!drawing || !start) return;
        const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (tool === 'pen') {
            setCurrentShape((prev: any) => ({ ...prev, points: [...prev.points, { x, y }] }));
        } else if (tool === 'rect') {
            setCurrentShape({ type: 'rect', color, x: start.x, y: start.y, w: x - start.x, h: y - start.y });
            setEditLog(log => log.length && log[log.length - 1].startsWith('Drawing rect') ? log.slice(0, -1).concat([`Drawing rect from (${start.x.toFixed(0)}, ${start.y.toFixed(0)}) to (${x.toFixed(0)}, ${y.toFixed(0)}) with color ${color}`]) : log.concat([`Drawing rect from (${start.x.toFixed(0)}, ${start.y.toFixed(0)}) to (${x.toFixed(0)}, ${y.toFixed(0)}) with color ${color}`]));
        } else if (tool === 'ellipse') {
            setCurrentShape({ type: 'ellipse', color, x: start.x, y: start.y, w: x - start.x, h: y - start.y });
            setEditLog(log => log.length && log[log.length - 1].startsWith('Drawing ellipse') ? log.slice(0, -1).concat([`Drawing ellipse from (${start.x.toFixed(0)}, ${start.y.toFixed(0)}) to (${x.toFixed(0)}, ${y.toFixed(0)}) with color ${color}`]) : log.concat([`Drawing ellipse from (${start.x.toFixed(0)}, ${start.y.toFixed(0)}) to (${x.toFixed(0)}, ${y.toFixed(0)}) with color ${color}`]));
        }
    };

    const handleMouseUp = () => {
        if (currentShape) {
            setShapes([...shapes, currentShape]);
            if (currentShape.type === 'rect') {
                setEditLog(log => [...log, `Finished rect at (${currentShape.x.toFixed(0)}, ${currentShape.y.toFixed(0)}) size (${currentShape.w.toFixed(0)}, ${currentShape.h.toFixed(0)}) color ${currentShape.color}`]);
            } else if (currentShape.type === 'ellipse') {
                setEditLog(log => [...log, `Finished ellipse at (${currentShape.x.toFixed(0)}, ${currentShape.y.toFixed(0)}) size (${currentShape.w.toFixed(0)}, ${currentShape.h.toFixed(0)}) color ${currentShape.color}`]);
            } else if (currentShape.type === 'pen') {
                setEditLog(log => [...log, `Finished pen stroke with ${currentShape.points.length} points color ${currentShape.color}`]);
            }
        }
        setCurrentShape(null);
        setDrawing(false);
        setStart(null);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'edited-image.png';
        a.click();
        setEditLog(log => [...log, 'Saved image as PNG']);
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Absolute positioned toolbar at top */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex flex-nowrap gap-2 items-center justify-center bg-gray-900/95 backdrop-blur-md px-6 py-3 rounded-xl border-2 border-gray-700 shadow-2xl">
                <button
                    className={`px-3 py-2 rounded-lg font-bold border-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg hover:shadow-xl transform hover:scale-105 ${tool === 'pen' ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-blue-600 hover:border-blue-500'}`}
                    title="Freehand Pen Tool"
                    onClick={() => setTool('pen')}
                >
                    Pen
                </button>
                <button
                    className={`px-3 py-2 rounded-lg font-bold border-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg hover:shadow-xl transform hover:scale-105 ${tool === 'rect' ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-blue-600 hover:border-blue-500'}`}
                    title="Draw Rectangle"
                    onClick={() => setTool('rect')}
                >
                    Rect
                </button>
                <button
                    className={`px-3 py-2 rounded-lg font-bold border-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg hover:shadow-xl transform hover:scale-105 ${tool === 'ellipse' ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-blue-600 hover:border-blue-500'}`}
                    title="Draw Ellipse"
                    onClick={() => setTool('ellipse')}
                >
                    Ellipse
                </button>
                <button
                    className={`px-3 py-2 rounded-lg font-bold border-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg hover:shadow-xl transform hover:scale-105 ${tool === 'text' ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-blue-600 hover:border-blue-500'}`}
                    title="Add Text"
                    onClick={() => setTool('text')}
                >
                    Text
                </button>
                <label className="flex items-center gap-2 text-gray-300 font-bold bg-gray-700 px-3 py-2 rounded-lg border-2 border-gray-600 shadow-lg">
                    <span>Color:</span>
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-7 h-7 border-2 border-gray-400 rounded-lg cursor-pointer shadow-md" />
                </label>
                {tool === 'text' && (
                    <input
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Enter text"
                        className="px-3 py-2 rounded-lg border-2 border-gray-500 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg font-medium w-40"
                    />
                )}
                <button
                    onClick={handleSave}
                    className="px-3 py-2 rounded-lg font-bold border-2 border-green-500 bg-green-600 text-white shadow-lg hover:shadow-green-500/50 hover:bg-green-500 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
                    title="Save as PNG"
                >
                    Save
                </button>
                <button
                    onClick={() => {
                        setShapes(shapes.slice(0, -1));
                        setEditLog(log => [...log, 'Undo last shape']);
                    }}
                    className="px-3 py-2 rounded-lg font-bold border-2 border-yellow-500 bg-yellow-600 text-white shadow-lg hover:shadow-yellow-500/50 hover:bg-yellow-500 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    title="Undo last shape"
                    disabled={shapes.length === 0}
                >
                    Undo
                </button>
                <button
                    onClick={() => {
                        setShapes([]);
                        setEditLog(log => [...log, 'Cleared all shapes']);
                    }}
                    className="px-3 py-2 rounded-lg font-bold border-2 border-red-500 bg-red-600 text-white shadow-lg hover:shadow-red-500/50 hover:bg-red-500 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                    title="Clear all shapes"
                    disabled={shapes.length === 0}
                >
                    Clear
                </button>
            </div>

            {/* Canvas centered */}
            <canvas
                ref={canvasRef}
                width={1200}
                height={800}
                className="border-4 border-gray-600 rounded-xl bg-black shadow-2xl cursor-crosshair"
                style={{ cursor: tool === 'text' ? 'text' : 'crosshair', width: '100%', height: '100%', objectFit: 'contain' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {/* Bottom info bar */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-3 items-center bg-gray-900/95 backdrop-blur-md px-6 py-2 rounded-xl border-2 border-gray-700 shadow-2xl">
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg font-semibold border border-gray-600 shadow-md text-sm">Shapes: {shapes.length}</span>
            </div>
        </div>
    );
};


const EventDetailPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const event = (location.state as { event: EventRecord })?.event;
    const [description, setDescription] = useState(event?.details || '');
    const [editLog, setEditLog] = useState<string[]>([]);
    // const imageEditorRef = useRef<HTMLCanvasElement>(null);

    // Professional PDF download from image editor
    const handleDownloadPDF = () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Dark blue gradient header
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 80, 'F');

        // Accent stripe
        doc.setFillColor(59, 130, 246); // blue-500
        doc.rect(0, 80, pageWidth, 4, 'F');

        // Company logo/title area
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(32);
        doc.text('Nextcore ', 40, 45);

        // Subtitle
        doc.setFontSize(14);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text('Event Detection & Analysis Report', 40, 65);

        // Report ID and timestamp in header
        doc.setFontSize(10);
        doc.setTextColor(203, 213, 225); // slate-300
        doc.text(`Report ID: ${event.objectId}`, pageWidth - 200, 35);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 200, 50);
        doc.text(`Classification: ${event.classification}`, pageWidth - 200, 65);

        // Main content area with white background
        const contentY = 100;
        doc.setFillColor(255, 255, 255);
        doc.rect(0, contentY, pageWidth, pageHeight - contentY - 60, 'F');

        // Event image with border
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 420;
        const imgHeight = 280;
        const imgX = 40;
        const imgY = contentY + 20;

        // Image border
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(2);
        doc.rect(imgX - 2, imgY - 2, imgWidth + 4, imgHeight + 4, 'S');
        doc.addImage(imgData, 'PNG', imgX, imgY, imgWidth, imgHeight, undefined, 'FAST');

        // Image caption
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.setFont('helvetica', 'italic');
        doc.text('Annotated Event Image', imgX, imgY + imgHeight + 15);

        // Event Details Section
        const detailsX = imgX + imgWidth + 40;
        const detailsY = contentY + 20;

        // Section title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        doc.text('EVENT DETAILS', detailsX, detailsY);

        // Divider line under title
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(1.5);
        doc.line(detailsX, detailsY + 5, pageWidth - 40, detailsY + 5);

        // Details grid
        const details = [
            ['Classification', event.classification],
            ['Object ID', event.objectId],
            ['Detection Date', new Date(event.timestamp).toLocaleString()],
            ['Confidence Score', `${event.confidence}%`],
            ['Status', 'Reviewed'],
        ];

        let rowY = detailsY + 30;
        details.forEach(([label, value]) => {
            // Label
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105); // slate-600
            doc.text(label + ':', detailsX, rowY);

            // Value
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(15, 23, 42);
            const textWidth = doc.getTextWidth(label + ':');
            doc.text(String(value), detailsX + textWidth + 10, rowY);

            rowY += 25;
        });

        // Description section
        if (description) {
            rowY += 10;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(71, 85, 105);
            doc.text('Description:', detailsX, rowY);

            rowY += 18;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            const maxWidth = pageWidth - detailsX - 40;
            const lines = doc.splitTextToSize(description, maxWidth);
            doc.text(lines, detailsX, rowY);
        }

        // Footer area
        const footerY = pageHeight - 40;
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(1);
        doc.line(40, footerY - 15, pageWidth - 40, footerY - 15);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('© 2026 Nextcore - Confidential', 40, footerY);

        doc.setTextColor(148, 163, 184);
        doc.text(`Page 1 of 1`, pageWidth - 80, footerY);

        // Save with descriptive filename
        const filename = `Event_${event.objectId}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    };


    if (!event) return <div className="p-8 text-red-500">No event data provided.</div>;
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col z-50">
            <div className="flex items-center justify-between px-8 py-5 border-b-2 border-blue-500/30 bg-gray-900/80 backdrop-blur-sm shadow-xl flex-shrink-0">
                <button className="px-6 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all font-semibold tracking-wide shadow-lg hover:shadow-xl transform hover:scale-105" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <h2 className="text-5xl font-extrabold text-white font-sans tracking-tight drop-shadow-2xl">
                    Event Detail <span className="text-blue-400">& Image Editor</span>
                </h2>
                <div className="w-24"></div>
            </div>
            <div className="flex flex-col lg:flex-row flex-1 gap-3 p-3 min-h-0">
                <div className="flex-shrink-0 w-full lg:w-64 space-y-3 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-gray-700/50 overflow-y-auto max-h-full">
                    <div>
                        <button
                            onClick={handleDownloadPDF}
                            className="w-full px-3 py-2 rounded-lg font-bold border-2 border-blue-500 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-blue-500/50 hover:from-blue-500 hover:to-blue-400 transition-all transform hover:scale-105 text-sm"
                            title="Download Professional PDF Report"
                        >
                            PDF Report
                        </button>
                    </div>
                    <div>
                        <label className="block text-gray-300 font-semibold mb-1 text-xs uppercase tracking-wider">Classification</label>
                        <div className="px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg text-white font-medium border border-gray-700 shadow-inner">{event.classification}</div>
                    </div>
                    <div>
                        <label className="block text-gray-300 font-semibold mb-2 text-sm uppercase tracking-wider">Object ID</label>
                        <div className="px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg text-white font-medium border border-gray-700 shadow-inner">{event.objectId}</div>
                    </div>
                    <div>
                        <label className="block text-gray-300 font-semibold mb-2 text-sm uppercase tracking-wider">Date</label>
                        <div className="px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg text-white font-medium border border-gray-700 shadow-inner">{new Date(event.timestamp).toLocaleString()}</div>
                    </div>
                    <div>
                        <label className="block text-gray-300 font-semibold mb-2 text-sm uppercase tracking-wider">Score</label>
                        <div className="px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg text-white font-medium border border-gray-700 shadow-inner">{event.confidence}%</div>
                    </div>
                    <div>
                        <label className="block text-gray-300 font-bold mb-1 text-xs uppercase tracking-wider">Description</label>
                        <textarea
                            className="w-full min-h-[60px] px-3 py-2 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-sm resize-vertical shadow-lg placeholder-gray-500 transition-all"
                            placeholder="Add description..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 font-semibold mb-1 text-xs uppercase tracking-wider">Edit Log</label>
                        <textarea
                            className="w-full min-h-[50px] px-2 py-2 rounded-lg border-2 border-gray-600 bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
                            value={editLog.join('\n')}
                            readOnly
                        />
                    </div>
                </div>
                <div className="flex-1 min-h-0 min-w-0">
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-2 border-2 border-gray-700/50">
                        <ImageEditor event={event} editLog={editLog} setEditLog={setEditLog} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetailPage;
