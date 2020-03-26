import Form from './Form';

const COMPOSITE_OPERATION_FORM = 'source-over'; 
const STARTING_ANGLE = 0 * Math.PI;
const ENDING_ANGLE = 2 * Math.PI;

 class Circle extends Form {
    constructor(width, color, posActual){
        super(width, color, posActual);
    }

    draw() {
        if(!this.canvas) { throw new Error('No se ha asignado un canvas a la linea')}
        this.setAttributes();
        this.makeCircle();
        this.ctx.stroke();
    }

    makeCircle() {
        var center = this.getCenter();
        this.ctx.arc(center.x, center.y,center.radius, STARTING_ANGLE, ENDING_ANGLE);
    }
    getCenter() {
        var rect = this.canvas.getBoundingClientRect();
        var mouseX = this.posActual.x - rect.left;
        var mouseY = this.posActual.y - rect.top;

        var lastX = this.posAnterior.x;
        var lastY = this.posAnterior.y;

        var center = {
            x: (mouseX + lastX) / 2,
            y: (mouseY + lastY) / 2, 
            radius:(mouseY - lastY) / 2 
        }
        return center;
    }

    setAttributes() {
        this.ctx.globalCompositeOperation = COMPOSITE_OPERATION_FORM; 
        this.ctx.lineWidth = this.width;
        this.ctx.strokeStyle = this.color;

    }

}
export default Circle;
