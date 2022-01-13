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
            removingData:{}

        };
        
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
        let removingData = {};
        Object.keys(metadata).map(keySection=> removingData[keySection] = {});

        this.setState({
            metadata: metadata,
            removingData: removingData
        })
        

    }
    onCheckboxChange = (event) => {        
        let removingData = this.state.removingData;
        let keys = event.target.id.split(".");
        console.log(removingData);
        removingData[keys[0]][keys[1]] = event.target.checked;     

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
                    <div >
                        <Metadata exif = {this.state.metadata} removingData = {this.state.removingData} onChange = {this.onCheckboxChange} />
                    </div>
                </div>
            </div>
        );
    }
}
export default GdprMetadata;