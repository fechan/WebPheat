import { useEffect, useState } from "react"
import Inventory from "./model/Inventory.mjs"
import "./App.css";
import RawPhoibleData from "./model/RawPhoibleData.mjs";
import Segment from "./model/Segment.mjs";
import InventorySelector from "./components/InventorySelector";

function App() {
  let [ phoibleInventories, setPhoibleInventories ] = useState({ "inventories": {}, "dialects": {} });

  let [ rawData, setRawData ] = useState();
  let features = rawData ? rawData.features : [];

  let [ inventoryInput, setInventoryInput ] = useState("t k s p");
  let inventory = rawData ? new Inventory(
    inventoryInput.split(" ").map(ipa => new Segment(rawData, { ipa: ipa }))
  ) : null;
  let segments = inventory ? inventory.segments : [];

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
      <InventorySelector
        onClickInventory={ setInventoryInput }
        inventories={ phoibleInventories.inventories }
        dialects={ phoibleInventories.dialects }
      />
      <input type="text" onChange={ e => setInventoryInput(e.target.value) } value={ inventoryInput } />
      <table>
        <thead><tr>
          <td>Phoneme</td>
          { features.map(f => <td>{ f }</td>) }</tr>
        </thead>
        <tbody>
          {
            segments
              .filter(s => s.getFeatSpecs())
              .map(s => <tr>
                <td>{ s.getIpa() }</td>
                { Object.values(s.getFeatSpecs().getDict()).map(v => <td>
                  { v === '0' ? ' ' : v}
                </td>) }
              </tr>)
          }
        </tbody>
      </table>
    </div>
  );
}

export default App;
