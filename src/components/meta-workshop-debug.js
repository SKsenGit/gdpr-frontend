import React, { Component } from "react";
import EXIF from 'exif-js';
import UserService from "../services/user.service";
import axios from "axios";
import ImageUpload from "react-images-upload";


export default class Meta1 extends Component {
  constructor(props) {
    super(props);

    this.state= {
      content: "",
      images: []
    };

    this.onDrop = this.onDrop.bind(this);
  }

  getExif(props) {
    let exifData
    EXIF.getData(props, function() {
      exifData = EXIF.pretty(this);
    })
    return exifData 
  }

  
  onDrop(imageFile, imageDataURL) {
    let index = imageFile.length -1;
    let newImage = new Object
    let imagesArray = new Array
    let metadata
      while (index >= 0) {
        metadata = this.getExif(imageFile[index])
        console.log(metadata);
        newImage = {"file":imageFile[index], "url":imageDataURL[index], "metadata":metadata };
        index -=1;
        imagesArray.push(newImage)
      }
      this.setState({ images: this.state.images.concat(imagesArray) });
  } 

  render() {
    const images  = this.state.images
    const displayImages = () => images.map((item, i) => (
                                  <li key={i} className="list-group-item"><img className="img-preview"src={item.url} />
                                    <p>{item.metadata}</p>
                                  </li>));
    
    return (
      <div className="container">
        <header className="jumbotron">
           <ImageUpload
            onChange = {this.onDrop}
            withPreview={true} 
            maxFileSize={10485760}
           />
           <span>{displayImages()}123</span>
         
        </header>
      </div>
    );
  }
}