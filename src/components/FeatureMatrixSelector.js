import { useState } from "react";

export default function FeatureMatrixSelector({ featureValues, features, onChangeFeatureMatrix }) {
  const [ featureMatrix, setFeatureMatrix ] = useState({});

  function onChangeFeatOrValue(e, prevElemValue) {
    const changedField = e.target.name;
    
    const parent = e.target.parentElement;
    let featureSelector = parent.querySelector("[name=feature]");
    let featValueSelector = parent.querySelector("[name=feature-value]");

    const feature = featureSelector.value;
    const featureValue = featValueSelector.value;

    const isNewRule = parent.dataset.newRule === "true";
    
    if (!isNewRule && (feature === "" || featureValue === "")) { // setting an old rule to a blank
      const {[prevElemValue]: _, ...newFeatMatrix} = {...featureMatrix};
      console.log("a")
      setFeatureMatrix(newFeatMatrix);
    } else if ( // finished creating a new rule OR it's an old one and feature value has changed
      (isNewRule && feature && featureValue) ||
      (!isNewRule && changedField === "feature-value")
    ) {
      const newFeatMatrix = {...featureMatrix};
      newFeatMatrix[feature] = featureValue;
      setFeatureMatrix(newFeatMatrix);

      if (isNewRule) {
        featureSelector.value = "";
        featValueSelector.value = "";
      }
    } else if (!isNewRule && changedField === "feature") { // changing the feature of an old rule
      const {[prevElemValue]: _, ...newFeatMatrix} = {...featureMatrix};
      newFeatMatrix[feature] = featureValue;
      setFeatureMatrix(newFeatMatrix);
    }
  }

  function singleRuleSelector(isNewRule, initialFeature, initialFeatValue) {
    return <li data-new-rule={ isNewRule } key={ initialFeature }>
      <select
        name="feature-value"
        onChange={ e => onChangeFeatOrValue(e, initialFeatValue) }
        value={ initialFeatValue }
      >
        <option value=""></option>
        { featureValues.map(val => <option value={ val }>{ val }</option>) }
      </select>

      <select
        name="feature"
        onChange={ e => onChangeFeatOrValue(e, initialFeature) }
        value={ initialFeature }
      >
        <option value=""></option>
        { features.toSorted().map(feat => <option value={ feat }>{ feat }</option>) }
      </select>
    </li>;
  }

  return <ul>
    {
      Object.entries(featureMatrix)
        .map(([feature, featureValue]) => singleRuleSelector(false, feature, featureValue))
    }

    { singleRuleSelector(true) }
  </ul>;
}