import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, colors, Stepper, Step, StepLabel, Typography } from '@material-ui/core';
import { getBatchValidation } from '../../../../../../utils/API';
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
    return ['Upload Batch', 'Validate Batch', 'Post Batch', 'Post Successful'];
}

function getStepContent(step, records) {
    switch (step) {
        case 0:
            return <Upload />;
        case 1:
            return <Validate UploadedRecords={records} />;
        case 2:
            return <Post UploadedRecords={records} />;
        default:
            return 'Unknown step';
    }
};

const Pedigree = props => {
    const classes = useStyles();
    const { uuid } = props;
    const [values, setValues] = useState([]);
    const [activeStep, setActiveStep] = useState(0);
    const steps = getSteps();

    useEffect(() => {
        let mounted = true;
        (async (endpoint, batch_uuid) => {
            await getBatchValidation(endpoint, batch_uuid)
                .then(response => {
                    if (mounted) {
                        if (response.payload.length > 0) {
                            setValues(response.payload);
                            setActiveStep(response.payload[0].step_id);
                        }
                    }
                });
        })(endpoint_batch_validation_view, uuid);
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
            title="workflow : pedigree"
        >
            <br />
            <Typography
                component="h1"
                gutterBottom
                variant="h4"
            >
                WORKFLOW : PEDIGREE BATCH

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
                                            {getStepContent(activeStep, values)}
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

Pedigree.propTypes = {
    className: PropTypes.string,
    uuid: PropTypes.string.isRequired
};

export default Pedigree;