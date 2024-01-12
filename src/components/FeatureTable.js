export default function({ features, inventory, initialInventory }) {
  let segments = inventory?.segments ?? [];
  let initialSegments = initialInventory?.segments;

  return (
    <table>
      <thead><tr>
        <td>Phoneme</td>
        { features.map(f => <td>{ f }</td>) }</tr>
      </thead>
      <tbody>
        {
          segments
            .filter(s => s.getFeatSpecs())
            .map((s, i) => <tr>
              <td>
                { initialSegments && initialSegments[i].getIpa() + " ➜ " }
                { s.getIpa() || "?" }
              </td>
              
              { Object.values(s.getFeatSpecs().getDict()).map(v => <td>
                { v === '0' ? ' ' : v}
              </td>) }
            </tr>)
        }
      </tbody>
    </table>
  );
}