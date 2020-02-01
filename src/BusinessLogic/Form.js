class Form {
    constructor(width, color, posActual) {
        if ((typeof posActual != 'object')) {
            throw new Error('Posicion formato incorrecto( {x:x,y:y})')
        }
        this.width = width;
        this.color = color;
        this.posActual = posActual;
    }

    setWidth(width) {
        this.width = width;
    }
    getWidth() {
        return this.width;
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
        this.setPosAnterior(this.posActual);
        this.setPosActual(newPos); 
    }
    setCanvas(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
    }
}

export default Form;