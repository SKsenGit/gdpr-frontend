import React, { Component } from "react";
import piexif from "piexifjs"

const importantTags = {'GPS':{
                                0:true
                            }

}

const Metadata= (props)=>{
    let exif = props.exif;
    if (exif == null){
        return (<div className="metadata"></div>)
    }
    else{
    return (
            <div className="metadata">
                {Object.keys(exif).map(keySection =>
                <div>
                    <h1>{keySection}</h1>
                    {keySection !== 'thumbnail' ? Object.keys(exif[keySection]).map(keyRow =>
                        <label>
                            <input type="checkbox" id={keySection +'.' + keyRow} onChange={props.onChange} defaultChecked = {props.removingData[keySection][keyRow]?true:false}/>
                            {"   " + piexif.TAGS[keySection][keyRow]['name'] + ":  " + exif[keySection][keyRow]}
                        </label>):
                        <label>
                            <input type="checkbox" id="thumbnail" onChange={props.onChange} />
                              {"   " + exif[keySection]}
                        </label>
                    } 
                </div>)
                }
            </div>
        )
    } 
}

class GdprMetadata extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            imgBase64: "",
            metadata:null,
            removingData:{},
            metadataStorage:null
        };
        
    }

    extractImageFileExtensionFromBase64 = (base64Data) => {
        return base64Data.substring("data:image/".length, base64Data.indexOf(";base64"))
    }

    downloadBase64File = (base64Data, filename) => {
        var element = document.createElement('a');
        element.setAttribute('href', base64Data);
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }

    handleDownloadClick = (event) => {
        event.preventDefault()
        const image = this.state.imgBase64
        const fileExtenstion = this.extractImageFileExtensionFromBase64(this.state.imgBase64)
        const myFilename = "fileName." + fileExtenstion
        this.downloadBase64File(image, myFilename)

    }

    onImageChange = event => {
        if (event.target.files && event.target.files[0]) { 
            let img = event.target.files[0];
            let reader = new FileReader();
            reader.onloadend = (e) => {
                this.setState({
                    imgBase64: reader.result
                });
            }
            reader.readAsDataURL(img);
            this.setState({
                image: URL.createObjectURL(img)
            });
        }
    };

    getMetadata = () => {        
        let metadata = piexif.load(this.state.imgBase64);
        console.log(metadata)
        console.log(this.state.metadataStorage)
        let removingData = {};
        Object.keys(metadata).map(keySection=> removingData[keySection] = {});

        this.setState({
            metadata: metadata,
            removingData: removingData
        })
        if (this.state.metadataStorage === null) {
            this.setState({
                metadataStorage: metadata
            })
        }
    }

    onCheckboxChange = (event) => {        
        let removingData = this.state.removingData;
        let keys = event.target.id.split(".");
        console.log(removingData);
        removingData[keys[0]][keys[1]] = event.target.checked;     

    }
    
    injectMetadata = (event) => {
        event.preventDefault()
        const imageNoData = piexif.remove(this.state.imgBase64)
        let exifStr = piexif.dump(this.state.metadataStorage)
        let image = piexif.insert(exifStr, imageNoData)
        const fileExtenstion = this.extractImageFileExtensionFromBase64(image)
        const myFilename = "fileName." + fileExtenstion
        this.downloadBase64File(image, myFilename)
    }

    render() {
        return (
            <div>
                <div>
                    <div>
                        <img src={this.state.image} alt="Select JPEG file"/>                        
                        <input type="file" name="myImage" onChange={this.onImageChange} />
                        <button onClick={this.getMetadata}>
                            Get metadata
                        </button>
                    </div>
                    <div>
                        <button onClick={this.handleDownloadClick}>
                            Download Image
                        </button>
                        <button onClick={this.injectMetadata}>
                            Download and Replace Metadata
                        </button>
                    </div>
                    <div >
                        <Metadata exif = {this.state.metadata} removingData = {this.state.removingData} onChange = {this.onCheckboxChange} />
                    </div>
                </div>
            </div>
        );
    }
}
export default GdprMetadata;