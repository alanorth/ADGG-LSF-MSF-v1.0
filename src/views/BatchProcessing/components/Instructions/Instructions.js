import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Stepper, Step, StepLabel, StepContent, Button, Paper, Typography } from '@material-ui/core';
import { Page } from 'components';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
}));


function getSteps() {
  return ['Template & Template Rules', 'Populate Template', 'Upload Template', 'Validate Batch', 'Post Batch'];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return `Download the a template from the downloads tab. The template should be used in its 
      original form. Do not add columns, styling, insert formulae, merge cells,change column names, re-arrange columns.
      Alterations may lead to errors during processing.    
      `;
    case 1:
      return 'Populate the template with the records. Avoid as much as posssible the use of special characters and symbols';
    case 2:
      return `This is the first process of batch processing. Click the create Batch icon. Browse your batch in your directory structure. The application accepts excel(.xls & .xlsx) and csv files only. Once the file has been selected, a grid with the records will appear automatically. Lastly, save the batch. The saved records will be staged on data validation queue`;
    case 3:
      return `This is the 2nd process of batch processing.The system will only allow validated records to be posted. All error conditions are captured & recorded here. Click the Validate Button to activate validation. In the event of validation error, the error will be indicated and the batch needs to be discarded, corrected and re-uploaded. If it is all good, save the records and they will be staged on the posting queue.`;
    case 4:
      return `This is the final step in the 3 part process. Any record that appears here has passed all the validation tests and is fit for posting. Click post Button and you are done.`;
    default:
      return 'Unknown step';
  }
}


const Instuctions = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();
  localStorage.removeItem('batch_upload_uuid');


  useEffect(() => {
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Page
      className={classes.root}
      title="Batch Processes"
    >
      <Card>
        <CardContent>
          <div className={classes.root}>
            <Typography variant="h3">BATCH PROCESSING INSTRUCTIONS</Typography>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                  <StepContent>
                    <Typography>{getStepContent(index)}</Typography>
                    <div className={classes.actionsContainer}>
                      <div>
                        <Button
                          disabled={activeStep === 0}
                          onClick={handleBack}
                          className={classes.button}
                        >
                          Back
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleNext}
                          className={classes.button}
                        >
                          {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                      </div>
                    </div>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            {activeStep === steps.length && (
              <Paper square elevation={0} className={classes.resetContainer}>
                <Typography>You&apos;re done! - Happy hacking!</Typography>
                <Button onClick={handleReset} className={classes.button}>
                  Reset
                </Button>
              </Paper>
            )}
          </div>
        </CardContent>
      </Card>
    </Page>
  );
};

Instuctions.propTypes = {
  className: PropTypes.string
};

export default Instuctions;