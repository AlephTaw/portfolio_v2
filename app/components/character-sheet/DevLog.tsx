import { CommitmentHistoryMarker } from "./CommitmentHistoryMarker";

const commitmentHistory = [
  [8, 7, 8, 8, 6, 7, 8, 5, 4, 3, 4, 2, 1, 0, 2, 1, 0],
  [7, 8, 7, 6, 8, 8, 7, 5, 4, 4, 3, 1, 2, 2, 1, 0, 1],
  [8, 8, 8, 7, 7, 8, 6, 4, 3, 2, 3, 1, 1, 0, 1, 0, 0],
  [6, 7, 8, 6, 7, 6, 5, 4, 3, 3, 2, 1, 1, 2, 0, 0, 1],
  [7, 6, 7, 8, 6, 8, 7, 5, 3, 4, 2, 2, 1, 1, 0, 1, 0],
  [8, 7, 6, 7, 8, 7, 6, 4, 4, 3, 3, 1, 2, 0, 1, 0, 1],
  [6, 8, 7, 6, 7, 8, 5, 5, 3, 2, 4, 2, 1, 1, 0, 0, 1],
];

const commitmentHistoryBlocks = [0, 5, 11].map((offset) =>
  commitmentHistory.map((row, rowIndex) =>
    row.map(
      (_, columnIndex) =>
        commitmentHistory[(rowIndex + offset) % commitmentHistory.length][
          (columnIndex + offset) % row.length
        ],
    ),
  ),
);

const eventLog = [
  "chore: removed comment and commented out original paper color in global css style file",
  "feat: character sheet, mlphd quest component integration, and numerous stylistic changes",
];

export function DevLog() {
  return (
    <>
      <div className="mt-8">
        <p className="w-full whitespace-nowrap text-left text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-[#6d6d6d] sm:text-[0.62rem] sm:tracking-[0.2em]">
          Commit History
        </p>
        <div className="mt-4 flex w-full gap-2">
          {commitmentHistoryBlocks.map((block, blockIndex) => (
            <div className="min-w-0 flex-1" key={`history-block-${blockIndex}`}>
              <div className="grid grid-cols-[repeat(17,minmax(0,1fr))]">
                {block.flatMap((row, rowIndex) =>
                  row.map((value, columnIndex) => (
                    <div
                      className={
                        blockIndex === 0 &&
                        rowIndex === block.length - 1 &&
                        columnIndex === row.length - 1
                          ? "relative z-10 aspect-square w-full border border-black"
                          : `aspect-square w-full border-l border-t border-black ${
                              columnIndex === row.length - 1 ? "border-r" : ""
                            } ${rowIndex === block.length - 1 ? "border-b" : ""}`
                      }
                      key={`cell-${rowIndex}-${columnIndex}`}
                      style={
                        blockIndex === 0
                          ? {
                              backgroundColor: `hsl(0 0% ${97 - value * 4.25}%)`,
                              boxShadow:
                                rowIndex === block.length - 1 &&
                                columnIndex === row.length - 1
                                  ? "inset 0 0 0 3px #000000"
                                  : undefined,
                            }
                          : undefined
                      }
                    />
                  )),
                )}
              </div>
              {blockIndex === 0 ? (
                <div className="relative h-[25px]">
                  <div className="absolute right-[calc(100%/34)] top-1 translate-x-1/2">
                    <CommitmentHistoryMarker />
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="grid grid-cols-3 items-center text-[0.5rem] font-medium uppercase leading-3 tracking-[0.08em] text-black">
          <span className="text-left">B-Code</span>
          <span aria-label="Preview" className="text-center">...</span>
          <span className="text-right">Events</span>
        </div>
        <div className="mt-3 space-y-3">
          {eventLog.map((item) => (
            <div key={item}>
              <p className="text-center text-[0.72rem] text-[#4b4b4b]">{item}</p>
              <div className="mt-3 border-t border-[#d8d0c1]" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
