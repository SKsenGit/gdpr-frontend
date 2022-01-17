import React, { Component } from "react";
import piexif from "piexifjs"

const importantTags =   [ {Section:"0th",Tag:271},{Section:"0th",Tag:272},{Section:"GPS",Tag:1},
                        {Section:"GPS",Tag:2},{Section:"GPS",Tag:3},{Section:"GPS",Tag:4},{Section:"GPS",Tag:5},
                        {Section:"GPS",Tag:6},{Section:"GPS",Tag:7},{Section:"GPS",Tag:8},{Section:"GPS",Tag:9},
                        {Section:"GPS",Tag:10},{Section:"GPS",Tag:11},{Section:"GPS",Tag:12},{Section:"GPS",Tag:13},
                        {Section:"GPS",Tag:14},{Section:"GPS",Tag:15},{Section:"GPS",Tag:16},{Section:"GPS",Tag:17},
                        {Section:"GPS",Tag:18},{Section:"GPS",Tag:19},{Section:"GPS",Tag:20},{Section:"GPS",Tag:21},
                        {Section:"GPS",Tag:22},{Section:"GPS",Tag:23},{Section:"GPS",Tag:24},{Section:"GPS",Tag:25},
                        {Section:"GPS",Tag:26},{Section:"GPS",Tag:27},{Section:"GPS",Tag:28},{Section:"GPS",Tag:29},
                        {Section:"GPS",Tag:30},{Section:"GPS",Tag:31}
                        ]
                    

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
                    {keySection !== 'thumbnail' && Object.keys(exif[keySection]).length !== 0 ? 
                    <h4>{keySection}</h4> :
                     null}
                    {keySection !== 'thumbnail' ?                    
                    Object.keys(exif[keySection]).map(keyRow =>
                        <label>
                            <input type="checkbox" id={keySection +'.' + keyRow} onChange={props.onChange} defaultChecked = {props.removingData[keySection][keyRow]?true:false}/>
                            {"   " + piexif.TAGS[keySection][keyRow]['name'] + ":  " + exif[keySection][keyRow]}
                        </label>):
                        null
                       
                    } 
                </div>)
                }
            </div>
        )
    } 
}

class MetadataRecognition extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            imgBase64: "",
            metadata:null,
            removingData:{},
            detectedGDPR:false
        };

        this.getBase64fromFile.bind(this);
        this.getBase64fromFile(props.file);
        
    }


    getBase64fromFile = (file) => {        
        let reader = new FileReader();
        reader.onloadend = (e) => {            
            this.setState({
                imgBase64: reader.result
            });
            this.getMetadata();
        }
        reader.readAsDataURL(file);
        this.setState({
            image: URL.createObjectURL(file)
        });
    
    };

    getMetadata = () => {        
        let metadata = piexif.load(this.state.imgBase64);
        let removingData = {};
        
        Object.keys(metadata).map(keySection=> removingData[keySection] = {}); 
        let haveImportantTags = false;       
        for (const index in importantTags) {            
            let removeTag = importantTags[index];            
            if(metadata[removeTag.Section][removeTag.Tag] || metadata[removeTag.Section][removeTag.Tag] === 0){
                removingData[removeTag.Section][removeTag.Tag] = true;
                haveImportantTags = true;
            }
        }        
        
        this.props.transferData(metadata,removingData);
        let message = document.getElementById("statusMessage");
        
        this.setState({
            metadata: metadata,
            removingData: removingData,
            detectedGDPR:haveImportantTags
        })
        
    }

    onCheckboxChange = (event) => {        
        let removingData = this.state.removingData;
        let keys = event.target.id.split(".");
        
        removingData[keys[0]][keys[1]] = event.target.checked; 
        this.props.transferData(null,removingData);    

    }
    
    

    render() {
        return ( 
            <div >
                {this.state.detectedGDPR ?
                    <label style = {{color:"red"}}>GDPR data are detected!</label>:
                    <label style = {{color:"green"}}>GDPR data aren't detected!</label>                
                }
                <Metadata exif={this.state.metadata} removingData={this.state.removingData} onChange={this.onCheckboxChange} />
            </div>
            
        )
        
    }
}
export default MetadataRecognition;