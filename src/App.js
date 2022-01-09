import React, { useState } from 'react';
import axios from 'axios';
import LoginForm from './components/Login';
import RegisterForm from './components/register';
import './App.css';

function App() {
  const SUBPAGE = {
    MAIN: "MAIN",
    LOGIN: "LOGIN",
    REGISTER: "REGISTER"
  }

  //const [loggedUser, setLoggedUser] = useState({ name: "", email: "" })
  const [loggedUserIndex, setLoggedUserIndex] = useState(-1)
  //const [logged, setLogged] = useState(false)
  const [users, setUsers] = useState([])
  const [error, setError] = useState("")
  const [subpage, setSubpage] = useState(SUBPAGE.LOGIN)

  const Login = details => {
    console.log(details)
    axios.get('http://localhost:3001/users').then(response => {
      console.log(response.data)
      setUsers(response.data)
      //console.log(users)

      let logged = false

      response.data.forEach((user, index) => {
        if (user.email === details.email && user.password === details.password) {
          console.log("Logged in")
          logged = true
          //setLoggedUser(user)
          setLoggedUserIndex(index)
          setSubpage(SUBPAGE.MAIN)
        }
      });

      if (!logged) {
        console.log("Details do not match!")
        setError("Details do not match!")
      }
    })
  }

  const RegisterPage = () => {
    setSubpage(SUBPAGE.REGISTER)
  }

  const Register = details => {
    details.role = 1
    axios.post('http://localhost:3001/users', details).then(response => {
      setUsers(users.concat(details))
    })
    setSubpage(SUBPAGE.LOGIN)
  }

  const Logout = () => {
    //setLoggedUser({})
    setLoggedUserIndex(-1)
    setSubpage(SUBPAGE.LOGIN)
  }

  const DeleteUser = () => {
    if (window.confirm('Do you want to delete ' + users[loggedUserIndex].name)) {
      axios.delete('http://localhost:3001/users/' + users[loggedUserIndex].id)
      setUsers(users.filter(user => users[loggedUserIndex].id !== user.id))
    }
    setLoggedUserIndex(-1)
    setSubpage(SUBPAGE.LOGIN)
  }

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }



  const uploadData = () => {
    let uploadedFile = document.querySelector('#uploaded_file').files[0];
    const formData = new FormData();
    formData.append('file', uploadedFile)
    //console.log(formData.fi)
    //formData.append('')

    let data = {
      uploadedText: document.querySelector('#uploaded_text').value,
      uploadedFile: null
    }

    axios.post('http://localhost:3002/api/removeExif', formData, {
      headers: {
        'content-type': 'multipart/form-data',
      },
      'responseType': 'blob'
    }).then(response => {
      getBase64(response.data).then(base64file => {
        document.querySelector("#display_file").src = base64file
        data.uploadedFile = base64file
        axios.patch('http://localhost:3001/users/' + users[loggedUserIndex].id, data)
      })
    })


  }

  const displaySubpage = () => {
    switch (subpage) {
      case SUBPAGE.MAIN:
        return (
          <div className="welcome">
            <h2>Welcome <span>{users[loggedUserIndex].name}</span></h2>
            <form>
              <input id="uploaded_text" name="text" className="free_text" type="text" /><br /><br />
              <input id="uploaded_file" name="file" type="file" />
              { // <button className="button">Save</button>
              }
            </form><br />

            <img id="display_file" />

            <button className="button" onClick={uploadData}>Save</button>&nbsp;&nbsp;&nbsp;
            <button className="button" onClick={Logout}>Logout</button><br /><br /><br /><br />
            <button className="button" onClick={DeleteUser}>Delete User</button>
          </div>
        );

      case SUBPAGE.LOGIN:
        return (<LoginForm Login={Login} register={RegisterPage} error={error} />);

      case SUBPAGE.REGISTER:
        return (<RegisterForm Register={Register} />);
    }
  }

  return (
    <div className='App'>
      {
        displaySubpage()
      }
    </div>
  )
}

export default App;
