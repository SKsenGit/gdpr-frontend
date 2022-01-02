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

  function getRemoveEXIF(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(removeEXIF(fr.result))
      fr.readAsArrayBuffer(file);
      fr.onerror = e => reject(e)
    })
    //window.open(URL.createObjectURL(this.files[0]), "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=400, height=400");
  }

  // https://stackoverflow.com/a/27638728
  function removeEXIF(file) {
    const dv = new DataView(file);
    let offset = 0, recess = 0;
    let pieces = [];
    let i = 0;

    if (dv.getUint16(offset) == 0xffd8) {
      offset += 2;
      let app1 = dv.getUint16(offset);
      offset += 2;

      while (offset < dv.byteLength) {
        if (app1 === 0xffe1) {
          pieces[i] = { recess: recess, offset: offset - 2 };
          recess = offset + dv.getUint16(offset);
          i++;
        } else if (app1 === 0xffda) {
          break;
        }
        offset += dv.getUint16(offset);
        app1 = dv.getUint16(offset);
        offset += 2;
      }

      if (pieces.length > 0) {
        let newPieces = [];
        pieces.forEach(function (v) {
          newPieces.push(file.slice(v.recess, v.offset));
        }, this);
        newPieces.push(file.slice(recess));
        const br = new Blob(newPieces, { type: 'image/jpeg' });

        return br
      }
    }
  }

  const uploadData = () => {
    let uploadedFile = document.querySelector('#uploaded_file').files[0];
    let data = {
      uploadedText: document.querySelector('#uploaded_text').value,
      uploadedFile: null
    }

    getRemoveEXIF(uploadedFile).then(exifRMedFile => {
      getBase64(exifRMedFile).then(
        base64file => {
          document.querySelector("#display_file").src = base64file
          data.uploadedFile = base64file
          axios.patch('http://localhost:3001/users/' + users[loggedUserIndex].id, data)
          setUsers(prevUsers =>
            prevUsers.map((el, ind) =>
              ind === loggedUserIndex ? { ...el, uploadedText: data.uploadedText, uploadedFile: data.uploadedFile } : el))
        });
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
      /*
        (subpage == "MAIN") ? (<div className="welcome">
          <h2>Welcome <span>{adminUser.name}</span></h2>

          <form>
            <input className="free_text" type="text" /><br /><br />
            <input type="file" />
          </form><br />
          <button className="button" onClick={Logout}>Logout</button>
        </div>) : (<LoginForm Login={Login} error={error} />)
      */}
    </div>
  )
}

export default App;
