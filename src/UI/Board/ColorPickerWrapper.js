
import React from 'react';

export default function ColorPickerWrapper(CircleWidthComponent, width) {
    return class ColorPickerWrapper extends React.Component {
        componentWillReceiveProps(nextProps) {
        }
        componentDidMount() {
        }
        render() {
            return <CircleWidthComponent onValueChange={(e) => { this.props.onValueChange(e); }} width={width} />;
        }
    }
}