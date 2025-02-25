import React, { useState,useEffect,useContext } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {Card, CardContent, Typography,LinearProgress, Grid,Divider,colors,Link} from '@material-ui/core';
import {getAgents}   from '../../../../../../utils/API';
import {endpoint_agent} from '../../../../../../configs/endpoints';
import authContext from '../../../../../../contexts/AuthContext';
import MUIDataTable from "mui-datatables";
import {MuiThemeProvider } from '@material-ui/core/styles';
import PerfectScrollbar from 'react-perfect-scrollbar';
import CustomToolbar from "../CustomToolbar";
import { Link as RouterLink } from 'react-router-dom';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { Page } from 'components';

const useStyles = makeStyles(theme => ({
  root: {
    width: theme.breakpoints.values.lg,
    maxWidth: '100%',
    margin: '0 auto',
    padding: theme.spacing(3)
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
  }
}));

const Edit = props => { 
  const classes = useStyles();  
  const [values, setValues] = useState([]);
  const [ {organization_id}  ] = useContext(authContext);
  const [loading, setLoading] = useState(true); 
  const option  =  0;

  useEffect(() => {     
    let mounted = true;
      (async  (endpoint,org_id,option) => {     
        await  getAgents(endpoint,org_id,option)
        .then(response => {                        
          if (mounted) {            
            setValues(response.payload); 
            setLoading(false);                  
          }
        });
      })(endpoint_agent,organization_id,option);       

      
    return () => {
      mounted = false;           
    };
  }, [organization_id]); 

  if (!values) {
    return null;
  }     
 
    const columns = [
    { name: "id",label: "ID",options: {filter: false,sort: false,display:false}},   
    { name: "name",label: "Name",options: {filter: false,sort: true,display:true}},
    { name: "occupation",label: "Occupation",options: {filter: false,sort: true,display:true}},  
    { name: "affiliation_name",label: "Affiliation",options: {filter:true,sort: true,display:true}},
    { name: "physical_address",label: "Physical Address",options: {filter: true,sort: false,display:true}}, 
    { name: "country",label: "Country",options: {filter: true,sort: false,display:true}},   
    { name: "phone",label: "Phone",options: {filter: false,sort: false,display:true}}, 
    { name: "email",label: "Email",options: {filter: false,sort: false,display:true}},
    { name: "services_offered",label: "Services",options: {filter: false,sort: false,display:true}},
      
    { name: "",
      options: {
      filter: false,
      sort: false,  
      empty:true,    
      customBodyRender: (value, tableMeta, updateValue) => {        
        return (
          <Link
              component={RouterLink}
              to = {`/settings/partners/agents/edit/${tableMeta.rowData[0]}`}              
          >
            <OpenInNewIcon/>
          </Link>          
        );
      }
    }
  }    
  ];   
  const options = {       
    filter: true,
    rowsPerPage: 5,       
    rowsPerPageOptions :[5,10,20,50,100],
    selectableRows: 'none',      
    filterType: 'checkbox',
    responsive: 'stacked',                
    rowHover: true,       
    setTableProps: () => {
     return {
       padding: "none" ,         
       size: "small",
     };
   },
   customToolbar: () => {
    return (
      <CustomToolbar />
    );
  }  
  };
  return (
    <Page
      className={classes.root}
      title="AGENTS"
    >
      <Typography
      component="h1"
      gutterBottom
      variant="h3"
    >
      AGENTS  
    </Typography>
    { loading  &&
      <LinearProgress/>
    }  
    <Divider />  
    <br/>    

      <Grid container spacing={1} justify="center">   
          <Grid item xs={12}>
              <Card> 
                <CardContent>                 
                  <PerfectScrollbar>                   
                      <MuiThemeProvider>                
                        <MUIDataTable
                          title = ""
                          data={values}
                          columns={columns}
                          options={options}
                        />
                      </MuiThemeProvider>                   
                  </PerfectScrollbar> 
                </CardContent>
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
