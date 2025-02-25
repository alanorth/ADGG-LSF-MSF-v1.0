import React, { useState,useEffect,useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {Card, CardContent,CircularProgress,Fab, LinearProgress, Grid,Divider, TextField,colors,Button,CardActions,Box,Switch ,Typography,Tooltip } from '@material-ui/core';
import {getLookups,CreateOrEditInjuryRecord,getInjury,getAgents}   from '../../../../../../../../utils/API';
import {endpoint_lookup,endpoint_injury_edit,endpoint_injury_get,endpoint_agent} from '../../../../../../../../configs/endpoints';
import authContext from '../../../../../../../../contexts/AuthContext';
import {Sidebar} from '../index';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import {EventMetaData}  from '../../../../../Modal';
import moment from 'moment';
import { Page } from 'components';
import {default as Header} from '../../../../../Header/index';
import Alert from '@material-ui/lab/Alert';
import clsx from 'clsx';
import { green } from '@material-ui/core/colors';
import CheckIcon from '@material-ui/icons/Check';
import SaveIcon from '@material-ui/icons/Save';


const useStyles = makeStyles(theme => ({
  root: {
    width: theme.breakpoints.values.lg,
    maxWidth: '100%',
    margin: '0 auto',
    padding: theme.spacing(3)
  },
  saveButton: {
    color: theme.palette.white,
    backgroundColor: colors.green[600],
    '&:hover': {
      backgroundColor: colors.green[900]
    }
  },
  inner: {
    width: theme.breakpoints.values.lg,
    maxWidth: '100%',
    margin: '0 auto',
    padding: theme.spacing(3)
  },
  divider: {
    backgroundColor: colors.grey[300]
  },
  content: {
    marginTop: theme.spacing(3)
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  }
}));

const Edit = props => { 
  const classes = useStyles();
  sessionStorage.setItem('injury_record_id', parseInt(props.match.params.id));   
  const [ {user_id,organization_id} ] = useContext(authContext);
  const [values, setValues] = useState({ });  
  const [healthStatus, setHealthStatus] = useState([]);
  const [healthProvider, setHealthProvider] = useState([]);
  const [animalInjuries, setAnimalInjuries] = useState([]);
  const [readOnly, setReadOnly] = useState(true);
  const [openMetadata, setMetadata] = useState(false);  
  const record_id  = sessionStorage.getItem('injury_record_id'); 
  const animal_tag  = sessionStorage.getItem('animal_tag'); 
  const  dob = sessionStorage.getItem('animal_dob'); 
  const [agents, setAgents] = useState([]);
  const option  =  0; 
  const [isLoading, setIsLoading] = useState(true);
  const [output, setOutput] = useState({status:null, message:""}); 
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const timer = React.useRef();

  const buttonClassname = clsx({
    [classes.buttonSuccess]: success,
  });

  useEffect(() => {   
    let mounted_lookup = true;
    let mounted_injury_records = true;  
    let mounted_agents = true;

    (async  (endpoint,org_id,option) => {     
      await  getAgents(endpoint,org_id,option)
      .then(response => {                        
        if (mounted_agents) {            
          setAgents(response.payload);                 
        }
      });
    })(endpoint_agent,organization_id,option); 

    (async  (endpoint,id) => {     
      await  getLookups(endpoint,id)
      .then(response => {       
        if (mounted_lookup) { 
          const data = response.payload[0];  
          let lookup_health_status = [];  
          let lookup_health_provider = [];
          let lookup_animal_injuries = [];  

          for (let i = 0; i< data.length; i++){ 
             //Health Status
             if(data[i].list_type_id === 89){                
              lookup_health_status.push(data[i]);
            } 

            //Health Provider
            if(data[i].list_type_id === 47){                
              lookup_health_provider.push(data[i]);
            }   
            
            //Animal Injuries
            if(data[i].list_type_id === 81){                
              lookup_animal_injuries.push(data[i]);
            }  
          }  
          setHealthStatus(lookup_health_status);
          setHealthProvider(lookup_health_provider);
          setAnimalInjuries(lookup_animal_injuries);
        }
      });
    })(endpoint_lookup,'89,47,81');

     

      (async  (endpoint,id,option) => {     
        await  getInjury(endpoint,id,option)
        .then(response => {                        
          if (mounted_injury_records) {            
            setValues(response.payload[0]);  
            setIsLoading(false);                 
          }
        });
      })(endpoint_injury_get,record_id,2);

    return () => {
      mounted_lookup = false;  
      mounted_injury_records = false;   
      mounted_agents = false;  
    };
  }, [record_id,organization_id]);  

  if (!healthStatus || !healthProvider || !animalInjuries ||!values || !agents) {
    return null;
  }

    const handleChange = event => {
    event.persist();
    setValues({
      ...values,
      [event.target.name]:event.target.type === 'checkbox' ? event.target.checked: event.target.value  
          
    });
  };

  
  const handleSubmit = event => {
    event.preventDefault();
    if (!loading) {
      setSuccess(false);
      setLoading(true);
    }
    (async  (endpoint,id,values,user_id) => {     
      await  CreateOrEditInjuryRecord(endpoint,id,values,user_id)
      .then((response) => {        
        setOutput({status:null, message:''});      
        timer.current = window.setTimeout(() => {
          setSuccess(true);
          setLoading(false);          
          if (parseInt(response.status) === 1){               
            setOutput({status:parseInt(response.status), message:response.message}) 
          } else {
            setOutput({status:parseInt(response.status), message:response.message})
          } 
        }, 500);
                      
    }).catch((error) => {
      setOutput({status:0, message:error.message})
      setSuccess(false);
      setLoading(false);
    });
    })(endpoint_injury_edit,record_id,values,user_id);    
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
    <Page
      className={classes.root}
      title="injury"
    >
      <Typography
      component="h1"
      gutterBottom
      variant="h3"
      >
       { readOnly ? `INJURY : ${animal_tag}` :`EDIT INJURY : ${animal_tag}`}
      </Typography>
      <br/>         
      <Header />
      <br/>
      { isLoading  &&
        <LinearProgress/>
      } 

      <Grid container spacing={1} justify="center">            
          <Grid item  xs={1} >  
            <Sidebar/>
         </Grid> 
          <Grid item xs={11}>
            <Card> 
            <form id ='event' onSubmit={handleSubmit} >
              <CardContent> 
              {output.status === 0 ?
              <>
              <Alert severity="error" >{output.message}</Alert>             
              </>
              :output.status === 1 ?
              <>
              <Alert severity="success" >{output.message}</Alert>           
              </>
              :null
              }          
              <br/> 
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
                        readOnly: true,
                        disabled: true,                      
                        max: moment(new Date()).format('YYYY-MM-DD'),
                        min : dob                 
                      }}                
                      
                      required
                      label="Treatment Date"
                      type="date"
                      name="treatmentDate"                      
                      onChange={handleChange}
                      variant="outlined"
                      value = {values.treatmentDate}   
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
                    required
                    
                    label="Injury Type"
                    name="injury_type"
                    onChange={handleChange}                   
                    default = ""                              
                    select                    
                    SelectProps={{ native: true }}                    
                    variant="outlined"
                    value = {values.injury_type}   
                  >
                    <option value=""></option>
                    {
                      animalInjuries.map(x => (
                        <option                    
                          value={x.id}
                        >
                          {x.value}
                        </option>
                      ))
                    }           
                  </TextField>
                </Grid>
                {  parseInt(values.injury_type) === -66 ? 
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
                      
                      label="Other Injury Type"
                      name="injury_type_other"
                      onChange={handleChange}                     
                      multiline  
                      rowsMax = {2} 
                      rows = {1}       
                      variant="outlined"
                      value = {values.injury_type_other}   
                    />
                     
                  </Grid>
                   : null
                  }
                  
                  <Grid
                    item
                    md={3}
                    xs={12}
                  >
                  <TextField
                    fullWidth                    
                    InputLabelProps={{
                      shrink: true                      
                    }}  
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                                   
                    }}  
                    required                                   
                    
                    label="Service Provider"
                    name="injury_service_provider"
                    onChange={handleChange}                                                
                    select                    
                    SelectProps={{ native: true }}                    
                    variant="outlined"
                    value = {values.injury_service_provider}   
                  >
                    <option value=""></option>
                    {healthProvider.map(x => (
                          <option                    
                            value={x.id}
                          >
                            {x.value}
                          </option>
                        ))
                    }           
                  </TextField>
                </Grid>
                {  parseInt(values.injury_service_provider) === -66 ?
                <Grid
                    item
                    md={3}
                    xs={12}
                  >
                  <TextField
                    fullWidth                    
                    InputLabelProps={{
                      shrink: true                      
                    }}   
                    inputProps={{
                      readOnly: Boolean(readOnly),
                      disabled: Boolean(readOnly)                                   
                    }}                                                   
                    
                    label = "Other Service Provider"
                    name = "other_service_provider"
                    onChange = {handleChange} 
                    multiline  
                    rowsMax = {2} 
                    rows = {1}        
                    variant="outlined"
                    value = {values.other_service_provider}   
                  />
                   
                </Grid>
                    : null
                  }
                
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
                    
                    label="Drugs Cost"
                    name="injury_drug_cost"
                    onChange={handleChange}                   
                    type = "number"  
                    variant="outlined"
                    value = {values.injury_drug_cost}   
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
                    
                    type = 'number'
                    label="Service Cost"
                    name="injury_service_cost"
                    onChange={handleChange}                    
                    default = "" 
                    variant="outlined"
                    value = {values.injury_service_cost}   
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
                    required
                    
                    label="Animal Status"
                    name="injury_cow_status"
                    onChange={handleChange}                   
                    default = ""                              
                    select                    
                    SelectProps={{ native: true }}                    
                    variant="outlined"
                    value = {values.injury_cow_status}   
                  >
                    <option value=""></option>
                    {healthStatus.map(x => (
                          <option                    
                            value={x.id}
                          >
                            {x.value}
                          </option>
                        ))
                    }           
                  </TextField>
                  </Grid> 

                  {  parseInt(values.injury_cow_status) === -66 ?
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
                    
                    label="Other Animal Status"
                    name="injury_cow_status_other"
                    onChange={handleChange}                   
                    multiline  
                    rowsMax = {2} 
                    rows = {1}         
                    variant="outlined"
                    value = {values.injury_cow_status_other}   
                  />
                  </Grid> 
                  : null
                }

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
                    
                    label="Examinar"
                    name="field_agent_id"                
                    onChange={handleChange}
                    default = ""                              
                    select                   
                    SelectProps={{ native: true }}                    
                    variant="outlined"
                    value = {values.field_agent_id}   
                  >
                    <option value=""></option>
                    {agents.map(agent => (
                          <option                    
                            value={agent.id}
                          >
                            {agent.name}
                          </option>
                        ))
                    }           
                  </TextField>
              </Grid>
            
              </Grid>
              
              </CardContent>
          <Divider />
          <CardActions>                                
              {readOnly ? null :  
                <>    
                  <div className={classes.wrapper}>
                    <Fab
                      aria-label="save"
                      color="primary"
                      className={buttonClassname}
                    >
                      {success ? <CheckIcon /> : <SaveIcon />}
                    </Fab>
                    {loading && <CircularProgress size={68} className={classes.fabProgress} />}
                  </div>
                  <div className={classes.wrapper}>
                    <Button
                      variant="contained"
                      color="primary"
                      className={buttonClassname}
                      disabled={loading}                
                      type="submit"
                    >
                      Save Changes
                    </Button>
                    {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                  </div>
                  </>             
            }                             
        
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
        
        <EventMetaData
          Details={values}
          onClose={handleMetadataClose}
          open={openMetadata}
        /> 
        </Card>
        </Grid>
      </Grid>
        
    
     
   </Page>
  );
};

Edit.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default Edit;
