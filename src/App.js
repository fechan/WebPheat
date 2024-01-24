import { useEffect, useState } from "react"
import Inventory from "./model/Inventory.mjs"
import "./App.css";
import RawPhoibleData from "./model/RawPhoibleData.mjs";
import Segment from "./model/Segment.mjs";
import InventorySelector from "./components/InventorySelector";
import FeatureMatrixSelector from "./components/FeatureMatrixSelector";
import FeatureTable from "./components/FeatureTable";

function App() {
  let [ phoibleInventories, setPhoibleInventories ] = useState({ "inventories": {}, "dialects": {} });

  let [ rawData, setRawData ] = useState();
  let features = rawData ? rawData.features : [];
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
    inventory = initialInventory.transform(ruleTransformation);
  }

  let [ showComplex, setShowComplex ] = useState(false);
  const toggleShowComplex = () => setShowComplex(!showComplex);

  let [ showInventorySelect, setShowInventorySelect ] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      let metadataRes = await fetch(process.env.PUBLIC_URL + "phoible_metadata.json");
      let metadata = await metadataRes.json();

      let featMatrixRes = await fetch(process.env.PUBLIC_URL + "phoible_feature_matrix.bin");
      let featMatrixBuf = await featMatrixRes.arrayBuffer();
      let rawData = new RawPhoibleData(new Uint8Array(featMatrixBuf), metadata);

      let phoibleInvsRes = await fetch(process.env.PUBLIC_URL + "phoible_invs.json");
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

      <div className="w-full flex flex-col items-center">
        <button
          onClick={ () => setShowInventorySelect(true) }
          className="my-2 p-2 text-white bg-blue-600 hover:bg-blue-500 focus:ring-2 rounded-md"
        >
          Load inventory
        </button>
        {/* <input type="text" onChange={ e => setInventoryInput(e.target.value) } value={ inventoryInput } /> */}
      </div>

      <div className="flex gap-5 justify-center">
        <div>
          <h2>Rule filter</h2>
          <FeatureMatrixSelector
            featureValues={ featureValues }
            features={ features }
            onChangeFeatureMatrix={ setRuleFilter }
            showComplex={ showComplex }
          />
        </div>
        <div>
          <h2>Rule transformation</h2>
          <FeatureMatrixSelector
            featureValues={ featureValues }
            features={ features }
            onChangeFeatureMatrix={ setRuleTransformation }
            showComplex={ showComplex }
          />
        </div>
      </div>

      <label>
        <input type="checkbox" checked={ showComplex } onChange={ toggleShowComplex }/>
        <span className="ms-1">Show complex feature values in rule selectors</span>
      </label>

      <FeatureTable
        features={ features }
        inventory={ inventory }
        initialInventory={ initialInventory }
        ruleTransformation={ ruleTransformation }
      />
    </div>
  );
}

export default App;
