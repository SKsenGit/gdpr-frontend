import React, { Component } from "react";
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from "@tensorflow/tfjs";
import { createWorker } from 'tesseract.js';
import getEntities from '../../services/spacy.service.js'

import '../../App.css'

//Change blur pixel number depend on rectangle size


class ObjectRecognition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      model: null,
      image: props.image,
      cnvs: props.canvas,
      FaceRecognitionPredictions: null,
      TextRecognitionPredictions: null,
      FacesDetected: false,
      TextEntitiesDetected: false,
      DisabledBlurButton:false,
      DisabledUnblurButton:true

    };
    

    this.TextRecognitionPredictionFunction();
    tf.ready().then(() => {
      this.loadModel();
    });


  }
  loadModel = async () => {
    let model = await blazeface.load();
    this.setState({
      model: model
    });
    this.FaceRecognitionPredictionFunction();
  }


  blurArea = (ctx, img, bbox) => {
    console.log(bbox)
    let expandArea = bbox.width / 2.5;
    console.log(expandArea)
    let startX = parseInt(bbox.startX) - (expandArea / 2);
    console.log(bbox.startX,parseInt(bbox.startX),startX)
    let startY = parseInt(bbox.startY) - (expandArea / 2);
    let width = parseInt(bbox.width) + expandArea;
    let height = parseInt(bbox.height) + expandArea;

    ctx.filter = 'blur(' + bbox.width / 10 + 'px)';       
    ctx.drawImage(img, startX, startY, width, height, startX, startY, width, height);
    ctx.filter = 'blur(0px)';

  };

  drawRect = (ctx, bbox, areaNumber, color = "blue", fill = false) => {
    if (fill) {
      ctx.fillStyle = "white";
      ctx.fillRect(bbox.startX, bbox.startY, bbox.width, bbox.height);
    }
    else {
      ctx.rect(bbox.startX, bbox.startY, bbox.width, bbox.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = this.state.cnvs.width / 200;
      ctx.stroke();

      ctx.font = ctx.lineWidth * 10 + "px Arial";
      ctx.strokeText(areaNumber, bbox.startX, bbox.startY - 5);
    }

  };

  drawLandmarks = (ctx, landmarks) => {
    ctx.fillStyle = 'blue';
    for (let j = 0; j < landmarks.length; j++) {
      const x = landmarks[j][0];
      const y = landmarks[j][1];
      ctx.fillRect(x, y, 5, 5);
    }
  }
  onClickBlurAreas = () => {
    //let cnvs = this.state.cnvs;
    let cnvs = document.getElementById("myCanvas");
    let ctx = cnvs.getContext("2d");
    //let img = this.state.image;
    let img = document.getElementById("sourceImg");
    ctx.clearRect(0,0,cnvs.width, cnvs.height);            
    ctx.drawImage(img,0,0);
    let predictions = this.state.FaceRecognitionPredictions;
    
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].blurIt) {        
        this.blurArea(ctx, img, predictions[i].bbox);
      }
    }
    predictions = this.state.TextRecognitionPredictions;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i].blurIt) {
        this.drawRect(ctx, predictions[i].bbox,"","white",true);
      }
    }

    this.setState({
      DisabledBlurButton:true,
      DisabledUnblurButton:false
    })
    
  }

  onClickUnblurAreas = () => {
    let cnvs = this.state.cnvs;
    let ctx = cnvs.getContext("2d");
    let img = this.state.image;
    ctx.clearRect(0,0,cnvs.width, cnvs.height);            
    ctx.drawImage(img,0,0);
    let predictions = this.state.FaceRecognitionPredictions;
    for (let i = 0; i < predictions.length; i++) {
      this.drawRect(ctx, predictions[i].bbox, i+1, "blue")
      
    }
    predictions = this.state.TextRecognitionPredictions;
    for (let i = 0; i < predictions.length; i++) {
      this.drawRect(ctx, predictions[i].bbox, i+1, "red")
    }
    this.setState({
      DisabledBlurButton:false,
      DisabledUnblurButton:true
    })

  }
  

  onCheckedFaceArea = (event) => {
    this.state.FaceRecognitionPredictions[parseInt(event.target.id)].blurIt = event.target.checked;

  }

  onCheckedTextArea = (event) => {
    this.state.TextRecognitionPredictions[parseInt(event.target.id)].blurIt = event.target.checked;


  }

  TextRecognitionPredictionFunction = async () => {
    const worker = createWorker({
      logger: (data) => {
        let message = data.status + " " + (data.progress * 100 | 0) + "%";
        this.props.callbackFunctionTextRecognition(message);
      }
    });

    const file = document.getElementById("sourceImg");
    const lang = 'eng';

    await worker.load();
    await worker.loadLanguage(lang);
    await worker.initialize(lang);
    const { data } = await worker.recognize(file);

    console.log(data);

    await worker.terminate();

    const doc = await getEntities(data.text);
    this.props.callbackFunctionTextRecognition("Searching entities...");
    console.log('start')
    console.log(doc)
    console.log('end')

    let cnvs = this.state.cnvs;
    let ctx = cnvs.getContext("2d");

    this.props.callbackFunctionTextRecognition("Task has done.");
    let textPredictions = [];
    let i =0;
    doc.data.ents.forEach(
      entity => {
        let boxEntities = data.words.filter(word => word.text === entity.text);
        
        boxEntities.forEach(
          entityBox => {
            i++
            let bbox = {
              startX: entityBox.bbox.x0,
              startY: entityBox.bbox.y0,
              width: entityBox.bbox.x1 - entityBox.bbox.x0,
              height: entityBox.bbox.y1 - entityBox.bbox.y0
            }
            textPredictions.push({
              bbox: bbox,
              label: entity.label,
              text: entity.text,
              blurIt: true
            })
            this.drawRect(ctx, bbox, i, "red")
          }
        )
      }
    )
    this.setState({
      TextRecognitionPredictions: textPredictions,
      TextEntitiesDetected: textPredictions.length > 0
    })

    const TextRecognitionNotification = this.state.TextEntitiesDetected ?
      "GDPR related data (Names) were detected on the image. Use object recognition tool below to blur detected areas."
      : "No GDPR related objects (Names) were detected on the image.";

    this.props.callbackFunctionTextRecognition(TextRecognitionNotification);


  }
  FaceRecognitionPredictionFunction = async () => {

    const returnTensors = false;
    const flipHorizontal = false;
    const annotateBoxes = false;
    let cnvs = this.state.cnvs;
    let ctx = cnvs.getContext("2d");
    let img = this.state.image;
    let facePredictions = [];

    const predictions = await this.state.model.estimateFaces(
      img, returnTensors, flipHorizontal, annotateBoxes);

    if (predictions.length > 0) {
      this.setState({ FacesDetected: true })
      //ctx.clearRect(0,0,cnvs.width, cnvs.height);            
      //ctx.drawImage(img,0,0);

      for (let i = 0; i < predictions.length; i++) {
        if (returnTensors) {
          predictions[i].topLeft = predictions[i].topLeft.arraySync();
          predictions[i].bottomRight = predictions[i].bottomRight.arraySync();

          if (annotateBoxes) {
            predictions[i].landmarks = predictions[i].landmarks.arraySync();
          }
        }

        const start = predictions[i].topLeft;
        const end = predictions[i].bottomRight;
        const size = [end[0] - start[0], end[1] - start[1]];

        //this.blurArea(ctx,img, start[0], start[1], size[0], size[1]);

        let bbox = {
          startX: start[0],
          startY: start[1],
          width: size[0],
          height: size[1]
        }
        this.drawRect(ctx, bbox, i + 1, "blue")
        facePredictions.push({
          bbox: bbox,
          label: "Face",
          text: "",
          blurIt: true
        })

        if (annotateBoxes) {
          this.drawLandmarks(ctx, predictions[i].landmarks);

        }
      }
      this.setState({ FaceRecognitionPredictions: facePredictions });
    }
    else {
      this.setState({ FacesDetected: false, FaceRecognitionPredictions: facePredictions })

    }
    let faceRecognitionNotification = this.state.FacesDetected ?
      "GDPR related data (Faces) were detected on the image. Use object recognition tool below to blur detected areas."
      : "No GDPR related objects (Faces) were detected on the image.";

    this.props.callbackFunctionFaceRecognition(faceRecognitionNotification);


  }
  render() {
    return (
      <div>
        {this.state.FacesDetected || this.state.TextEntitiesDetected ?
          <label className="attention">GDPR data are detected!</label> :
          <label className="notification">GDPR data aren't detected!</label>
        }
        <div id="foundFace">
          {this.state.FaceRecognitionPredictions !== null ? Object.keys(this.state.FaceRecognitionPredictions).map(index =>
            <label>
              <input type="checkbox" id={index} onChange={this.onCheckedFaceArea} defaultChecked={true} />
              {"  Blue area " + (parseInt(index) + 1)}
            </label>) : <label></label>}
        </div>
        <div id="foundTextEntities">
          {this.state.TextRecognitionPredictions !== null ? Object.keys(this.state.TextRecognitionPredictions).map(index =>
            <label>
              <input type="checkbox" id={index} onChange={this.onCheckedTextArea} defaultChecked={true} />
              {"  Red area " + (parseInt(index) + 1)}
            </label>) : <label></label>}
        </div>

        {this.state.predictions !== null ?
          <div>
            <button id="buttonBlur" onClick={this.onClickBlurAreas} className='button' disabled = {this.state.DisabledBlurButton}>
              Blur areas
            </button>
            <button id="buttonUnblur" onClick={this.onClickUnblurAreas} className='button' disabled = {this.state.DisabledUnblurButton}>
              Unblur areas
            </button>
          </div> :
          null}

      </div>

    );
  }
}
export default ObjectRecognition;