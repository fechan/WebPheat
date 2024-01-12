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
    }

    fetchData();

    return function(){};
  }, []);

  return (
    <div className="App">
      {/* <InventorySelector
        onClickInventory={ setInventoryInput }
        inventories={ phoibleInventories.inventories }
        dialects={ phoibleInventories.dialects }
      /> */}
      <input type="text" onChange={ e => setInventoryInput(e.target.value) } value={ inventoryInput } />

      <div>
        <h2>Rule filter</h2>
        <FeatureMatrixSelector
          featureValues={ featureValues }
          features={ features }
          onChangeFeatureMatrix={ setRuleFilter }
        />
      </div>

      <div>
        <h2>Rule transformation</h2>
        <FeatureMatrixSelector
          featureValues={ featureValues }
          features={ features }
          onChangeFeatureMatrix={ setRuleTransformation }
        />
      </div>

      <FeatureTable
        features={ features }
        inventory={ inventory }
        initialInventory={ initialInventory }
      />
    </div>
  );
}

export default App;
