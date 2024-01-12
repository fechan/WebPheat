import { useEffect, useState } from "react"
import Inventory from "./model/Inventory.mjs"
import "./App.css";
import RawPhoibleData from "./model/RawPhoibleData.mjs";
import Segment from "./model/Segment.mjs";

function App() {
  let [ rawData, setRawData ] = useState();
  let features = rawData ? rawData.features : [];

  let [ inventoryInput, setInventoryInput ] = useState("t k s p");
  let inventory = rawData ? new Inventory(
    inventoryInput.split(" ").map(ipa => new Segment(rawData, { ipa: ipa }))
  ) : null;
  let segments = inventory ? inventory.segments : [];

  useEffect(() => {
    fetch("http://localhost:1234/phoible_feature_matrix.bin")
      .then(res => res.arrayBuffer())
      .then(buf => {
        let rawData = new RawPhoibleData(new Uint8Array(buf), phoibleMetadata);
        setRawData(rawData)
      });

    return function(){};
  }, []);

  return (
    <div className="App">
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
