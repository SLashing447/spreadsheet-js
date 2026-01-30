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
  table.className = "print-table"; // Add class like Svelte version

  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // 1. Process Header (First row) - using innerHTML like {@html}
  const headerRow = document.createElement("tr");
  data[0].forEach((header) => {
    const th = document.createElement("th");
    th.innerHTML = header; // Changed from textContent to innerHTML
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // 2. Process Body (Remaining rows) - using slice(1) like Svelte
  data.slice(1).forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.innerHTML = cell; // Already innerHTML
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  CONTAINER.appendChild(table);
}
