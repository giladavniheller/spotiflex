import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const VerticalStepper = ({steps, width}) => {
	const [activeStep, setActiveStep] = React.useState(0);

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
		<Box sx={{paddingTop: '15px'}}>
			<Stepper activeStep={activeStep} orientation="vertical">
				{steps.map((step, index) => (
					<Step key={step.label}>
						<StepLabel>{step.label}</StepLabel>
						<StepContent>
							<Typography>{step.description}</Typography>
							<Box>
								<div>
									<Button
										variant="contained"
										onClick={handleNext}
										sx={{mt: 1, mr: 1}}
									>
										{index === steps.length - 1 ? 'Finish' : 'Continue'}
									</Button>
									<Button
										disabled={index === 0}
										onClick={handleBack}
										sx={{mt: 1, mr: 1}}
									>
										Back
									</Button>
								</div>
							</Box>
						</StepContent>
					</Step>
				))}
			</Stepper>
			{activeStep === steps.length && (
				<Paper square elevation={0} sx={{}}>
					<Typography>Instructions completed — you&apos;re ready to go!</Typography>
					<Button onClick={handleReset} sx={{}}>
						Reset
					</Button>
				</Paper>
			)}
		</Box>
	);
}

export default VerticalStepper;