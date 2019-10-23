import React, {Fragment} from 'react';
import {Link} from "react-router-dom";

export default function RecipePreview({recipe}) {
    return (
        <Fragment>
            <div className="row">
                <div className="col s12 m6 no-padding">
                    <img src={`${recipe.image}`} className="responsive-img"/>
                </div>
            </div>
            <div className="section">
                <h3 className="header">Equipment</h3>
                <ul className="collection">
                    {recipe.equipment.map(item =>
                        <li key={item} className="collection-item">
                            <label>
                                <input type="checkbox"/>
                                <span>{item}</span>
                            </label>
                        </li>
                    )}
                </ul>
                <h3 className="header">Ingredients</h3>
                <ul className="collection">
                    {recipe.ingredients.map(ingredient =>
                        <li key={ingredient} className="collection-item">
                            <label>
                                <input type="checkbox"/>
                                <span>{ingredient}</span>
                            </label>
                        </li>
                    )}
                </ul>
            </div>
            <div className="section">
                <Link to={`/recipes/${recipe.id}/start`} className="waves-effect waves-light red lighten-2 btn-large">
                    <i className="material-icons left">sentiment_very_satisfied</i>
                    I'm ready!
                </Link>
            </div>
        </Fragment>
    );
}
