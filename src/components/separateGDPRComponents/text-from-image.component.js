import React, { Component } from "react";
import { createWorker } from 'tesseract.js';
import getEntities from '../../services/spacy.service.js'


class ImageText extends Component {

    constructor(props) {
        super(props);
        this.state = {
            worker: null,
            image: null,
            imgWidth: 0,
            imgHeight: 0,
            predictions: null

        };
      this.drawRect = this.drawRect.bind(this);         
  };

  onImgLoad= event => {
    let img = event.target;        
    let width = img.offsetWidth;
    let height = img.offsetHeight;        
    this.setState({imgWidth:width,
        imgHeight:height});
    };
    onImageChange = event => {
        let message = document.getElementById("noFaceDetection");
        message.textContent = "";  
        if (event.target.files && event.target.files[0]) {       
          let img = event.target.files[0];      
          this.setState({
            image:URL.createObjectURL(img),
            predictions: null        
          });

        }
      };

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
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = "9px Arial";
    ctx.strokeText(areaNumber, startX, startY-5);
    
  };



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
    predictionFunction=  async() => {       
       const worker = createWorker({
        logger: (data) => console.log(data)
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
        console.log('start')
        console.log(doc)
        console.log('end')

        let cnvs = document.getElementById("myCanvas");
        let ctx = cnvs.getContext("2d");
        ctx.drawImage(document.getElementById("sourceImg"),0,0);
        
        doc.data.ents.forEach(
            entity=>{
                let boxEntities = data.words.filter(word => word.text === entity.text);
                boxEntities.forEach(
                    entityBox=>{               
                        
                        let box = entityBox.bbox;
                        this.drawRect(ctx,box.x0,box.y0,box.x1-box.x0, box.y1 - box.y0, entity.label)
                    }
                )
            }
        )

    }

        render() {
            return (
                <div>
                    <div>
                        <div>
                            <img id="sourceImg" onLoad={this.onImgLoad} src={this.state.image} alt="Select JPEG file" />
                            <div>
                                <div id="noFaceDetection"></div>
                                <div id="findedAreas">
                                    {this.state.predictions !== null ? Object.keys(this.state.predictions).map(index =>
                                        <label>
                                            <input type="checkbox" id={index} onChange={this.onCheckedArea} />
                                            {"  Area " + (parseInt(index) + 1)}
                                        </label>) : <label></label>}
                                </div>
                                <input type="file" name="myImage" onChange={this.onImageChange} />
                                <button onClick={this.predictionFunction}>
                                    Start Detect
                                </button>
                                <button onClick={this.onClickBlurAreas}>
                                    Blur checked areas
                                </button>
                            </div>
                        </div>
                        <div style={{ position: "absolute", top: "103px", zIndex: "9999" }}>
                            <canvas id="myCanvas" width={this.state.imgWidth} height={this.state.imgHeight} style={{ backgroundColor: "transparent" }}
                            />
                        </div>

                    </div>
                </div>
            );
        }
    }
export default ImageText;