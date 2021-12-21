import axios from 'axios'
const baseUrl = 'http://localhost:3001/users'

const createNewAccount = (newObject) => {
  const accountExist = axios.get(baseUrl+"?login="+newObject.login)
  .then(function (user) {
    if (user.hasOwnProperty('password')){
        return true;
      }
    else{
      return false;        
    }
  })
  if(accountExist){
    return "Login already exists!"
  }
  else{
    const request = axios.post(baseUrl, newObject)
    return request.then(response => { return response.data })
  }
}

const userAuthentication = (login,password) => { 
   
    const result = axios.get(baseUrl+"?login="+login)
    .then(function (user) {
      if (!user.hasOwnProperty('password')){
          return "Login doesn't exist!"
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

    return result;
  
}
export default { createNewAccount, userAuthentication }