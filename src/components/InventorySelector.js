export default function InventorySelector({ show, onClose, inventories, dialects, onClickInventory }) {
  if (!show) return <></>;
  
  return (
    <div className="fixed left-0 top-0 z-[1055] h-full w-full overflow-x-hidden outline-none flex items-center justify-center bg-black/50">
      <div className="bg-white w-9/12 h-5/6 rounded-sm flex flex-col ">
        <header className="p-3 flex justify-between border-b">
          <h2 class="text-xl font-bold">Select inventory</h2>
          <button
            onClick={ onClose }
            className="box-content rounded-none border-none hover:no-underline hover:opacity-75 focus:opacity-100 focus:shadow-none focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-6 w-6">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <ul className="p-3 overflow-y-scroll">
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
                        return <li><button onClick={ () => {onClose(); onClickInventory(phonemes)} }>
                          { invId }: { dialects[invId] || langName }
                        </button></li>
                      })
                    }
                  </ul>
                </details>
              </li>)
          }
        </ul>
      </div>
    </div>
  );
}