import React from 'react'

const Image = ({ item, i }) => {
    return (
      <li key={i} className="list-group-item">
        <img className="img-preview" src={item.url} />
      <p>123</p>
      </li>
       
    )
}

export default Image