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
      
    if (event.target.files && event.target.files[0]) {
       // console.log(event.target.files[0]);
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
        console.log(this.state);
        this.setState({imgWidth:width,
            imgHeight:height});
  };
  predictionFunction= async () => {
      console.log("prediction")
      const returnTensors = false;
      const flipHorizontal = true;
      const annotateBoxes = true;
      let cnvs = document.getElementById("myCanvas");
      let ctx = cnvs.getContext("2d");
      
      ctx.strokeText("Detecting...",0,10);
      const predictions = await this.state.model.estimateFaces(
        document.querySelector("img"), returnTensors, flipHorizontal, annotateBoxes);
        
        if (predictions.length > 0) {
            ctx.clearRect(0,0,cnvs.width, cnvs.height);
            //console.log("There are faces!")
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
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                let mirrorX = this.state.imgWidth - start[0];
                
                console.log(`X: ${start[0]}, Y: ${start[1]}, X: ${end[0]}, Y: ${end[1]} `);
                console.log(`X: ${start[0]}, Y: ${start[1]}, W: ${size[0]}, H: ${size[1]} `);
                ctx.rect(0,0,this.state.imgWidth,this.state.imgHeight);                
                ctx.strokeStyle = "#FF0000";
                ctx.lineWidth = 3;
                ctx.stroke();

                //ctx.fillRect(start[0], start[1], size[0], size[1]);


                ctx.rect(mirrorX, start[1], start[0] - end[0], size[1]);                
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 3;
                ctx.stroke();

                /*let reflectX = (2 * start[0]) + (2 * size[0]);
                ctx.translate(reflectX, 0);
                ctx.scale(-1, 1);
                ctx.rect(start[0], start[1], size[0], size[1]);                
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 3;
                ctx.stroke();*/

                
          
               /* if (annotateBoxes) {
                  const landmarks = predictions[i].landmarks;
          
                  ctx.fillStyle = 'blue';
                  for (let j = 0; j < landmarks.length; j++) {
                    const x = landmarks[j][0];
                    const y = landmarks[j][1];
                    ctx.fillRect(x, y, 5, 5);
                  }
                }*/
              }
            
        }
        else{
            ctx.clearRect(0,0,cnvs.width, cnvs.height);
            ctx.strokeText("Faces were not found!",0,10);
            
        }
  }
  render() {
    return (
      <div>
        <div>
          <div>
            <img onLoad={this.onImgLoad} src={this.state.image} />
            <h1>Select Image</h1>
            <input type="file" name="myImage" onChange={this.onImageChange} />
            <button onClick={this.predictionFunction}>
              Start Detect
            </button>
          </div>
          <div style={{ position: "absolute", top: "72px", zIndex: "9999" }}>
            <canvas   id="myCanvas" width={this.state.imgWidth} height={this.state.imgHeight} style={{ backgroundColor: "transparent" }}
             />
          </div>
        </div>
      </div>
    );
  }
}
export default GdprImage;