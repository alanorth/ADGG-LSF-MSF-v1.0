import React, { useState,useEffect,useContext } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {Card, CardContent, CardHeader, Grid,Divider, TextField,colors,Button,CardActions,Box,Switch ,Typography,Tooltip } from '@material-ui/core';
import {getLookups,postInsemination,getInseminationEventById}   from '../../../../../../utils/API';
import {endpoint_lookup,endpoint_insemination_add,endpoint_insemination_specific} from '../../../../../../configs/endpoints';
import authContext from '../../../../../../contexts/AuthContext';
import {Sidebar} from '../index';
import SuccessSnackbar from '../../../../../../components/SuccessSnackbar';
import ErrorSnackbar from '../../../../../../components/ErrorSnackbar';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import {EventHealthMetaData}  from '../../../Modal';

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
  const [body_scores, setBodyScores] = useState([]);
  const [breed_compositions, setBreedCompositions] = useState([]);
  const [semen_sources, setSemenSources] = useState([]);
  const [bull_breeds, setBullBreeds] = useState([]);
  const [semen_types, setSemenTypes] = useState([]);
  const [ai_types, setAiTypes] = useState([]);
  const [readOnly, setReadOnly] = useState(true);
  const [openMetadata, setMetadata] = useState(false);   
  const event_id  = localStorage.getItem('insemination_event_id');   
  const animal_id  = localStorage.getItem('animal_id');

  useEffect(() => {   
    let mounted_lookup = true;
    let mounted_insemination = true;
    
    (async  (endpoint,id) => {     
        await  getLookups(endpoint,id)
        .then(response => {       
          if (mounted_lookup) { 

            const data = response.payload[0];                        
            let lookup_body_scores = [];
            let lookup_breed_compositions = [];
            let lookup_semen_sources = [];
            let lookup_semen_types = [];
            let lookup_ai_types = [];
            let lookup_breed = [];         

            for (let i = 0; i< data.length; i++){              
              // body condition scores
              if(data[i].list_type_id === 71){                
                lookup_body_scores.push(data[i]);
              } 

              //breed compositions
              if(data[i].list_type_id === 14){                
                lookup_breed_compositions.push(data[i]);
              }  

              //semen sources
              if(data[i].list_type_id === 74){                
                lookup_semen_sources.push(data[i]);
              } 

              //semen types
              if(data[i].list_type_id === 73){                
                lookup_semen_types.push(data[i]);
              } 

              //ai Types
              if(data[i].list_type_id === 72){                
                lookup_ai_types.push(data[i]);
              } 
              
              //bull breeds
              if(data[i].list_type_id === 8){                
                lookup_breed.push(data[i]);
              }  
            }  

            setBodyScores(lookup_body_scores);
            setBreedCompositions(lookup_breed_compositions);
            setSemenSources(lookup_semen_sources);
            setBullBreeds(lookup_breed);
            setSemenTypes(lookup_semen_types);
            setAiTypes(lookup_ai_types);
          }
        });
      })(endpoint_lookup,'8,14,71,72,73,74');

      (async  (endpoint,id) => {             
        await  getInseminationEventById(endpoint,id)
        .then(response => {       
          if (mounted_insemination) { 
            const data = response.payload[0][0];                       
            setValues(data);                         
          }
        });
      })(endpoint_insemination_specific,event_id);
      

      
    return () => {
      mounted_lookup = false;
      mounted_insemination = false;     
    };
  }, [event_id]);   


  if (!values|| !breed_compositions || !body_scores || !semen_sources ||!bull_breeds || !semen_types || !ai_types) {
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
    (async  (endpoint,id,values,user_id) => {     
      await  postInsemination(endpoint,id,values,user_id)
      .then(() => {  
        setopenSnackbarSuccess(true);         
      }).catch(() => {
        setopenSnackbarError(true); 
      });
    })(endpoint_insemination_add,animal_id,values,user_id);    
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
      
        <CardHeader title= { readOnly ? `View Insemination Event Record  #${localStorage.getItem('animal_id')}`:`Edit Insemination Event Record  #${localStorage.getItem('animal_id')}` } />
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
                      value = {values.service_date}
                      required
                      margin = 'dense'
                      label = "AI Service Date"
                      type = "date"
                      name = "service_date"                      
                      onChange = {handleChange}
                      variant = "outlined"
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
                    value = {values.ai_type}
                    margin = 'dense'
                    label="AI Type"
                    name="ai_type"
                    onChange={handleChange}
                    required
                    default = ""                              
                    select
                    // eslint-disable-next-line react/jsx-sort-props
                    SelectProps={{ native: true }}                    
                    variant="outlined"
                  >
                    <option value=""></option>
                    {ai_types.map(ai_type => (
                          <option                    
                            value={ai_type.id}
                          >
                            {ai_type.value}
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
                    value = {values.semen_batch}
                    margin = 'dense'
                    label="Semen Batch"
                    name="semen_batch"                
                    onChange={handleChange}
                    variant="outlined"  
                    
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
                    value = {values.straw_id}
                    margin = 'dense'
                    label="Straw ID"
                    name="straw_id"                
                    onChange={handleChange}
                    variant="outlined"  
                    
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
                        shrink: true                      
                      }}    
                      inputProps={{
                        readOnly: Boolean(readOnly),
                        disabled: Boolean(readOnly)                
                      }}
                      value = {values.straw_semen_type}                                   
                      margin = 'dense'
                      label="Straw Semen Type"
                      name="straw_semen_type"
                      onChange={handleChange}                                                
                      select
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}                    
                      variant="outlined"
                    >
                      <option value=""></option>
                      {semen_types.map(semen_type => (
                            <option                    
                              value={semen_type.id}
                            >
                              {semen_type.value}
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
                      value = {values.source_of_semen}
                      margin = 'dense'
                      label="Semen Source"
                      name="source_of_semen"
                      onChange={handleChange}                     
                      default = ""                              
                      select
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}                    
                      variant="outlined"
                    >
                      <option value=""></option>
                      {semen_sources.map(semen_source => (
                            <option                    
                              value={semen_source.id}
                            >
                              {semen_source.value}
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
                        shrink: true                      
                      }}   
                      inputProps={{
                        readOnly: Boolean(readOnly),
                        disabled: Boolean(readOnly)                
                      }}
                      value = {values.other_Semen_source}                                    
                      margin = 'dense'
                      label="Other Semen Source"
                      name="other_Semen_source"
                      onChange={handleChange}                                                
                      select
                      // eslint-disable-next-line react/jsx-sort-props
                      SelectProps={{ native: true }}                    
                      variant="outlined"
                    >
                      <option value=""></option>
                      {semen_sources.map(semen_source => (
                            <option                    
                              value={semen_source.id}
                            >
                              {semen_source.value}
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
                    value = {values.breed_of_bull}
                    margin = 'dense'
                    label="Bull Breed"
                    name="breed_of_bull"
                    onChange={handleChange}
                    //required
                    default = ""                              
                    select
                    // eslint-disable-next-line react/jsx-sort-props
                    SelectProps={{ native: true }}                    
                    variant="outlined"
                  >
                    <option value=""></option>
                    {bull_breeds.map(bull_breed => (
                          <option                    
                            value={bull_breed.id}
                          >
                            {bull_breed.value}
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
                    value = {values.other_breed_of_bull}
                    margin = 'dense'
                    label="Other Bull Breed"
                    name="other_breed_of_bull"
                    onChange={handleChange}
                    //required
                    default = ""                              
                    select
                    // eslint-disable-next-line react/jsx-sort-props
                    SelectProps={{ native: true }}                    
                    variant="outlined"
                  >
                    <option value=""></option>
                    {bull_breeds.map(bull_breed => (
                          <option                    
                            value={bull_breed.id}
                          >
                            {bull_breed.value}
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
                    value = {values.breed_composition}
                    margin = 'dense'
                    label="Bull Breed Composition"
                    name="breed_composition"
                    onChange={handleChange}
                    //required
                    default = ""                              
                    select
                    // eslint-disable-next-line react/jsx-sort-props
                    SelectProps={{ native: true }}                    
                    variant="outlined"
                  >
                    <option value=""></option>
                    {breed_compositions.map(breed_composition => (
                          <option                    
                            value={breed_composition.id}
                          >
                            {breed_composition.value}
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
                    value = {values.origin_country_bull}
                    margin = 'dense'
                    label="Bull Origin Country"
                    name="origin_country_bull"                
                    onChange={handleChange}
                    variant="outlined"                     
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
                        value = {values.body_condition_score}
                        margin = 'dense'
                        label="Cow Body Condition"
                        name="body_condition_score"
                        onChange={handleChange}
                        //required
                        default = ""                              
                        select
                        // eslint-disable-next-line react/jsx-sort-props
                        SelectProps={{ native: true }}                    
                        variant="outlined"
                      >
                        <option value=""></option>
                        {body_scores.map(body_score => (
                              <option                    
                                value={body_score.id}
                              >
                                {body_score.value}
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
                    value = {values.cost}
                    //required
                    margin = 'dense'
                    label="AI Cost"
                    name="cost"                                   
                    onChange={handleChange}
                    type="number"
                    variant="outlined"                                                 
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
                    value = {values.cow_weight}
                    margin = 'dense'
                    label="Cow weight(kg)"
                    name="cow_weight"                
                    onChange={handleChange}
                    variant="outlined"  
                    type="number"
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
                    value = {values.field_agent_id}
                    margin = 'dense'
                    label="Field Agent"
                    name="field_agent_id"                
                    onChange={handleChange}
                    variant="outlined"  
                    
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
        <EventHealthMetaData
                healthDetails={values}
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