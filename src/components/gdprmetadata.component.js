import React, { Component } from "react";
import piexif from "piexifjs"




class GdprMetadata extends Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            imgBase64: ""

        };

        this.onImageChange = this.onImageChange.bind(this);
        this.getMetadata = this.getMetadata.bind(this);
        this.debugExif = this.debugExif.bind(this);
    }


    debugExif = (exif) => {
        for (const ifd in exif) {
            if (ifd === 'thumbnail') {
                const thumbnailData = exif[ifd] === null ? "null" : exif[ifd];
                console.log(`- thumbnail: ${thumbnailData}`);
            } else {
                console.log(`- ${ifd}`);
                for (const tag in exif[ifd]) {
                    console.log(`    - ${piexif.TAGS[ifd][tag]['name']}: ${exif[ifd][tag]}`);
                }
            }
        }
    }
    onImageChange = event => {

        if (event.target.files && event.target.files[0]) {
            // console.log(event.target.files[0]);
            let img = event.target.files[0];

            let reader = new FileReader();

            reader.onloadend = (e) => {

                this.setState({
                    imgBase64: reader.result
                });
            }
            reader.readAsDataURL(img);
            this.setState({
                image: URL.createObjectURL(img)
            });
        }
    };

    getMetadata = () => {
        let textMyMetadata = document.getElementById("myMetadata");
        textMyMetadata.textContent = "Getting metadata...";
        console.log(this.state.imgBase64);
        let metadata = piexif.load(this.state.imgBase64);
        this.debugExif(metadata);
        console.log(metadata);

    }

    render() {
        return (
            <div>
                <div>
                    <div>
                        <img src={this.state.image} />
                        <h1>Select Image</h1>
                        <input type="file" name="myImage" onChange={this.onImageChange} />
                        <button onClick={this.getMetadata}>
                            Get metadata
                        </button>
                    </div>
                    <div >
                        <textarea id="myMetadata" />
                    </div>
                </div>
            </div>
        );
    }
}
export default GdprMetadata;