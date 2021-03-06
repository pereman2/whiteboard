import Line from "./Line";

var COMPOSITE_OPERATION_ERASE = 'destination-out';
var LINE_JOIN_ROUND = 'round';
var LINE_CAP_ROUND = 'round';

class Eraser extends Line {
    constructor(width, color, posActual, posAnterior){
        super(width, color, posActual, posAnterior);
    }

    draw = function() {
        if(!this.canvas) { throw new Error('No se ha asignado un canvas a la linea')}
        var rect = this.canvas.getBoundingClientRect();
        var mouseX = this.posActual.x - rect.left;
        var mouseY = this.posActual.y - rect.top;
        var lastX = this.posAnterior.x;
        var lastY = this.posAnterior.y;

        this.ctx.globalCompositeOperation = COMPOSITE_OPERATION_ERASE;
        this.ctx.moveTo(mouseX, mouseY);
        this.ctx.lineTo(lastX, lastY);
        //union de lineas round (mas natural)
        this.ctx.lineJoin = LINE_JOIN_ROUND;
        //forma de la linea
        this.ctx.lineCap = LINE_CAP_ROUND;
        this.ctx.lineWidth = this.width;
        //dibuja lo que se ha hecho en el path
        this.ctx.strokeStyle = this.color;
        this.ctx.stroke();
    }
}
export default Eraser;