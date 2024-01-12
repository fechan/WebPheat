import { useState } from "react";

export default function FeatureMatrixSelector({ featureValues, features, onChangeFeatureMatrix }) {
  const [ featureMatrix, setFeatureMatrix ] = useState({});

  function onChangeFeatOrValue(e) {
    const parent = e.target.parentElement;
    let featureSelector = parent.querySelector("[name=feature]");
    let featValueSelector = parent.querySelector("[name=feature-value]");
    const feature = featureSelector.value;
    const featureValue = featValueSelector.value;
    
    if (feature && featureValue) {
      const newFeatMatrix = {...featureMatrix};
      newFeatMatrix[feature] = featureValue;
      setFeatureMatrix(newFeatMatrix);

      featureSelector.value = "";
      featValueSelector.value = "";
    }
  }

  function singleRuleSelector(initialFeature, initialFeatValue) {
    const isBlank = !(initialFeature && initialFeatValue);
    
    return <li>
      <div>
        <select
          name="feature-value"
          onChange={ onChangeFeatOrValue }
          value={ initialFeatValue }
        >
          <option value=""></option>
          { featureValues.map(val => <option value={ val }>{ val }</option>) }
        </select>

        <select
          name="feature"
          onChange={ onChangeFeatOrValue }
          value={ initialFeature }
        >
          <option value=""></option>
          { features.toSorted().map(feat => <option value={ feat }>{ feat }</option>) }
        </select>
      </div>
    </li>;
  }

  return <ul>
    {
      Object.entries(featureMatrix)
        .map(([feature, featureValue]) => singleRuleSelector(feature, featureValue))
    }

    { singleRuleSelector() }
  </ul>;
}