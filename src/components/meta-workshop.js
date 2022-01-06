import React, { Component } from "react";
import EXIF from 'exif-js';
import UserService from "../services/user.service";
import axios from "axios";
import ImageUpload from "react-images-upload";
import Image from "../components/image";

export default class Meta extends Component {
  constructor(props) {
    super(props);

    this.state= {
      content: "",
      images: [],
      viewImages: false
    };

    this.onDrop = this.onDrop.bind(this);
    //this.getExif = this.getExif.bind(this);
  }

  getExif(props) {
    let exifData
    EXIF.getData(props, function() {
      exifData = EXIF.pretty(this);
    })
    return exifData 
  }


  //even though metadata is not being used anywhere, it somehow effects execution flow, handle with care
  //do not delete matadata unless you know what you are doing

  onDrop(imageFile, imageDataURL) {
    let index = imageFile.length -1;
    let newImage = new Object
    let imagesArray = new Array
    let metadata
      while (index >= 0) {
        metadata = this.getExif(imageFile[index])
        //console.log(metadata);
        newImage = { "file":imageFile[index], "url":imageDataURL[index] };
        index -=1;
        imagesArray.push(newImage)
      }
      this.setState({ images: this.state.images.concat(imagesArray) });
  } 

    display123() {
      let value = 123
      return value
    }

    toggleVisible = () => {
      this.setState({ viewImages: !this.state.viewImages})
    }

    displayImages() {
      switch(this.state.viewImages) {
        case true:
          return(
            <div>
              <ul>
                {this.state.images.map((item, i) => <Image key={i} item={item}/>)}
              </ul>
            </div>
          );
        case false:
          return(
            <div>
            </div>
          )
      }
    }

  render() {
    const showMetaData = 
      this.state.viewImages ?
        this.state.viewImages:
        !this.state.viewImages

    const label = this.state.viewImages ? "Hide metadata" : "Show metadata"

    return (
      <div className="container">
        <header className="jumbotron">
           <ImageUpload
            onChange = {this.onDrop}
            withPreview={true} 
            maxFileSize={10485760}
           />
           <div>
            <button className="btn btn-primary btn-block" onClick={this.toggleVisible}>
              {label}
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