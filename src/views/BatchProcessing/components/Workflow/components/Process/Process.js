import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, colors, Stepper, Step, StepLabel, Typography } from '@material-ui/core';
import { genericFunctionThreeParameters } from '../../../../../../utils/API';
import { endpoint_batch_validation_view } from '../../../../../../configs/endpoints';
import { Upload, Validate, Post } from './components';
import { Page } from 'components';

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

function getSteps() {
  return ['Upload Batch', 'Validate Batch', 'Post Batch'];
}

function getStepContent(step, records, batch_info,batchType) {
  switch (step) {
    case 0:
      return <Upload batchType = {batchType} />;
    case 1:
      return <Validate UploadedRecords={records} step={step} batchInfo={batch_info} />;
    case 2:
      return <Post UploadedRecords={records} batchInfo={batch_info} />;
    default:
      return 'Unknown step';
  }
};

const Process = props => {
  const classes = useStyles();
  const { batchInfo,batchType } = props;
  const uuid = batchInfo.uuid;
  const [values, setValues] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const steps = getSteps();

  const title =  
  batchType === 1 ? "WORKFLOW : MILK BATCH": 
  batchType === 2 ? "WORKFLOW : WEIGHT BATCH":
  batchType === 3 ? "WORKFLOW : PD BATCH":
  batchType === 4 ? "WORKFLOW : EXIT BATCH":
  batchType === 5 ? "WORKFLOW : AI BATCH":
  batchType === 6 ? "WORKFLOW : SYNC BATCH":
  batchType === 7 ? "WORKFLOW : CALVING BATCH":
  batchType === 8 ? "WORKFLOW : PEDIGREE BATCH": "";

  useEffect(() => {
    let mounted = true;
    (async (endpoint, desc, batch_uuid) => {
      await genericFunctionThreeParameters(endpoint, desc, batch_uuid)
        .then(response => {
          if (mounted) {
            if (response.payload.length > 0) {
              setValues(response.payload);            
              setActiveStep(parseInt(response.payload[0].step_id));
            }
          }
        });
    })(endpoint_batch_validation_view, 'view batches', uuid);
    return () => {
      mounted = false;
    };
  }, [uuid]);

  if (!values) {
    return null;
  }

  return (
    <Page
      className={classes.root}
      title = {title}
    >
      <br />
      <Typography
        component="h1"
        gutterBottom
        variant="h4"
      >
        {title}
      </Typography>
      <br />
      <Card>
        <CardContent>
          <Grid container justify="center">
            <Grid item xs={12}>
              <div className={classes.inner}>
                <Stepper activeStep={activeStep}>
                  {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    return (
                      <Step key={label} {...stepProps}>
                        <StepLabel {...labelProps}>{label}</StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
                <div>
                  {activeStep === steps.length ? (
                    <div>
                      <Typography className={classes.instructions}>
                        <br />
                        <h3>All steps completed - you&apos;re finished</h3>
                        <br />
                      </Typography>
                    </div>
                  ) : (
                    <div>
                      {getStepContent(activeStep, values, batchInfo,batchType)}
                    </div>
                  )}
                </div>
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Page>
  );
};

Process.propTypes = {
  batchInfo: PropTypes.object.isRequired,
  batchType: PropTypes.number.isRequired
};

export default Process;
