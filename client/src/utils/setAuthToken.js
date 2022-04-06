import axios from 'axios'
// import { set } from 'express/lib/application';

//send x-auth-token in all headers

const setAuthToken = token => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
}

export default setAuthToken;