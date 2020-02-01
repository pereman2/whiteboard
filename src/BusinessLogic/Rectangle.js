import Form from './Form';

var COMPOSITE_OPERATION_FORM = 'source-over'; 
var LINE_JOIN_ROUND = 'round';
var LINE_CAP_ROUND = 'round';

 class Rectangle extends Form {
    constructor(width, color, posActual){
        super(width, color, posActual);
    }

    draw() {
        if(!this.canvas) { throw new Error('No se ha asignado un canvas a la linea')}
        this.setAttributes();
        this.makeRect();
        this.ctx.stroke();
    }

    makeRect() {
        var rect = this.canvas.getBoundingClientRect();
        var mouseX = this.posActual.x - rect.left;
        var mouseY = this.posActual.y - rect.top;
        var lastX = this.posAnterior.x;
        var lastY = this.posAnterior.y;
        var height = mouseY - lastY;
        var width = mouseX - lastX;
        this.ctx.moveTo(mouseX, mouseY);
        this.ctx.rect(lastX, lastY, width, height)
    }

    setAttributes() {
        this.ctx.globalCompositeOperation = COMPOSITE_OPERATION_FORM; 
        this.ctx.lineWidth = this.width;
        this.ctx.strokeStyle = this.color;

    }

}
export default Rectangle;