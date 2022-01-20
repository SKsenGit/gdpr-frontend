import React, { Component } from "react";
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from "@tensorflow/tfjs";

import '../App.css'

//Change blur pixel number depend on rectangle size


class ObjectRecognition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      model:null,
      image: props.image,
      cnvs: props.canvas,
      predictions:null,
      detectedGDPR:false

    };  

    tf.ready().then(() => {
        this.loadModel();
    });

    
  }
  loadModel = async () => {
    let model = await blazeface.load(); 
    this.setState({
        model: model        
      }); 
    this.predictionFunction();
  }
  

  blurArea =(ctx,img ,startX,startY,width, height) =>{
    
    startX = parseInt(startX)-30;
    startY = parseInt(startY)-30;
    width = parseInt(width)+60;
    height = parseInt(height)+60;

    ctx.filter = 'blur(15px)';
    ctx.drawImage(img, startX, startY, width, height, startX, startY, width, height);
    ctx.filter = 'blur(0px)';
    
  };

  drawRect=(ctx,startX,startY,wight, height, areaNumber)=>{    
    ctx.rect(startX, startY, wight, height);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = "30px Arial";
    ctx.strokeText(areaNumber, startX, startY-5);
    
  };

  drawLandmarks=(ctx,landmarks)=>{           
    ctx.fillStyle = 'blue';
    for (let j = 0; j < landmarks.length; j++) {
      const x = landmarks[j][0];
      const y = landmarks[j][1];
      ctx.fillRect(x, y, 5, 5);
    }
  }
  onClickBlurAreas = ()=>{
    let cnvs = document.getElementById("myCanvas");
      let ctx = cnvs.getContext("2d");
      let img = document.getElementById("sourceImg");
      ctx.clearRect(0,0,cnvs.width, cnvs.height);            
      ctx.drawImage(img,0,0);
      let predictions = this.state.predictions;
      for (let i = 0; i < predictions.length; i++) {
        if (predictions[i].blurIt){
          const start = predictions[i].topLeft;
                const end = predictions[i].bottomRight;
                const size = [end[0] - start[0], end[1] - start[1]];
                
                this.blurArea(ctx,img, start[0], start[1], size[0], size[1]);
        }
      }
  }
  onCheckedArea = (event) => {
    this.state.predictions[parseInt(event.target.id)].blurIt = event.target.checked;
    

  }
  predictionFunction= async () => {
      
      const returnTensors = false;
      const flipHorizontal = false;
      const annotateBoxes = false;
      let cnvs = this.state.cnvs;
      let ctx = cnvs.getContext("2d");
      let img = this.state.image;
      
            
      const predictions = await this.state.model.estimateFaces(
        img, returnTensors, flipHorizontal, annotateBoxes);
        
        if (predictions.length > 0) {
            this.setState({detectedGDPR:true})
            ctx.clearRect(0,0,cnvs.width, cnvs.height);            
            ctx.drawImage(img,0,0);

            for (let i = 0; i < predictions.length; i++) {
                if (returnTensors) {
                  predictions[i].topLeft = predictions[i].topLeft.arraySync();
                  predictions[i].bottomRight = predictions[i].bottomRight.arraySync();
                  
                  if (annotateBoxes) {
                    predictions[i].landmarks = predictions[i].landmarks.arraySync();
                  }
                }
                predictions[i]['blurIt'] = true;
                
                const start = predictions[i].topLeft;
                const end = predictions[i].bottomRight;
                const size = [end[0] - start[0], end[1] - start[1]];
                
                //this.blurArea(ctx,img, start[0], start[1], size[0], size[1]);
                this.drawRect(ctx,start[0], start[1], size[0], size[1], i+1);   
                                            
          
                if (annotateBoxes) {
                  this.drawLandmarks(ctx, predictions[i].landmarks);
                  
                }
              }
              this.setState({predictions:predictions});                         
        } 
        else{
          this.setState({detectedGDPR:false})
          
        }
        let faceRecognitionNotification
        if (this.state.detectedGDPR === true) {
          faceRecognitionNotification = "GDPR related data were detected on the image. Use face recognition tool below to blur detected areas."
        } else {
          faceRecognitionNotification = "No GDPR related objects were detected on the image."
        }
        this.props.transferData(faceRecognitionNotification);

        
  }
  render() {
    return (
        <div>
            {this.state.detectedGDPR ?
                    <label style = {{color:"red"}}>GDPR data are detected!</label>:
                    <label style = {{color:"green"}}>GDPR data aren't detected!</label>                
            }
            <div id="findedAreas">
                {this.state.predictions !== null ? Object.keys(this.state.predictions).map(index =>
                    <label>
                        <input type="checkbox" id={index} onChange={this.onCheckedArea} defaultChecked = {true}/>
                        {"  Area " + (parseInt(index) + 1)}
                    </label>) : <label></label>}
            </div>
            {this.state.predictions !== null ?
                <button onClick={this.onClickBlurAreas} className = 'button'>
                    Blur areas
                </button> :
                null}
            
        </div>
          
    );
  }
}
export default ObjectRecognition;