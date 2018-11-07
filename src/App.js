//tips for code review:
// - always catch possible error in a fetch
// - move any API (p.e. clarifai to the backend, where user-keys have to be used (see api_key)

import React, { Component } from "react";
import Particles from "react-particles-js";
import "./App.css";
import Navigation from "./components/Navigation/Navigation.js";
import Logo from "./components/Logo/Logo.js";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm.js";
import Rank from "./components/Rank/Rank.js";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition.js";
//import Clarifai from "clarifai";//moved to backend
//ugyanez hagyományos (nem React) javascript syntax-szal:
//const Clarifai=require("clarifai");

import Signin from "./components/Signin/Signin.js";
import Register from "./components/Register/Register.js";

//clarifai moved to backend because of security reasons
/*
const app=new Clarifai.App(
	{
		apiKey:"69f4a37f28664a1996fbea732ea3c4c8"
	}
);
*/

const particleOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
};

const initialState = {
  input: "",
  imageUrl: "",
  box: {},
  route: "signin", //to know where we are in the web page
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: ""
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = data => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
  };

  calculateFaceLocation = data => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    console.log(";" + clarifaiFace);
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    //		console.log(width+";"+height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height
    };
  };

  displayFaceBox = box => {
    this.setState({ box: box });
  };

  onInputChange = event => {
    console.log(event.target.value);
    this.setState({ input: event.target.value });
  };

  onClick = () => {
    console.log("Button pressed!");
    this.setState({ imageUrl: this.state.input });
    //		console.log(this.state.input);//itt is ugyanaz a helyzet: az aszinkronitás miatt az imageUrl még üres, ezért használjuk az input-ot (vagy callback-elni kellene
    //		app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)//moved to backend for security reasons
    fetch("https://glacial-woodland-77484.herokuapp.com/imageurl", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(response => {
        console.log(response);
        if (response) {
          console.log("Benn vagyok");
          fetch("https://glacial-woodland-77484.herokuapp.com/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: this.state.user.id
            })
          });
        }
        this.displayFaceBox(this.calculateFaceLocation(response));
        console.log(response);
        //return response.json();
      })
      .then(count => {
        this.setState(Object.assign(this.state.user, { entries: count }));
      })
      .catch(err => console.log("HIBA:", err));
    //ez a rövidített then és catch ehelyett van, mert ES6-ben már egyszerűsíthetünk, illetve catch-elhetünk is
    /*
		    function(response) {
		      console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
		      this.calculateFaceLocation(response);
		    },
		    function(err) {
		      // there was an error
		    }
		  );
*/
  };

  onRouteChange = route => {
    if (route === "signout") {
      this.setState(initialState);
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  // a render-ben azért használunk kapcsos zárójelet, mert a JSX-ben így lehet javascript kódot futtatni
  // itt konkrétan a feltétel?igaz:hamis rövidített if-et használjuk
  render() {
    const { isSignedIn, imageUrl, route, box, user } = this.state; //ez a destructuring, így tisztább lesz a kód
    console.log(user, route);

    return (
      <div className="App">
        <Particles className="particles" params={particleOptions} />
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {route === "home" ? (
          <div>
            <Logo />
            <Rank name={user.name} entries={user.entries} />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onClick={this.onClick}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : route === "signin" ? (
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;
