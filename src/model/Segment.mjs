import FeaturalSpecifications from "./FeaturalSpecifications.mjs";
import RawPhoibleData from "./RawPhoibleData.mjs";

class Segment {
  // These fields are lazy-evaluated, so unless they were provided on
  // initialization, they're undefined until a class method wants to use them.
  // This is so it won't slow things down with lookups against the Phoible data
  // if a large number of segments are needed.
  // A field can be defined but null if it's invalid:
  // (e.g. featSpec that is not attested and has no IPA)
  #ipa;
  #featSpecs;

  /**
   * A phonetic segment (phoneme or allophone)
   * 
   * Either its IPA or featural specification must be supplied on initialization
   * 
   * @param {RawPhoibleData} rawPhoibleData 
   * @param {Object} identifier
   * @param {String} identifier.ipa
   * @param {FeaturalSpecifications} identifier.featSpecs
   */
  constructor(rawPhoibleData, { ipa, featSpecs}={}) {
    if (ipa === undefined && featSpecs === undefined) {
      throw Error("ipa and/or featSpec must be supplied when constructing a Segment");
    }
    this.#ipa = ipa;
    this.#featSpecs = featSpecs;

    this.rawPhoibleData = rawPhoibleData;
  }

  /**
   * Get the featural specifications of this segment
   * @returns {FeaturalSpecifications | null} This segment's featural specifications, null if not found
   */
  getFeatSpecs() {
    if (this.#featSpecs === undefined) { // either ipa or featSpec is defined at all times
      this.#featSpecs = this.rawPhoibleData.findSpecsByIpa(this.#ipa);
    }
    return this.#featSpecs;
  }

  /**
   * Get the IPA of this segment
   * @returns {String | null} This segment's IPA, null if not found
   */
  getIpa() {
    if (this.#ipa === undefined) { // either ipa or featSpec is defined at all times
      this.#ipa = this.rawPhoibleData.findIpaByFeatSpecs(this.#featSpecs);
    }
    return this.#ipa;
  }

  /**
   * Check if the given feature value is a Greek variable
   * @note A feature value is a Greek variable if the last character is in the
   * Greek lowercase alphabet
   * @param {String} featValue Feature value to check
   * @returns {Boolean} True if yes
   */
  isGreekVariable(featValue) {
    const greekLetters = "αβγδϵζηθικλμνξοπρστυϕχψω";
    return greekLetters.indexOf(featValue.charAt(featValue.length - 1)) > -1;
  }

  /**
   * Transform the segment using partial featural specifications dict
   * @param {Object} partialFeatSpecsDict Partial featural specifications dict
   * @param {Object} ruleFilter Rule filter, for resolving Greek variables in alpha notation
   * @returns {Segment} Transformed segment with new featural specifications applied
   */
  transform(partialFeatSpecsDict, ruleFilter) {
    const myFeatSpecsDict = this.getFeatSpecs().getDict();
    
    const variableValues = {};
    // figure out which feature value should be assigned to each Greek variable
    for (let [feature, featValue] of Object.entries(ruleFilter)) {
      if (this.isGreekVariable(featValue)) {
        variableValues[featValue] = myFeatSpecsDict[feature];
      }
    }
    // rewrite any variables in the transformation feat specs with their true values according to variableValues
    const antonyms = {"-": "+", "+": "-", "0": "0"}; // for variable feature values with minus signs in front (like -α)
    const partialFeatSpecsDictNoVars = {...partialFeatSpecsDict};
    for (let [feature, featValue] of Object.entries(partialFeatSpecsDictNoVars)) {
      if (this.isGreekVariable(featValue)) {
        const trueValue = featValue.startsWith("-") ? antonyms[variableValues[featValue.slice(1)]] : variableValues[featValue];
        partialFeatSpecsDictNoVars[feature] = trueValue;
      }
    }

    const newFeatSpecs = new FeaturalSpecifications(
      this.rawPhoibleData,
      { featSpecsDict: {...myFeatSpecsDict, ...partialFeatSpecsDictNoVars} }
    );
    return new Segment(this.rawPhoibleData, { featSpecs: newFeatSpecs });
  }

  match(partialFeatSpecsDict) {
    const myFeatSpecsDict = this.getFeatSpecs()?.getDict();
    if (!myFeatSpecsDict) return false;

    for (let [feature, desiredFeatValue] of Object.entries(partialFeatSpecsDict)) {
      if (!this.isGreekVariable(desiredFeatValue) && myFeatSpecsDict[feature] !== desiredFeatValue) return false;
    }
    return true;
  }

  toString() {
    return this.getIpa();
  }
}

export default Segment;