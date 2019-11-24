import React, {Fragment, useEffect, useState} from 'react';
import ReactDOMServer from 'react-dom/server';
import moment from 'moment';
import {timeRemaining} from "./time";
import {Button} from "./components/Button";
import {Icon} from "./components/Icon";
import styles from './RecipeRunner.module.css';
import Badge from "./components/Badge";

export default function RecipeRunner({recipe}) {
    const [timers, setTimers] = useState([]);
    const [steps, setSteps] = useState(recipe.method);
    const [completedSteps, setCompletedSteps] = useState([]);

    useEffect(() => {
        if (timers.length > 0) {
            const intervalId = setInterval(() => setTimers(timers => [...timers]), 1000);
            return () => clearInterval(intervalId)
        }
    });

    const nextSteps = completedStep => steps => {
        return [...(completedStep.next || []), ...steps];
    };

    const isStepCompleted = step => {
        return completedSteps.length > 0
            && completedSteps.some(completedStep => completedStep.instruction === step.instruction);
    };

    const getTimerForStep = step => {
        return timers.find(timer => timer.name === step.instruction);
    };

    const isTimerSetForStep = step => {
        return timers.some(timer => timer.name === step.instruction);
    };

    const isTimerCompleteForStep = step => {
        const timer = getTimerForStep(step);
        return moment().isSameOrAfter(timer.endTime);
    };

    return (
        <Fragment>
            <audio id="audio" src="/audio/beep.mp3" autoPlay={false}/>
            {steps.length > 0 && (
                <ul className={`${styles.Collection} collection`}>
                    {steps.map(step => (
                        <li key={step.instruction} className={`${styles.Collection_Item} collection-item`}>
                            <div className="section">
                                {step.alarm === undefined && isStepCompleted(step) && (
                                    <NoAlarmAndComplete step={step}/>
                                )}
                                {step.alarm === undefined && !isStepCompleted(step) && (
                                    <NoAlarmAndInProgress
                                        step={step}
                                        setSteps={setSteps}
                                        setCompletedSteps={setCompletedSteps}
                                        nextSteps={nextSteps}/>
                                )}
                                {step.alarm !== undefined && !isTimerSetForStep(step) && (
                                    <AlarmAndReady
                                        step={step}
                                        timers={timers}
                                        setTimers={setTimers}/>
                                )}
                                {step.alarm !== undefined && isTimerSetForStep(step) && !isTimerCompleteForStep(step) && (
                                    <AlarmAndInProgress
                                        step={step}
                                        timer={getTimerForStep(step)}/>
                                )}
                                {step.alarm !== undefined && isTimerSetForStep(step) && isTimerCompleteForStep(step) && (
                                    <AlarmAndComplete
                                        step={step}
                                        setSteps={setSteps}
                                        setCompletedSteps={setCompletedSteps}
                                        nextSteps={nextSteps}
                                    />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>)
            }
        </Fragment>
    );
}

function NoAlarmAndComplete({step}) {
    return (
        <Fragment>
            <Badge green>DONE</Badge>
            <div className={styles.Complete}>
                {step.instruction}
            </div>
        </Fragment>
    );
}

function NoAlarmAndInProgress({step, setSteps, setCompletedSteps, nextSteps}) {
    const onClick = () => {
        setSteps(nextSteps(step));
        setCompletedSteps(completedSteps => [...completedSteps, step]);
    };

    return (
        <Fragment>
            <div>{step.instruction}</div>
            <p className="caption"/>
            <Button onClick={onClick}>
                <Icon name="check" position="left"/>DONE
            </Button>
        </Fragment>
    );
}

function AlarmAndComplete({step, setSteps, setCompletedSteps, nextSteps}) {
    const alertOnCompletion = () => {
        window.M.toast({
            html: ReactDOMServer.renderToStaticMarkup(
                <span className={styles.ToastContainer}>DONE: {step.instruction}</span>
            ),
            classes: styles.Toast,
            displayLength: 60000
        });

        document.querySelector("#audio").play();

        if (navigator.vibrate) {
            navigator.vibrate(500);
        }
    };

    useEffect(() => {
        setSteps(nextSteps(step));
        setCompletedSteps(completedSteps => [...completedSteps, step]);
        alertOnCompletion();
    }, []);

    return (
        <Fragment>
            <Badge green>DONE</Badge>
            <div className={styles.Complete}>
                {step.instruction}
            </div>
        </Fragment>
    );
}

function AlarmAndInProgress({step, timer}) {
    return (
        <Fragment>
            <Badge orange>{timeRemaining(moment(), timer.endTime)}</Badge>
            <div>{step.instruction}</div>
        </Fragment>
    );
}

function AlarmAndReady({step, setTimers, timers}) {
    const addTimer = (timers, step) => [
        ...timers, {
            name: step.instruction,
            endTime: moment().add(step.alarm.duration, 'ms'),
        }
    ];

    const onClick = () => {
        setTimers(addTimer(timers, step))
    };

    return (
        <Fragment>
            <div>{step.instruction}</div>
            <p className="caption"/>
            <Button onClick={onClick}>
                <Icon name="timer" position="left"/>Start timer
            </Button>
        </Fragment>
    );
}
