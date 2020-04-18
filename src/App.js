import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig)

function App() {
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const facebookProvider = new firebase.auth.FacebookAuthProvider();

  const [user,setUser] = useState({
    isSignedIn: false,
    name:'',
    email:'',
    photoURL:'',
    isValid: false,
    existingUser: false,
    error:''
  })
  const isValidEmail = (email) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
  const isValidPassword = (password) =>  /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,20}$/.test(password);
  const switchForm = event => {
    const newUser = {...user}
    newUser.existingUser = event.target.checked;
    setUser(newUser);
  }

  // Google PopUp Authentication
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(googleProvider)
    .then( result => {
      //console.log(result);
      const {displayName, email, photoURL} = result.user;
      const token = result.credential.accessToken;
      const signedInUser = {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL,
        isValid:true,
        error: ""
      }
      setUser(signedInUser);
    })
    .catch(error => {
      const errorCode  = error.code;
      const errorMsg = error.message;
      const errors = errorCode+": "+errorMsg 
      handleError(errors);
    })
  }

  const handleError = (errorMsg) =>
  {
    const createUser = {...user}
    createUser.error = errorMsg;
    createUser.isSignedIn = false;
    setUser(createUser);
  }

  const handleSignOut = () =>{
    firebase.auth().signOut()
    .then( resposne => {
      const signOutUser = {
        isSignedIn : false,
        name: '',
        email: '',
        photo: '',
      }
      setUser(signOutUser);
    })
    .catch( error => {
      const errorMsg =error.message;
      handleError(errorMsg);
    })
  }

  // Facebook PopUp Authentication
  const handleFacebookSignIn = () => {
    firebase.auth().signInWithPopup(facebookProvider)
    .then( result => {
      //console.log(result);
      const {displayName, email, photoURL} = result.user;
      const token = result.credential.accessToken;
      const signedInUser = {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL,
        isValid:true,
        error: ""
      }
      setUser(signedInUser);
    })
    .catch(error => {
      const errorCode  = error.code;
      const errorMsg = error.message;
      const errors = errorCode+": "+errorMsg 
      handleError(errors);
    })
  }
  const handleFacebookSignOut = () =>{
    firebase.auth().signOut()
    .then( resposne => {
      const signOutUser = {
        isSignedIn : false,
        name: '',
        email: '',
        photo: '',
      }
      setUser(signOutUser);
    })
    .catch( error => {
      const errorMsg =error.message;
      handleError(errorMsg);
    })
  }

  const handleChange = (event) =>
  {
    const newUser = { ...user};
    let isValid;
    if(event.target.name === 'email')
    {
        isValid = isValidEmail(event.target.value);
        //console.log("Mail ",isValid);
    }
    if(event.target.name === 'password')
    {
      isValid = isValidPassword(event.target.value);
      //console.log("Password ",isValid);
    }
    if(event.target.name === 'name')
    {
      isValid = event.target.value.length>3;
    }

    newUser[event.target.name] = event.target.value;
    newUser.isValid = isValid;
    
    //console.log("is valid",isValid);
    setUser(newUser);
  }
  const createAccount = (event) =>{
    //debugger;
    if(user.isValid)
    {
      firebase.auth().createUserWithEmailAndPassword(user.email,user.password)
      .then(response => {
        //console.log(response);
        const createdUser = { ...user};
        createdUser.isSignedIn = true;
        createdUser.error="";
        setUser(createdUser);
      })
      .catch(error => {
        const errorMsg = error.message;
        const errorCode = error.code;
        const errors = errorCode+": "+errorMsg 
        handleError(errors);
      })

    }
    else
    {
      const errors = "Form is not Valid Format" 
      handleError(errors);
      //console.log("form is not valid.",{email:user.email+" ",password:user.password});
    }
    event.target.reset();
    event.preventDefault();
  }

  const signInUser = (event) => {

    firebase.auth().signInWithEmailAndPassword(user.email,user.password)
      .then(response => {
        console.log(response);
        const createdUser = { ...user};
        createdUser.isSignedIn = true;
        createdUser.error="";
        setUser(createdUser);
      })
      .catch(error => {
        const errorMsg = error.message;
        const errorCode = error.code;
        const errors = errorCode+": "+errorMsg 
        handleError(errors);
      })
    event.preventDefault();
    event.target.reset();
  }

  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Google Sign-out</button> : <button onClick={handleSignIn}>Google Sign-in</button>
      }
      <br/>
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Facebook Sign-out</button> : <button onClick={handleFacebookSignIn}>Facebook Sign-in</button>
      }
      
      {
        user.isSignedIn && <div>
          <h3>Welcome, {user.name}</h3>
          <h4>Your Email Address: {user.email}</h4>  
          <img src={user.photo} alt=""/>
        </div>
        
      }
      <h1>Our Authentication System</h1>
      {user.error && <p style={{backgroundColor:"red"}}>{user.error}</p>}

      <input type="checkbox" name="switchForm" onChange={switchForm} id="switchForm"/>
      <label htmlFor="switchForm">Already have an account?</label>
      
      <form style ={{display: user.existingUser? 'block':'none'}} onSubmit={signInUser}>
        <h3 style={{textAlign:'center'}}>Login</h3>
        <input type="text" onBlur={handleChange} name="email" placeholder="Enter your Email" id="" required/><br/>
        <input type="password" onBlur={handleChange} name="password" placeholder="Password eg.one letter,one number, one special character, length 6-20" id="" required/><br/>
        <input type="submit" value="Sign In"/>
      </form>

      <form style={{display: user.existingUser? 'none':'block'}} onSubmit={createAccount}>
        <h3 style={{textAlign:'center'}}>Sign-in</h3>
        <input type="text" onBlur={handleChange} name="name" placeholder="Enter your name" id="" required/><br/>
        <input type="text" onBlur={handleChange} name="email" placeholder="Enter your Email" id="" required/><br/>
        <input type="password" onBlur={handleChange} name="password" placeholder="Password eg.one letter,one number, one special character, length 6-20" id="" required/><br/>
        <input type="submit" value="Create Account"/>
      </form>
    </div>
  );
}

export default App;
