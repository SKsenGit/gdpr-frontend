import React, { Component } from "react";
import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from "@tensorflow/tfjs";





class GdprImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      model:null,
      image: null,
      imgWidth:0,
      imgHeight:0

    };

    this.onImageChange = this.onImageChange.bind(this);
    this.onImgLoad = this.onImgLoad.bind(this);
    this.loadModel = this.loadModel.bind(this);
    this.predictionFunction = this.predictionFunction.bind(this);

    tf.ready().then(() => {
        this.loadModel();
    });

    
  }
  loadModel = async () => {
    let model = await blazeface.load(); 
    this.setState({
        model: model        
      }); 
  }
  

  onImageChange = event => {
    let message = document.getElementById("noFaceDetection");
    message.textContent = "";  
    if (event.target.files && event.target.files[0]) {       
      let img = event.target.files[0];      
      this.setState({
        image: URL.createObjectURL(img)        
      });
    }
  };
  onImgLoad= event => {
        let img = event.target;        
        let width = img.offsetWidth;
        let height = img.offsetHeight;        
        this.setState({imgWidth:width,
            imgHeight:height});
  };

  blurArea =(ctx,img ,startX,startY,width, height) =>{
    
    startX = parseInt(startX)-10;
    startY = parseInt(startY)-10;
    width = parseInt(width)+15;
    height = parseInt(height)+15;

    ctx.filter = 'blur(8px)';
    ctx.drawImage(img, startX, startY, width, height, startX, startY, width, height);
    ctx.filter = 'blur(0px)';
    
  };

  drawRect=(ctx,startX,startY,wight, height)=>{
    ctx.filter = 'blur(10px)';
    ctx.rect(startX, startY, wight, height);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.filter = 'blur(0px)';
  };

  drawLandmarks=(ctx,landmarks)=>{           
    ctx.fillStyle = 'blue';
    for (let j = 0; j < landmarks.length; j++) {
      const x = landmarks[j][0];
      const y = landmarks[j][1];
      ctx.fillRect(x, y, 5, 5);
    }
  }

  predictionFunction= async () => {
      
      const returnTensors = false;
      const flipHorizontal = false;
      const annotateBoxes = false;
      let cnvs = document.getElementById("myCanvas");
      let ctx = cnvs.getContext("2d");
      let img = document.getElementById("sourceImg");
      let message = document.getElementById("noFaceDetection");
            
      const predictions = await this.state.model.estimateFaces(
        img, returnTensors, flipHorizontal, annotateBoxes);
        
        if (predictions.length > 0) {
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
          
                const start = predictions[i].topLeft;
                const end = predictions[i].bottomRight;
                const size = [end[0] - start[0], end[1] - start[1]];
                
                this.blurArea(ctx,img, start[0], start[1], size[0], size[1]);
                //this.drawRect(ctx,start[0], start[1], size[0], size[1]);   
                                            
          
                if (annotateBoxes) {
                  this.drawLandmarks(ctx, predictions[i].landmarks);
                  
                }
              }
            
        }
        else{
          
          message.textContent = "Faces were not found!";
        }
        
  }
  render() {
    return (
      <div>
        <div>
          <div>
            <img id="sourceImg" onLoad={this.onImgLoad} src={this.state.image} alt="Select JPEG file" />
            <div>
            <div id = "noFaceDetection"></div>
              <input type="file" name="myImage" onChange={this.onImageChange} />
              <button onClick={this.predictionFunction}>
                Start Detect
              </button>
            </div>
          </div>
          <div style={{ position: "absolute", top: "72px", zIndex: "9999" }}>
            <canvas id="myCanvas" width={this.state.imgWidth} height={this.state.imgHeight} style={{ backgroundColor: "transparent" }}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default GdprImage;