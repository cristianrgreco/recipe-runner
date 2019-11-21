import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import baseStyles from "./CreateRecipe.module.css";
import styles from "./Step4.module.css";
import {Button} from "../../components/Button";
import Badge from "../../components/Badge";
import {formatTime} from "../../time";
import {Icon} from "../../components/Icon";

export default function Step4({method, setMethod}) {
    const history = useHistory();

    const onClickBack = () => {
        history.push('/create-recipe/step-3');
    };

    const onClickNext = () => {
        history.push('/create-recipe/step-5');
    };

    return (
        <div className={baseStyles.Container}>
            <div className={baseStyles.Heading}>Create Recipe (4/5)</div>
            {method.length === 0
                ? <MethodItemForm method={method} setMethod={setMethod} depth={'1'}/>
                : <MethodItem method={method} setMethod={setMethod} depth={'1'}/>
            }
            <div className="row">
                <div className="input-field col s12 m12 l6">
                    <div className={baseStyles.ButtonsContainer}>
                        <Button secondary onClick={onClickBack}>Back</Button>
                        <Button onClick={onClickNext}>Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MethodItem({method, setMethod, depth}) {
    const incrementDepth = (depth, amount) => {
        return `${depth.slice(0, -1) + (Number(depth.slice(-1)) + amount)}`
    };

    const onDelete = methodItem => () => {
        const methodItemIndex = method.findIndex(aMethodItem => aMethodItem === methodItem);
        method.splice(methodItemIndex, 1);
        setMethod(currentMethod => [...currentMethod]);
    };

    return (
        <div className={`${styles.Nested} ${depth === '1' ? styles.NestedFirst : ''}`}>
            <ul className={`${styles.NoMargin} ${baseStyles.Collection} collection`}>
                {method.length > 0 && method.map((methodItem, methodItemIndex) => (
                    <li key={methodItem.instruction} className={`${baseStyles.Collection_Item_Container} collection-item`}>
                        <div className={`${baseStyles.Collection_Item}`}>
                            <div className={baseStyles.Collection_Item_Content}>
                                <span className={styles.Collection_Item_Content_Depth}>
                                    Step {incrementDepth(depth, methodItemIndex)})
                                </span>
                                <span className={styles.Collection_Item_Content_Instruction}>
                                    {methodItem.instruction}
                                </span>
                                {methodItem.alarm && (
                                    <span className={styles.Collection_Item_Content_Duration}>
                                        <Badge>
                                            {formatTime(methodItem.alarm.duration)}
                                        </Badge>
                                    </span>
                                )}
                            </div>
                            <div>
                                <Button floating onClick={onDelete(methodItem)}>
                                    <Icon name="delete"/>
                                </Button>
                            </div>
                        </div>
                        <div className={styles.Collection_Nested}>
                            <MethodItem method={methodItem.next} setMethod={setMethod} depth={incrementDepth(depth, methodItemIndex) + '.1'}/>
                        </div>
                    </li>
                ))}
                <li className={`${baseStyles.Collection_Item_Container} collection-item`}>
                    <MethodItemForm method={method} setMethod={setMethod} depth={incrementDepth(depth, method.length)}/>
                </li>
            </ul>
        </div>
    );
}

function MethodItemForm({method, setMethod, depth}) {
    const [instruction, setInstruction] = useState('');
    const [duration, setDuration] = useState('');
    const [durationUnit, setDurationUnit] = useState('minutes');

    useEffect(() => {
        window.M.FormSelect.init(document.querySelector(`#duration-unit-${elementId(depth)}`));
    });

    const elementId = () => depth.replace(/\./g, '_');

    const onInstructionChange = e => {
        setInstruction(e.target.value);
    };

    const onDurationChange = e => {
        setDuration(Number(e.target.value));
    };

    const onDurationUnitChange = e => {
        setDurationUnit(e.target.value);
    };

    const durationToMillis = () => {
        switch (durationUnit) {
            case 'seconds':
                return duration * 1000;
            case 'minutes':
                return duration * 60000;
            case 'hours':
                return duration * 3.6e+6;
        }
    };

    const onSubmit = async e => {
        e.preventDefault();

        if (duration !== '') {
            method.push({
                instruction,
                alarm: {
                    duration: durationToMillis(),
                    description: ''
                },
                next: []
            });
        } else {
            method.push({
                instruction,
                next: []
            });
        }

        setMethod(currentMethod => [...currentMethod]);

        setInstruction('');
        setDuration('');
        setDurationUnit('minutes');
    };

    return (
        <form onSubmit={onSubmit}>
            <div className="row">
                <div className="input-field col s12">
                    <textarea id={`instruction-${elementId(depth)}`} autoFocus={true} className="materialize-textarea" required value={instruction} onChange={onInstructionChange}/>
                    <label htmlFor={`instruction-${elementId(depth)}`} className={`${instruction.length > 0 ? 'active': ''}`}>Step {depth}</label>
                </div>
                <div className="input-field col s12 m12 l6">
                    <input id={`duration-${elementId(depth)}`} type="number" min="0" step=".1" value={duration} onChange={onDurationChange}/>
                    <label htmlFor={`duration-${elementId(depth)}`} className={`${duration !== '' ? 'active': ''}`}>Duration (optional)</label>
                </div>
                <div className="input-field col s12 m12 l6">
                    <select id={`duration-unit-${elementId(depth)}`} disabled={duration === ''} value={durationUnit} onChange={onDurationUnitChange}>
                        <option value="seconds">Seconds</option>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="input-field col s12">
                    <Button type="submit">Add</Button>
                </div>
            </div>
        </form>
    );
}
