import React, { useState, useEffect } from 'react';
import validate from 'validate.js';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {Button, TextField } from '@material-ui/core';
import { resetPassword}   from '../../../../utils/API';
import {endpoint_reset_password} from '../../../../configs/endpoints';
import Alert from '@material-ui/lab/Alert';

const schema = {
  
  email: {
    presence: { allowEmpty: false, message: 'is required' },
    email: true,
    length: {
      maximum: 64
    }
  }  
};

const useStyles = makeStyles(theme => ({
  root: {},
  fields: {
    margin: theme.spacing(-1),
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      flexGrow: 1,
      margin: theme.spacing(1)
    }
  }, 
  submitButton: {
    marginTop: theme.spacing(2),
    width: '100%'
  }
}));

const ForgotPasswordForm = props => {
  const { className, ...rest } = props;
  const classes = useStyles();

  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {}
  });
  const [output, setOutput] = useState({status:null, message:""}); 

  useEffect(() => {
    const errors = validate(formState.values, schema);
    setFormState(formState => ({
      ...formState,
      isValid: errors ? false : true,
      errors: errors || {}
    }));
  }, [formState.values]);

  const handleChange = event => {
    event.persist();

    setFormState(formState => ({
      ...formState,
      values: {
        ...formState.values,
        [event.target.name]:
          event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value
      },
      touched: {
        ...formState.touched,
        [event.target.name]: true
      }
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    (async  (endpoint,values,email,user_id) => {     
      await  resetPassword(endpoint,values,email,user_id)
      .then((response) => {        
        setOutput({status:null, message:''});
        if (parseInt(response.status) === 1){           
          setFormState( {
            isValid: false,
            values: {},
            touched: {},
            errors: {}
          }) ; 
          setOutput({status:parseInt(response.status), message:response.message})      
          document.forms["event"].reset();
        } else {
          setOutput({status:parseInt(response.status), message:response.message})
        }
        
      }).catch((error) => {        
        setOutput({status:0, message:error.message})
      });
    })(endpoint_reset_password,formState.values);    

  };

  const hasError = field =>
    formState.touched[field] && formState.errors[field] ? true : false;

  return (
    <form
      {...rest}
      className={clsx(classes.root, className)}
      onSubmit={handleSubmit}
      id ='event'
    >
      <div className={classes.fields}>
      {output.status === 0 ?
              <>
              <Alert severity="error" >{output.message}</Alert>
              <br/><br/>
              </>
            :output.status === 1 ?
            <>
            <Alert severity="success" >{output.message}</Alert>
            <br/><br/>
            </>
            :null
            }

        
        
        <TextField
          error={hasError('email')}
          fullWidth
          helperText={hasError('email') ? formState.errors.email[0] : null}
          label="Email address"
          name="email"
          onChange={handleChange}
          value={formState.values.email || ''}
          variant="outlined"
        />
       
        
      </div>
      <Button
        className={classes.submitButton}
        color="secondary"
        disabled={!formState.isValid}
        size="large"
        type="submit"
        variant="contained"
      >
        Submit Request
      </Button>
    </form>
  );
};

ForgotPasswordForm.propTypes = {
  className: PropTypes.string
};

export default ForgotPasswordForm;
