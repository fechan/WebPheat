import { useEffect, useState } from "react"
import Inventory from "./model/Inventory.mjs"
import "./App.css";
import RawPhoibleData from "./model/RawPhoibleData.mjs";
import Segment from "./model/Segment.mjs";
import InventorySelector from "./components/InventorySelector";
import FeatureMatrixSelector from "./components/FeatureMatrixSelector";
import FeatureTable from "./components/FeatureTable";
import logo from "./duck.webp";

function App() {
  let [ showComplex, setShowComplex ] = useState(false);
  const toggleShowComplex = () => setShowComplex(!showComplex);
  let [ showExtraVariables, setShowExtraVariables ] = useState(false);
  const toggleShowExtraVariables = () => setShowExtraVariables(!showExtraVariables);
  let [ showRedundantFeatures, setShowRedundantFeatures ] = useState(false);
  const toggleShowRedundantFeatures = () => setShowRedundantFeatures(!showRedundantFeatures);

  let [ phoibleInventories, setPhoibleInventories ] = useState({ "inventories": {}, "dialects": {} });

  let [ rawData, setRawData ] = useState();
  
  let featureValues = rawData ? rawData.featureValues : [];

  let [ inventoryInput, setInventoryInput ] = useState("t k s p");
  let [ ruleFilter, setRuleFilter ] = useState({});
  let [ ruleTransformation, setRuleTransformation ] = useState({});

  let inventory = rawData ? new Inventory(
    inventoryInput.split(" ").map(ipa => new Segment(rawData, { ipa: ipa }))
  ).filter(ruleFilter) : null;

  let initialInventory = null;
  if (inventory && Object.keys(ruleTransformation).length > 0) {
    initialInventory = inventory;
    inventory = initialInventory.transform(ruleTransformation, ruleFilter);
  }

  let features = inventory ? rawData.features : [];
  
  let spreadsheetFeatures = features;
  if (features.length > 0 && !showRedundantFeatures) {
    const forceShow = [...Object.keys(ruleTransformation), ...Object.keys(ruleFilter)]
    spreadsheetFeatures = inventory.getNonRedundantFeatures(forceShow);
  }

  let [ showInventorySelect, setShowInventorySelect ] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      let metadataRes = await fetch(process.env.PUBLIC_URL + "/phoible_metadata.json");
      let metadata = await metadataRes.json();

      let featMatrixRes = await fetch(process.env.PUBLIC_URL + "/phoible_feature_matrix.bin");
      let featMatrixBuf = await featMatrixRes.arrayBuffer();
      let rawData = new RawPhoibleData(new Uint8Array(featMatrixBuf), metadata);

      let phoibleInvsRes = await fetch(process.env.PUBLIC_URL + "/phoible_invs.json");
      let phoibleInvs = await phoibleInvsRes.json();

      setRawData(rawData);
      setPhoibleInventories(phoibleInvs);
      setInventoryInput(rawData.segmentsIpa.join(" "));
      setShowInventorySelect(true);
    }

    fetchData();

    return function(){};
  }, []);

  return (
    <div className="App h-full flex flex-col">
      {
        showInventorySelect && rawData && <InventorySelector
          onClose={ () => setShowInventorySelect(false) }
          onClickInventory={ setInventoryInput }
          inventories={ phoibleInventories.inventories }
          dialects={ phoibleInventories.dialects }
        />
      }

      <div class="p-5 mx-auto flex justify-between gap-3">
        <div class="flex justify-center items-center">
          <img src={logo} width="64" className="inline me-3" alt="The WebPheat logo, featuring a duck"/>
          <h1 className="text-3xl font-serif">
            WebPheat
          </h1>
        </div>

        <button
          onClick={ () => setShowInventorySelect(true) }
          className="ms-2 p-2 text-white bg-blue-600 hover:bg-blue-500 focus:ring-2 rounded-md"
        >
          Load inventory
        </button>
      </div>

      <div className="flex gap-5 justify-center">
        <div>
          <h2>Rule filter</h2>
          <FeatureMatrixSelector
            featureValues={ featureValues }
            features={ features }
            onChangeFeatureMatrix={ setRuleFilter }
            showComplex={ showComplex }
            showExtraVariables={ showExtraVariables }
          />
        </div>
        <div>
          <h2>Rule transformation</h2>
          <FeatureMatrixSelector
            featureValues={ featureValues }
            features={ features }
            onChangeFeatureMatrix={ setRuleTransformation }
            showComplex={ showComplex }
            showNegativeVariables={ true }
            showExtraVariables={ showExtraVariables }
          />
        </div>
      </div>

      <div className="flex justify-center border-b p-3">
        <fieldset className="flex flex-col gap-1 text-left">
          <label>
            <input type="checkbox" checked={ showComplex } onChange={ toggleShowComplex }/>
            <span className="ms-1">Show complex feature values in rule selectors</span>
          </label>
          <label>
            <input type="checkbox" checked={ showExtraVariables } onChange={ toggleShowExtraVariables }/>
            <span className="ms-1">Show more alpha notation variables in rule selectors</span>
          </label>
          <label>
            <input type="checkbox" checked={ showRedundantFeatures } onChange={ toggleShowRedundantFeatures }/>
            <span className="ms-1">Show features where values are all the same</span>
          </label>
        </fieldset>
      </div>

      <FeatureTable
        features={ spreadsheetFeatures }
        inventory={ inventory }
        initialInventory={ initialInventory }
        ruleTransformation={ ruleTransformation }
      />
    </div>
  );
}

export default App;
