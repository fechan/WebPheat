class Inventory {
  /**
   * A phonemic inventory
   * @param {Phoneme[]} phonemes 
   * @param {RawPhoibleData} rawPhoibleData
   */
  constructor(phonemes, rawPhoibleData) {
    this.rawPhoibleData = rawPhoibleData;

    this.phonemes = phonemes;
    this.featSpecifications = this.findSpecs(phonemes);
  }
}

export default Inventory;