import React, { useState, useEffect,useContext } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';
import { ProfileDetails, GeneralSettings } from './components';
import authContext from '../../../../contexts/AuthContext';
import {endpoint_user_profile_details,endpoint_timezones,endpoint_countries} from '../../../../configs/endpoints';
import {getProfileDetails,getTimezones,getCountries,getCountryById}   from '../../../../utils/API';

const useStyles = makeStyles(() => ({
  root: {}
}));
const General = props => {
  const { className, ...rest } = props;
  const [ { user_id,country_id }  ] = useContext(authContext);  

  const classes = useStyles();
  const [profile, setProfile] = useState(null);
  const [timezones, setTimezones] = useState(null);
  const [countries, setCountries] = useState(null);
  const [country, setCountry] = useState(null);


  useEffect(() => {
    let mounted = true;

    const fetchProfile = () => {     
      getProfileDetails(endpoint_user_profile_details,user_id)
      .then(response => {       
        if (mounted) {
          setProfile(response.payload[0]);
        }
      });
    };
    fetchProfile(user_id);

    const fetchTimezones = () => {     
      getTimezones(endpoint_timezones)
      .then(response => {       
        if (mounted) {
          setTimezones(response.payload);
        }
      });
    };
    fetchTimezones();
    
    //fetch countries
    const fetchCountries = () => {     
      getCountries(endpoint_countries)
      .then(response => {       
        if (mounted) {
          setCountries(response.payload);
        }
      });
    };
    fetchCountries();

    //fetch countries
   // const _country_id = isNaN(country_id)? 10:country_id;
    //console.log(`country unit ${_country_id}`);


    const fetchCountry = () => {     
      getCountryById(endpoint_countries,isNaN(country_id)? 11:country_id)
      .then(response => {       
        if (mounted) {
          setCountry(response.payload[0]);
        }
      });
    };
    fetchCountry(country_id);   
    return () => {
      mounted = false;
    };
  }, [user_id,country_id]);

  if (!profile) {
    return null;
  }

  if (!timezones) {
    return null;
  }

  return (
    <Grid
      {...rest}
      className={clsx(classes.root, className)}
      container
      spacing={3}
    >
      <Grid
        item
        lg={4}
        md={6}
        xl={3}
        xs={12}
      >
        <ProfileDetails profile={profile} />
      </Grid>
      <Grid
        item
        lg={8}
        md={6}
        xl={9}
        xs={12}
      >
        <GeneralSettings profile={profile}  timezones = {timezones} countries ={countries} country_unit={country}/>
      </Grid>
    </Grid>
  );
};

General.propTypes = {
  className: PropTypes.string
};
export default General;
