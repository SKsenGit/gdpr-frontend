//import logo from './logo.svg';
import './App.css';
import React from 'react';
import Authentication from './components/Authentication'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isGuest:true,
      user_login:'',
      user_name:'',
      access_token:'',
      user_roles:[]      
    }
  }
  componentDidMount() {
    
  }

  render() {   
    return (
      <div>
        <Authentication/>
        <h2>GDPR detecting system</h2>
      </div>
    )
  }

}

export default App;
