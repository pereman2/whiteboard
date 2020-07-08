import Rectangle from "./Rectangle";
import Toolbar from "../UI/Board/Toolbar";

class FormFactory {
    constructor(toolbar) {
        this.toolbar = toolbar;
    }
    getForm(type) {
        let config = this.toolbar.getRectangleConfig();
        let form;
        let canvas = document.querySelector('#Board')
        let gcanvas = document.querySelector('#ghostcanvas')
        switch(type) {
            case 'rectangle':
                form = new Rectangle(config.width, config.color, config.pos);
                form.setCanvas(canvas)
                form.setGhostCanvas(gcanvas)
        }
        return form;
    }
}

export default FormFactory;