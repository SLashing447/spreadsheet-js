export function sanitize(hasIndexing = false) {
  console.log("i am here and hasIndexing is : ", hasIndexing);

  const grid = document.getElementById("grid-container");
  if (!grid) return;

  let cells = grid.querySelectorAll(":scope > .cell");

  let current_row = 0;
  let row_data = [];
  const res = [];
  let biggest_row_size = -1;

  for (let k = 0; k < cells.length; k++) {
    const cell = cells[k];
    // if()
    let row = Number(cell.getAttribute("data-row"));

    if (row > current_row) {
      let trmd = trimRightEmpty(row_data);
      row_data = [];
      if (trmd.length > biggest_row_size) biggest_row_size = trmd.length;

      res.push(trmd);

      current_row++;
    }
    row_data.push(cell.innerHTML);
  }

  const out = trimRightEmptyArrays(res);

  // compensate for same size
  for (let i = 0; i < out.length; i++) {
    let len = biggest_row_size - out[i].length;
    if (hasIndexing) {
      let cell = document.getElementById(`idx-${i}`);
      if (cell) {
        out[i].unshift(cell.innerHTML);
      }
    }
    for (let k = 0; k < len; k++) {
      out[i].push("");
    }
  }

  console.log(out);

  return out;
}

function trimRightEmptyArrays(arr) {
  let lastNonEmpty = arr.length - 1;
  while (lastNonEmpty >= 0 && arr[lastNonEmpty].length === 0) {
    lastNonEmpty--;
  }
  return arr.slice(0, lastNonEmpty + 1);
}

function trimRightEmpty(arr) {
  let lastNonEmpty = arr.length - 1;
  while (lastNonEmpty >= 0 && arr[lastNonEmpty].trim() === "") {
    lastNonEmpty--;
  }
  return arr.slice(0, lastNonEmpty + 1);
}
