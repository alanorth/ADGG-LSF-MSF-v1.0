import React, { useState,useEffect,useContext } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {Card, CardContent, CardHeader, Grid,Divider,Tooltip ,TextField,colors,Button,CardActions,Box,Switch ,Typography } from '@material-ui/core';
import {getLookups,updateExit,getExitByEventId}   from '../../../../../../utils/API';
import {endpoint_lookup,endpoint_exit_update,endpoint_exit_specific} from '../../../../../../configs/endpoints';
import authContext from '../../../../../../contexts/AuthContext';
import {Sidebar} from '../index';
import SuccessSnackbar from '../../../../../../components/SuccessSnackbar';
import ErrorSnackbar from '../../../../../../components/ErrorSnackbar';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import {EventExitMetaData}  from '../../../Modal';


const useStyles = makeStyles(theme => ({
  root: {},
  saveButton: {
    color: theme.palette.white,
    backgroundColor: colors.green[600],
    '&:hover': {
      backgroundColor: colors.green[900]
    }
  }
}));

const DetailsEdit = props => {
  const {className, ...rest } = props; 
  const [openSnackbarSuccess, setopenSnackbarSuccess] = useState(false);
  const [openSnackbarError, setopenSnackbarError] = useState(false);
  const [ {user_id} ] = useContext(authContext);
  const classes = useStyles();
  const [values, setValues] = useState({ });
  const [exitTypes, setExitTypes] = useState([]);  
  const [readOnly, setReadOnly] = useState(true);
  const [openMetadata, setMetadata] = useState(false);   
  const event_id  = localStorage.getItem('exit_event_id');  
  


  useEffect(() => {   
    let mounted_lookup = true;
    let mounted_exit = true;    
    (async  (endpoint,id) => {     
        await  getLookups(endpoint,id)
        .then(response => {       
          if (mounted_lookup) { 

            const data = response.payload[0];                        
            let lookup_exit_types = [];                    

            for (let i = 0; i< data.length; i++){
              // exit types
              if(data[i].list_type_id === 82){                
                lookup_exit_types.push(data[i]);
              }  
            }  
            setExitTypes(lookup_exit_types);           
          }
        });
      })(endpoint_lookup,'82');

      (async  (endpoint,id) => {             
        await  getExitByEventId(endpoint,id)
        .then(response => {       
          if (mounted_exit) { 
            const data = response.payload[0][0];                       
            setValues(data);                         
          }
        });
      })(endpoint_exit_specific,event_id);
      

      
    return () => {
      mounted_lookup = false; 
      mounted_exit = false;    
    };
  }, [event_id]);   


  if (!exitTypes || !values) {
    return null;
  }

  console.log(values);

    const handleChange = event => {
    event.persist();
    setValues({
      ...values,
      [event.target.name]:event.target.type === 'checkbox' ? event.target.checked: event.target.value  
          
    });
  };


  const handleSubmit = event => {
    event.preventDefault();
    (async  (endpoint,id,values,user_id) => {     
      await  updateExit(endpoint,id,values,user_id)
      .then(() => {  
        setopenSnackbarSuccess(true);        
      }).catch(() => {
        setopenSnackbarError(true); 
      });
    })(endpoint_exit_update,event_id,values,user_id);    
  };
  

 
  
  
  const handleSnackbarSuccessClose = () => {
    setopenSnackbarSuccess(false);
  };

  const handleSnackbarErrorClose = () => {
    setopenSnackbarError(false);
  };

  const handleSwitchChange = event => {
    event.persist();
    setReadOnly(!readOnly);   
  };
  const handleMetadataOpen = () => {
    setMetadata(true);
  };

  const handleMetadataClose = () => {
    setMetadata(false);
  };

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >         
        <CardHeader title = { readOnly ? `View Exit/Disposal Details  #${localStorage.getItem('animal_id')}`:`Edit Exit/Disposal Details  #${localStorage.getItem('animal_id')}` } />
        <Divider />
        <CardContent> 
          <Grid container spacing={1} justify="center">            
          <Grid item  xs={1} >  
            <Sidebar/>
         </Grid> 
          <Grid item xs={11}>
            <Card> 
            <form id ='event' onSubmit={handleSubmit} >
              <CardContent>        
              <Grid
                container
                spacing={4}
              >
                  <Grid
                      item
                      md={3}
                      xs={12}
                  >
                    <TextField
                      fullWidth
                      InputLabelProps={{
                        shrink: true,
                      }}

                      inputProps={{
                        readOnly: Boolean(readOnly),
                        disabled: Boolean(readOnly)                
                      }}

                      required
                      margin = 'dense'
                      label = "Exit / Disposal Date"
                      type = "date"
                      name = "exit_date"                      
                      onChange = {handleChange}
                      variant = "outlined"
                      value = {values.exit_date}
                    />
                  </Grid>                  
                  <Grid
                    item
                    md={3}
                    xs={12}
                  >
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                
                    }}
                    margin = 'dense'
                    label="Exit / Disposal Reason"
                    name="disposal_reason"
                    onChange={handleChange}
                    required
                    default = ""                              
                    select
                    // eslint-disable-next-line react/jsx-sort-props
                    SelectProps={{ native: true }}                    
                    variant="outlined"
                    value = {values.disposal_reason}
                  >
                    <option value=""></option>
                    {exitTypes.map(exitType => (
                          <option                    
                            value={exitType.id}
                          >
                            {exitType.value}
                          </option>
                        ))
                    }           
                  </TextField>
                </Grid>

                <Grid
                    item
                    md={3}
                    xs={12}
                  >
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                
                    }}
                    margin = 'dense'
                    label="Other Exit Reason"
                    name="disposal_reason_other"                
                    onChange={handleChange}
                    variant="outlined" 
                    value = {values.disposal_reason_other} 
                    
                />
              </Grid>

                <Grid
                    item
                    md={3}
                    xs={12}
                  >
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                
                    }}
                    margin = 'dense'
                    label="Disposal Amount"
                    type = 'number'
                    name="disposal_amount"                
                    onChange={handleChange}
                    variant="outlined"  
                    value = {values.disposal_amount}
                    
                />
              </Grid> 

               <Grid
                  item
                  md={3}
                  xs={12}
                  >
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                
                    }}
                    //required
                    margin = 'dense'
                    label="New Farmer Name"
                    name="new_farmer_name"                                   
                    onChange={handleChange}                   
                    variant="outlined"
                    value = {values.new_farmer_name}                                                 
                  />
                </Grid>

                <Grid
                  item
                  md={3}
                  xs={12}
                  >
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                
                    }}
                    //required
                    margin = 'dense'
                    label="New Farmer Phone No"
                    name="new_farmer_phone_no"                                   
                    onChange={handleChange}                   
                    variant="outlined"  
                    value = {values.new_farmer_phone_no}                                               
                  />
                </Grid>

                <Grid
                  item
                  md={3}
                  xs={12}
                  >
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                
                    }}
                    //required
                    margin = 'dense'
                    label="New Breeder Name"
                    name="new_breeder_name"                                   
                    onChange={handleChange}                   
                    variant="outlined"  
                    value = {values.new_breeder_name}                                               
                  />
                </Grid>

                <Grid
                  item
                  md={3}
                  xs={12}
                  >
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                
                    }}
                    //required
                    margin = 'dense'
                    label="New Breeder Phone No"
                    name="new_breeder_phone_no"                                   
                    onChange={handleChange}                   
                    variant="outlined" 
                    value = {values.new_breeder_phone_no}                                                
                  />
                </Grid>

                <Grid
                  item
                  md={3}
                  xs={12}
                  >
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                
                    }}
                    //required
                    margin = 'dense'
                    label="New Country"
                    name="new_country"                                   
                    onChange={handleChange}                   
                    variant="outlined" 
                    value = {values.new_country}                                                
                  />
                </Grid>
                <Grid
                  item
                  md={3}
                  xs={12}
                  >
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                
                    }}
                    //required
                    margin = 'dense'
                    label="New Region"
                    name="new_region"                                   
                    onChange={handleChange}                   
                    variant="outlined" 
                    value = {values.new_region}                                                
                  />
                </Grid>
                <Grid
                  item
                  md={3}
                  xs={12}
                  >
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                
                    }}
                    //required
                    margin = 'dense'
                    label="New District"
                    name="new_district"                                   
                    onChange={handleChange}                   
                    variant="outlined" 
                    value = {values.new_district}                                                
                  />
                </Grid>                
              
                <Grid
                    item
                    md={3}
                    xs={12}
                  >
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                
                    }}
                    margin = 'dense'
                    label="New Village"
                    name="new_village"                
                    onChange={handleChange}
                    variant="outlined"  
                    value = {values.new_village}
                   
                />
              </Grid>

                  <Grid
                    item
                    md={3}
                    xs={12}
                  >
                  <TextField
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                
                    }}
                    margin = 'dense'
                    label="Field Agent"
                    name="field_agent_id"                
                    onChange={handleChange}
                    variant="outlined" 
                    value = {values.field_agent_id} 
                    
                />
              </Grid>
            
              </Grid>
          </CardContent>
          <Divider />
          <CardActions>          
          <Box flexGrow={1}>
            {readOnly ? null :                        
              <Button
                className={classes.saveButton}
                type="submit"
                variant="contained"
                hidden = "true"                               
              >
                Save Changes
              </Button>              
            }                             
          </Box> 
          <Box>
            <Tooltip  title="view Metadata">
              <Button onClick={handleMetadataOpen}>
                <OpenInNewIcon className={classes.buttonIcon} />                
              </Button>
            </Tooltip>               
          </Box>  
          <Box> 
              <Typography variant="h6">{ readOnly? "Enable Form" : "Disable Form"} </Typography> 
          </Box> 
          <Box> 
              <Switch             
                className={classes.toggle}            
                checked={values.readOnly}
                color="secondary"
                edge="start"               
                onChange={handleSwitchChange}
              />             
         </Box>
        </CardActions> 
        </form> 
        <SuccessSnackbar
          onClose={handleSnackbarSuccessClose}
          open={openSnackbarSuccess}
        />
        <ErrorSnackbar
          onClose={handleSnackbarErrorClose}
          open={openSnackbarError}
        />
         <EventExitMetaData
                exitDetails={values}
                onClose={handleMetadataClose}
                open={openMetadata}
        />   
          </Card>
          </Grid>
          </Grid>
        </CardContent>               
        
    </Card>
  );
};

DetailsEdit.propTypes = {
  className: PropTypes.string,
  //profile: PropTypes.object.isRequired
};

export default DetailsEdit;