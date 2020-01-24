import React from 'react';
import './ColorPicker.css';
import { ChromePicker } from 'react-color';
import background from '../resources/background/picker_mask.png';
import { MDBCard, MDBCardBody } from "mdbreact";



class ColorPicker extends React.Component {
    constructor(props, context) { super(props, context)
        this.state = {
            background: '#fff',
        }
    }
    handleChangeComple = color => {
        this.setState({ background: color.hex });
        this.eventColor(color);
    }
    eventColor = color => {
        this.props.onColorChange(color);
    }
    render() {
        return (
            <div className="ColorPicker">
                <ChromePicker
                    color={this.state.background}
                    onChangeComplete= { this.handleChangeComple }
                />
            </div>

        );
    }
}

export default ColorPicker;
