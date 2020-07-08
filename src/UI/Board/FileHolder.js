
import React from 'react';
import './FileHolder.css';


class FileHolder extends React.Component {

    constructor(props, context) { super(props, context)
        this.state = {
            popupOn: false,
        }
        this.popup = React.createRef();
    }


    render() {
        return (
            <div className="file-holder">
                <div>Files</div>
            </div>
        );
    }
}

export default FileHolder;