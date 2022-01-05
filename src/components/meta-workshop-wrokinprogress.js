import React, { Component } from "react";
import EXIF from 'exif-js';
import UserService from "../services/user.service";
import axios from "axios";
import ImageUpload from "react-images-upload";
import Image from "../components/image";

export default class Meta2 extends Component {
  constructor(props) {
    super(props);

    this.state= {
      content: "",
      images: [],
      viewImages: false
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

    display123() {
      let value = 123
      return value
    }

  render() {
    const images  = this.state.images
    const displayImages = () => {
      <ul>
        {images.map((item, i) => <Image key={i} item={item}/>)}
      </ul>
  
    }

    
    return (
      <div className="container">
        <header className="jumbotron">
           <ImageUpload
            onChange = {this.onDrop}
            withPreview={true} 
            maxFileSize={10485760}
           />
           <div>
            <button className="btn btn-primary btn-block" onClick={123}>
              Display metadata
            </button>
            <div>
              {this.displayImages()}
            </div>
           </div>
        </header>
      </div>
    );
  }
}