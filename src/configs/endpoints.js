import {api,headers} from '../configs';

//user authentication
export const endpoint_user_authentication = {
    url: `${api}/user/auth`,
    method: 'GET',
    headers: headers   
  }; 

//user profile details
export const endpoint_user_profile_details = {
  url: `${api}/user/`,
  method: 'GET',
  headers: headers   
};  

//timezone list
export const endpoint_timezones = {
  url: `${api}/timezones`,
  method: 'GET',
  headers: headers   
};   

//country list
export const endpoint_countries = {
  url: `${api}/countries`,
  method: 'GET',
  headers: headers   
};  

