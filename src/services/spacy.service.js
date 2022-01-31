import axios from 'axios'
const API_URL = 'https://spacy-nlp-api.herokuapp.com/'

const getEntities = (text) => {
		return axios.post(API_URL + "ent", {
			text
		},{
            headers: {"Access-Control-Allow-Origin": "*"}
            
          });
}

export default getEntities;