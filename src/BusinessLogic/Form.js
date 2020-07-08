class Form {
    constructor(formWidth, color, posActual) {
        this.formWidth = formWidth;
        this.color = color;
        this.posActual = posActual;
    }

    setWidth(formWidth) {
        this.formWidth = formWidth;
    }
    getWidth() {
        return this.formWidth;
    }
    getContext() {
        return this.ctx;
    }
    getCanvas() {
        return this.canvas;
    }

    setMode(mode) {
        this.mode = mode;
    }
    setColor(color) {
        this.color = color;
    }
    setPosActual(posActual) {
        this.posActual = posActual;
    }
    setPosAnterior(posAnterior) {
        this.posAnterior = posAnterior;
    }
    actualizarPos(newPos) {
        console.log(newPos)
        this.setPosAnterior(this.posActual);
        this.setPosActual(newPos); 
    }
    setCanvas(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
    }

    setGhostCanvas(canvas) {
        this.gctx = canvas.getContext('2d');
        this.gcanvas = canvas;
    }
}

export default Form;