import React, { Component } from "react";
import EXIF from 'exif-js';
import UserService from "../services/user.service";
import axios from "axios";
import ImageUpload from "react-images-upload";


export default class Meta extends Component {
  constructor(props) {
    super(props);

    this.state= {
      content: "",
      images: []
    };

    this.onDrop = this.onDrop.bind(this);
  }

  getExif(props) {
    EXIF.getData(props, function() {
      var exifData = EXIF.pretty(this);
      return exifData
      //console.log(exifData)
    })
  }

  onDrop(imageFile, imageDataURL) {
    let index = imageFile.length -1;
    let newImage = new Object
    let imagesArray = new Array
   
      while (index >= 0) {
        let metadata = this.getExif(imageFile[index])
        //console.log(this)
        //console.log(metadata);
        //console.log(imageFile[index])
        newImage = {"file":imageFile[index], "url":imageDataURL[index], };
        //console.log(newImage);
        index -=1;
        imagesArray.push(newImage)
      }
      this.setState({ images: this.state.images.concat(imagesArray) });
  } 

  render() {
    const images  = this.state.images
    const displayImages = () => images.map((item, i) => (
                                  <li key={i} className="list-group-item"><img className="img-preview"src={item.url} />
                                 
                                  </li>));
    const displayMetadata = () => images.map((item, i) => (
                                    <li key={i} className="list-group-item"><p>{this.getExif(item.file)}</p>
                                      {console.log(item.file)}
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
           <span>{displayMetadata()}456</span>
        </header>
      </div>
    );
  }
}