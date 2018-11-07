import React from "react";
import "./FaceRecognition.css";

const FaceRecognition = ({ imageUrl, box }) => {
  //console.log(box);
  return (
    <div className={"center ma"}>
      <div className={"absolute mt2"}>
        <img
          id="inputimage"
          src={imageUrl}
          alt={"Face to detect"}
          width={"500px"}
          height={"auto"}
        />
        <div
          className={"bounding_box"}
          style={{
            left: box.leftCol,
            top: box.topRow,
            right: box.rightCol,
            bottom: box.bottomRow
          }}
        />
      </div>
    </div>
  );
};

export default FaceRecognition;
