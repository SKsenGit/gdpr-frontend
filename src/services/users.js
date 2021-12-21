import axios from 'axios'
const baseUrl = 'http://localhost:3001/users'

const createNewAccount = (newObject) => {
    const request = axios.post(baseUrl, newObject)
    return request.then(response => { return response.data })
}

const userAuthentication = (login,password) => { 
   
    axios.get(baseUrl+"?login="+login)
    .then(function (user) {
      if (!user.hasOwnProperty('password')){
          return "Login is wrong!"
      }
      if (user.password === password){
        console.log(user);
        return user;
      }
      else{
        return "Password is wrong!"; 
      }
      
    })
    .catch(function (error) {
       
      console.log(error);
      return error;
    });
  
}


export default { createNewAccount, userAuthentication }