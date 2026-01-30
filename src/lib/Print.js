import { getDbItem, setDbItem } from "../scripts/db";
import { setPrintMode } from "../scripts/util";
import "./styles/print.css";
const print_btn = document.getElementById("p_print");
const prib_btn = document.getElementById("p_back");
// const PCH_HEAD = document.querySelector(".print-custom-headers");

print_btn.addEventListener("click", printDoc);

export async function printDoc() {
  let headers = [];

  document.querySelectorAll(".pch").forEach((d) => {
    if (d.innerHTML) {
      headers.push(d.innerHTML);
    }
  });

  if (headers.length !== 0) {
    await setDbItem("headers", headers);
  }

  window.print();
}

prib_btn.addEventListener("click", () => {
  setPrintMode(false);
});
export function renderPrintTable(data, containerId) {
  if (!data || data.length === 0) return;

  const CONTAINER = document.getElementById(containerId);

  // render headers
  getDbItem("headers").then((data) => {
    if (data) {
      data.forEach((d, i) => {
        document.getElementById(`pch${i + 1}`).innerText = d;
      });
    }
  });

  const table = document.createElement("table");
  table.className = "print-table";

  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Find max column count across all rows
  const maxCols = Math.max(...data.map((row) => row[1].length));

  // Normalize row length helper
  const normalizeRow = (rowData) => {
    const normalized = [...rowData];
    while (normalized.length < maxCols) {
      normalized.push(""); // Pad with empty strings
    }
    return normalized;
  };

  // 1. Process Header (First row) - normalized
  const headerRow = document.createElement("tr");
  const normalizedHeader = normalizeRow(data[0][1]);

  normalizedHeader.forEach((header) => {
    const th = document.createElement("th");
    th.innerHTML = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // 2. Process Body (Remaining rows) - normalized
  data.slice(1).forEach((row) => {
    const tr = document.createElement("tr");
    const normalizedCells = normalizeRow(row[1]);

    normalizedCells.forEach((cell) => {
      const td = document.createElement("td");
      td.innerHTML = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  CONTAINER.appendChild(table);
}
