import { useState } from "react";

export default function FeatureMatrixSelector({ featureValues, features, onChangeFeatureMatrix, showComplex }) {
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
      if (changedField === "feature") {
        const {[prevElemValue]: _, ...newFeatMatrix} = {...featureMatrix};
        setFeatureMatrix(newFeatMatrix);
        onChangeFeatureMatrix(newFeatMatrix);
      } else {
        const {[feature]: _, ...newFeatMatrix} = {...featureMatrix};
        setFeatureMatrix(newFeatMatrix);
        onChangeFeatureMatrix(newFeatMatrix);
      }
    } else if ( // finished creating a new rule OR it's an old one and feature value has changed
      (isNewRule && feature && featureValue) ||
      (!isNewRule && changedField === "feature-value")
    ) {
      const newFeatMatrix = {...featureMatrix};
      newFeatMatrix[feature] = featureValue;
      setFeatureMatrix(newFeatMatrix);
      onChangeFeatureMatrix(newFeatMatrix);

      if (isNewRule) {
        featureSelector.value = "";
        featValueSelector.value = "";
      }
    } else if (!isNewRule && changedField === "feature") { // changing the feature of an old rule
      const {[prevElemValue]: _, ...newFeatMatrix} = {...featureMatrix};
      newFeatMatrix[feature] = featureValue;
      setFeatureMatrix(newFeatMatrix);
      onChangeFeatureMatrix(newFeatMatrix);
    }
  }

  function singleRuleSelector(isNewRule, initialFeature, initialFeatValue) {
    let displayedFeatValues = showComplex ? featureValues : featureValues.filter(val => val.length <= 1 || val === initialFeatValue);

    displayedFeatValues = displayedFeatValues.concat("αβγδϵζηθικλμνξοπρστυϕχψω".split(""));
    displayedFeatValues = displayedFeatValues.concat("αβγδϵζηθικλμνξοπρστυϕχψω".split("").map(letter => "-" + letter));

    return <li data-new-rule={ isNewRule } key={ initialFeature }>
      <select
        name="feature-value"
        className="text-center w-16 me-1 p-1 mb-1 text-sm text-gray-900 border border-gray-300 rounded-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        onChange={ e => onChangeFeatOrValue(e, initialFeatValue) }
        value={ initialFeatValue }
      >
        <option value=""></option>
        { displayedFeatValues.map(val => <option value={ val }>{ val }</option>) }
      </select>

      <select
        name="feature"
        className="p-1 mb-1 text-sm text-gray-900 border border-gray-300 rounded-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        onChange={ e => onChangeFeatOrValue(e, initialFeature) }
        value={ initialFeature }
      >
        <option value=""></option>
        {
          features.toSorted().map(feat => <option value={ feat }>
            { feat.replace(/([A-Z])/g, ' $1').toLowerCase() }
          </option>)
        }
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