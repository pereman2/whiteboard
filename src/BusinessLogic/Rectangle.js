import Form from './Form';

var COMPOSITE_OPERATION_FORM = 'source-over'; 
var LINE_JOIN_ROUND = 'round';
var LINE_CAP_ROUND = 'round';

 class Rectangle extends Form {
    constructor(width, color, posActual){
        super(width, color, posActual);
        this.selectionHandles = []
    }

    draw(contextLayer) {
        let ctx;
        if(contextLayer == 'canvas') {
            ctx = this.ctx;
        } else if('ghostcanvas'){
            ctx = this.gctx;
            ctx.fillStyle = 'black';
        }
        if(!this.canvas) { throw new Error('No se ha asignado un canvas a la linea')}
        console.log(this.x, this.y)
        this.ctx.globalCompositeOperation = COMPOSITE_OPERATION_FORM; 
        this.ctx.lineWidth = this.formWidth;
        this.ctx.strokeStyle = this.color;
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
        ctx.closePath();
    }

    updateRect(ctx) {
        this.setAttributes(ctx);
        this.makeRect();
    }

    makeRect() {
        var rect = this.canvas.getBoundingClientRect();
        var mouseX = this.posActual.x - rect.left;
        var mouseY = this.posActual.y - rect.top;
        var lastX = this.posAnterior.x;
        var lastY = this.posAnterior.y;
        let height = mouseY - lastY;
        let width = mouseX - lastX;
        this.height = height;
        this.width = width;
        this.x = lastX;
        this.y = lastY;
        console.log(mouseX, mouseY)
        console.log(lastX, lastY)
    }

    setAttributes() {
    }

}
export default Rectangle;
