import React, { useState } from "react";
import '../../App.css'

const DragAndDrop = (props) => {
    const [drag, setDrag] = useState(false);

   function dragStartHandler(e){
       e.preventDefault();
       setDrag(true);

   }

   function dragLeaveHandler(e){
        e.preventDefault();
        setDrag(false);
   }

   function onDropHandler(e){
        e.preventDefault();
        let files = [...e.dataTransfer.files];
        props.transferFiles(files);
        setDrag(false);
   }

    return(
        <div>
            <div className='dragAndDrop' >
                <label htmlFor="image_uploads">
                    {drag
                        ? <div className='drop-area'
                            onDragStart={e => dragStartHandler(e)}
                            onDragLeave={e => dragLeaveHandler(e)}
                            onDragOver={e => dragStartHandler(e)}
                            onDrop={e => onDropHandler(e)}
                        >Drop your file here</div>
                        : <div className='drag-area'
                            onDragStart={e => dragStartHandler(e)}
                            onDragLeave={e => dragLeaveHandler(e)}
                            onDragOver={e => dragStartHandler(e)}
                        >Drag your file here to start an analysis or just click to choose file.</div>
                    }
                </label>
            </div>
            <input type="file" id="image_uploads" name="myImage" onChange={props.clickOnDropArea} accept=".png, .jpg, .jpeg" style={{ opacity: 0 }} />
        </div>
        );

};

export default DragAndDrop