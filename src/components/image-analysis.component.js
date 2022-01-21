import React, { Component } from "react";
import DragAndDrop from "./UI components/draganddrop";
import ObjectRecognition from "./object-recognition.component"
import MetadataRecognition from "./metadata-recognition.component"
import { Container, Row, Col, Card, Accordion, Spinner } from "react-bootstrap"
import piexif from "piexifjs"

import '../App.css'

class ImageAnalysis extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            file: null,
            startDetecting: false,
            metadata: null,
            removingData: null,
            metadataNotification:"default metadata notification",
            faceRecognitionNotification: "Working..."

        };
    }

    onImageChange = event => {

        if (event.target.files && event.target.files[0]) {
            let img = event.target.files[0];
            this.setState({
                image: URL.createObjectURL(img),
                file: img
            });
        }
    };

    getFilesFromDragAndDrop = files => {
        const eventFromDragAndDrop = {};
        eventFromDragAndDrop.target = {};
        eventFromDragAndDrop.target.files = files;
        this.onImageChange(eventFromDragAndDrop);
    }
    onImgLoad = event => {
        let img = event.target;
        let cnvs = document.getElementById("myCanvas");
        cnvs.width = img.width;
        cnvs.height = img.height;
        let ctx = cnvs.getContext("2d");
        ctx.clearRect(0, 0, cnvs.width, cnvs.height);
        ctx.drawImage(img, 0, 0);

        this.setState({ startDetecting: true })

    };

    getMetadata = (metadata, removingData, metadataNotification) => {

        if (metadata !== null) {
            this.setState({
                metadata: metadata
            })
        }
        if (removingData !== null) {
            this.setState({
                removingData: removingData
            })
        }
        if (metadataNotification) {
            this.setState({
                metadataNotification: metadataNotification
            })
        }
    };

    getFaceRecognitionNotification = (faceRecognitionNotification) => {
        if (faceRecognitionNotification) {
            this.setState({
                faceRecognitionNotification: faceRecognitionNotification
            })
        }
    }

    convertCanvasBlobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result);
            };

            reader.onerror = reject;

            reader.readAsDataURL(blob);
        })

    }
    getCanvasBlob = (mycanvas) => {
        return new Promise(function (resolve, reject) {
            mycanvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/jpeg', 0.9)
        })
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

    extractImageFileExtensionFromBase64 = (base64Data) => {
        return base64Data.substring("data:image/".length, base64Data.indexOf(";base64"))
    }

    injectMetadata = (imgBase64) => {

        const imageNoData = piexif.remove(this.state.imgBase64)
        let exifStr = piexif.dump(this.state.metadataStorage)
        let image = piexif.insert(exifStr, imageNoData)
        const fileExtenstion = this.extractImageFileExtensionFromBase64(image)
        const myFilename = "fileName." + fileExtenstion
        this.downloadBase64File(image, myFilename)
    }
    saveAndDownload = async () => {
        
        let cnvs = document.getElementById("myCanvas");
        let canvasBlob = await this.getCanvasBlob(cnvs);
        let canvasBase64 = await this.convertCanvasBlobToBase64(canvasBlob);

        const imageNoData = piexif.remove(canvasBase64)
        let removingData = this.state.removingData;
        let metadata = this.state.metadata;
        for (const ifd in removingData) {
            //if (ifd === 'thumbnail' && removingData[ifd] === true) {
            if (ifd === 'thumbnail') {
                delete metadata[ifd];
            } else {
                for (const tag in removingData[ifd]) {
                    if (removingData[ifd][tag] === true) {
                        delete metadata[ifd][tag];
                    }
                }
            }
        }

        let exifStr = piexif.dump(metadata)
        let image = piexif.insert(exifStr, imageNoData)
        const fileExtenstion = this.extractImageFileExtensionFromBase64(image)
        const myFilename = "fileName." + fileExtenstion
        this.downloadBase64File(image, myFilename)
        this.clearPage();
    }

    clearPage = () => {
        this.setState({
            image: null,
            file: null,
            startDetecting: false,
            metadata: null,
            removingData: null,
            metadataNotification: null,
            faceRecognitionNotification: "Working..."
        })
    }
    /*
    collapseContent = (event) => {        
        let btn = event.target;

        btn.classList.toggle("active");
        let content = btn.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
    }
    }
    */
    render() {
        return (
            <div>              
                <Container>
                    <Row>
                      <Col xs={12} md={8}>
                        {this.state.image === null ?
                            <div>
                                <DragAndDrop
                                    transferFiles={this.getFilesFromDragAndDrop}
                                    clickOnDropArea={this.onImageChange}
                                >
                                </DragAndDrop>
                            </div> :
                            <div>
                                <canvas id="myCanvas" style={{ backgroundColor: "transparent" }} />
                                <div style={{ display: "none" }}>
                                    <img id="sourceImg" onLoad={this.onImgLoad} src={this.state.image} alt="Select JPEG file" />
                                </div>
                                <div>
                                    <button onClick={this.clearPage} className='button'>New analysis</button>
                                    <button onClick={this.saveAndDownload} id="saveAndDownloadButton" className='button'>Save and download</button>
                                </div>
                                
                            </div>}
                        </Col>

                            <Col xs={12} md={4}>
                                <Row>
                                    
                                    {this.state.image === null ?
                                        <div></div>:
                                            <Card>
                                                {this.state.metadataNotification === "The system did not detect any important GDPR-related metadata."
                                                 ? <Card.Header className="notification">Notification</Card.Header> 
                                                 : <Card.Header className="attention">Attention!</Card.Header> }
                                                        <Card.Body>
                                                            {this.state.metadataNotification}
                                                        </Card.Body>
                                            </Card>}
                                         
                                </Row>
                               
                                <Row>
                                    {this.state.image === null ?
                                        <div></div>:
                                            <Card>
                                                {this.state.faceRecognitionNotification === "No GDPR related objects were detected on the image."
                                                 ? <Card.Header className="notification">Notification</Card.Header> 
                                                 : <Card.Header className="attention">Attention!</Card.Header> }
                                                        <Card.Body>
                                                            {this.state.faceRecognitionNotification} < br/>
                                                            {this.state.faceRecognitionNotification === "Working..." 
                                                            ? <Spinner animation="border" variant="primary" /> :<></>}
                                                        </Card.Body>
                                            </Card>}
                                    
                                </Row>
                            </Col>
                       
                    </Row>
                    <br />
                    <Row>
                    {this.state.startDetecting ?
                        <div >
                            <Accordion defaultActiveKey="0">
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header className="bg-default">Faces recognition section</Accordion.Header>
                                    <Accordion.Body className="bg-default">
                                    <ObjectRecognition
                                        image={document.getElementById("sourceImg")}
                                        canvas={document.getElementById("myCanvas")}
                                        transferData={this.getFaceRecognitionNotification}
                                    />
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Metadata section</Accordion.Header>
                                    <Accordion.Body className="bg-default">
                                        <MetadataRecognition
                                            file={this.state.file}
                                            transferData={this.getMetadata}
                                        />
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </div> :
                        null
                    }
                    </Row>
                </Container>

            </div>
        )
    }
}

export default ImageAnalysis;
