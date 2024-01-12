export default function InventorySelector({ inventories, dialects, onClickInventory }) {
  return <details>
    <summary>Inventories</summary>
    <ul>
    {
      Object.entries(inventories)
        .sort((a, b) => {
          let [langNameA, langInvsA] = a;
          let [langNameB, langInvsB] = b;
          return langNameA.localeCompare(langNameB);
        })
        .map(([langName, langInventories], i) => <li>
          <details>
            <summary>{ langName }</summary>
            <ul>
              {
                Object.entries(langInventories).map(([invId, phonemes], i) => {
                  return <li><button onClick={ () => onClickInventory(phonemes) }>
                    { invId }: { dialects[invId] || langName }
                  </button></li>
                })
              }
            </ul>
          </details>
        </li>)
    }
  </ul>
  </details>;
}