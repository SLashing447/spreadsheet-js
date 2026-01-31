export const THEMES = {
  DARK: `:root {
    --font-fam: system-ui;


  /* base */
  --bg: #0d1117; /* near-black */
  --font: #c9d1d9; /* soft light grey */
  --font-dim: #8b949e;
  --font-info: #58a6ff; /* classic blue accent */

  /* toolbar */
  --toolbar-bg: rgba(255, 255, 255, 0.04);
  --toolbar-bg-high: rgba(255, 255, 255, 0.08);

  /* print */
  --print-bg: #fffdd0; /* keep your cream, it’s perfect */

  /* cells */
  --cell: rgba(255, 255, 255, 0.035);
  --cell-high: rgba(255, 255, 255, 0.08);
  --cell-border: rgba(255, 255, 255, 0.12);

  /* highlights / selection */
  --hlighter: rgba(88, 166, 255, 0.25);
  --hcol: #58a6ff;
  --hpcol: #1f6feb;

  /* print header */
  --header: #161b22;

  /* buttons */
  --btn: rgba(88, 166, 255, 0.25);
  --btn-high: rgba(88, 166, 255, 0.45);

  /* title bar */
  --ttlbar: rgba(255, 255, 255, 0.04);
}
`,
  PURPLE: `
 :root {
  --font-fam: system-ui;

  --bg: rgb(15, 9, 23);
  --font: lightgrey;
  --font-dim: grey;
  --font-info: rgba(0, 255, 255, 0.735);

 
  --toolbar-bg: rgba(66, 37, 93, 0.208);
  --toolbar-bg-high: rgba(66, 37, 93, 0.623);

  --print-bg: #fffdd0;

  /* cell */
  --cell: rgba(90, 64, 120, 0.263);
  --cell-high: rgba(90, 64, 120, 0.486);
  --cell-border: rgba(154, 132, 187, 0.728);

  --hlighter: rgba(128, 67, 164, 0.479);
  --hcol: rgb(222, 197, 238);
  --hpcol: rgb(110, 8, 179);

  /* in print mod */
  --header: rgba(97, 66, 122, 0.973);

  /* generic btn */
  --btn: rgba(97, 97, 196, 0.353);
  --btn-high: rgba(103, 103, 237, 0.64);

  --ttlbar: #030d302d;
}
`,
};
