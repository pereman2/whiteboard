class Line {
    constructor(width, color, posActual, posAnterior) {
        if ((typeof posActual != 'object') || (typeof posAnterior != 'object')) {
            throw new Error('Posicion formato incorrecto( {x:x,y:y})')
        }
        this.width = width;
        this.color = color;
        this.posActual = posActual;
        this.posAnterior = posAnterior;
    }
    
    setWidth = function (width) {
        this.width = width;
    }
    
    getWidth = function () {
        return this.width;
    }
    
    getContext = function () {
        return this.ctx;
    }
    
    getCanvas = function () {
        return this.canvas;
    }
    
    setMode = function (mode) {
        this.mode = mode;
    }
    
    setColor = function (color) {
        this.color = color;
    }
    
    setPosActual = function (posActual) {
        this.posActual = posActual;
    }
    
    setPosAnterior = function (posAnterior) {
        this.posAnterior = posAnterior;
    }
    
    updateLine = function(newPos) {
        this.setPosAnterior(this.posActual);
        this.setPosActual(newPos); 
    }
    
    setCanvas = function(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
    }

}
export default Line;