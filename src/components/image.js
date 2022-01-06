import React from 'react'
import EXIF from 'exif-js';

const getExif = (props) => {
  let exifData
  EXIF.getData(props, function() {
    exifData = EXIF.pretty(this);
  })
  return exifData 
}

const Image = ({ item, i }) => {
    return (
      <li key={i} className="list-group-item">
        <img className="img-preview" src={item.url} />
        <p>{getExif(item.file)}</p>
      </li>
       
    )
}

export default Image