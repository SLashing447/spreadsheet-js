// import { decode, encode } from "@msgpack/msgpack";

/**
 * Several Utils of theme and to load theme , and setup stuff lol
 */

import { THEMES } from "../../resources/themes/THEMES";

import { getDbItem, removeDbItem, setDbItem } from "./db";
import { readUserData, writeUserData } from "./api";
import { setExtrasInfo, setInfo } from "./values";

function applyTheme(rootCSS) {
  let style = document.getElementById("theme");

  if (!style) {
    style = document.createElement("style");
    document.head.appendChild(style);
  }

  style.textContent = rootCSS;
}

async function pushIntoUserThemes(name) {
  const ut = await getDbItem("userthemes");
  if (!ut || ut === null) {
    await setDbItem("userthemes", [name]);
  } else {
    ut.push(name);
    await setDbItem("userthemes", ut);
  }
}

export async function loadTheme() {
  const theme = localStorage.getItem("theme");
  let fth = "";

  if (theme) {
    // previous theme
    const themeName = theme.split("-")[1];

    if (theme.split("-")[0] === "usertheme") {
      // load from db
      const rootCSS = await readUserData(themeName, "themes");
      //   console.log(rootCSS);
      if (rootCSS) {
        applyTheme(parseCSS(rootCSS.data));
      }
    } else {
      // console.log(THEMES[themeName]);
      applyTheme(THEMES[themeName]);
    }

    fth = themeName;
  } else {
    //fallback
    applyTheme(THEMES["DARK"]);
    localStorage.setItem("theme", "apptheme-DARK");

    fth = "DARK";
  }
  // setExtrasInfo(`Plugins : ${loaded_plug}/${plugins.length}`, 0);
  console.log(fth);
  setExtrasInfo(`Theme : ${fth.toLowerCase()}`, 1);

  const th_btns = document.getElementById("th-btns");
  for (const key of Object.keys(THEMES)) {
    // console.log(key, value);

    const btn = document.createElement("button");
    btn.innerText = key.toLowerCase(); // only display lowercase
    btn.id = `apptheme-${key}`;

    if (key === fth) {
      btn.classList.add("sel");
    }

    th_btns.appendChild(btn);
  }

  // load user themes button
  const usrTheme = await getDbItem("userthemes");
  if (usrTheme) {
    for (let u of usrTheme) {
      const btn = document.createElement("button");
      btn.innerText = u;
      btn.id = `usertheme-${u}`;

      if (u === fth) {
        btn.classList.add("sel");
      }

      th_btns.appendChild(btn);
    }
  } else {
    await setDbItem("userthemes", []);
  }
}

export async function createNewUserTheme(_rootCSS, name) {
  const rootCSS = parseCSS(_rootCSS);

  const prevTheme = localStorage.getItem("theme");

  const thName = `usertheme-${name}`;
  localStorage.setItem("theme", thName); // current theme

  // save theme files in userdata
  await writeUserData(rootCSS, name, "themes");
  await pushIntoUserThemes(name); // keep record of total themes

  document.getElementById(prevTheme).classList.remove("sel");

  const btn = document.createElement("button");
  btn.id = thName;
  btn.innerText = name;
  btn.classList.add("sel");

  document.getElementById("th-btns").appendChild(btn);
  setExtrasInfo(`Theme : ${name.toLowerCase()}`, 1);

  // apply raw theme
  applyTheme(rootCSS);
}
export async function applyThemeByName(name) {
  const th = localStorage.getItem("theme");
  //   console.log(name, th);

  let root;

  if (th === null || th !== name) {
    const themeName = name.split("-")[1];
    setExtrasInfo(`Theme : ${themeName.toLowerCase()}`, 1);

    if (name.split("-")[0] === "usertheme") {
      // fetch rootcss from

      const rootCSS = await readUserData(themeName, "themes");
      if (rootCSS) root = parseCSS(rootCSS.data);
    } else {
      root = THEMES[themeName];
    }
  }

  // const root = await setDbItem(thName, rootCSS);
  if (root) {
    document.getElementById(name).classList.add("sel");
    if (th) {
      // console.log(th);
      document.getElementById(th).classList.remove("sel");
    }
    localStorage.setItem("theme", name);
    applyTheme(root);
  }
}

export async function removeUserTheme(id) {
  //   localStorage.removeItem("userthemes");
  console.log(id);

  const name = id.split("-")[1];
  if (id.split("-")[0] !== "usertheme") return;

  const ut = await getDbItem("userthemes");
  if (ut.includes(name)) {
    const new_ut = ut.filter((x) => x !== name);
    setDbItem("userthemes", new_ut);
  }

  localStorage.setItem("theme", "apptheme-DARK");

  document.getElementById(id)?.remove();
  document.getElementById("apptheme-DARK")?.classList.add("sel");

  applyTheme(THEMES["DARK"]);
}

// css parse utls

/**
 * Parse CSS theme file and extract only CSS variables from :root block
 * Returns a clean CSS string with just :root and variables
 * @param {string} cssContent - Raw CSS file content
 * @returns {string} Clean CSS string with only :root { --vars }
 */
function parseCSS(cssContent) {
  // Step 1: Remove all CSS comments
  const cleanedCSS = removeCSSComments(cssContent);

  // Step 2: Extract :root block content
  const rootBlock = extractRootBlock(cleanedCSS);

  if (!rootBlock) {
    throw new Error("No :root block found in CSS");
  }

  // Step 3: Parse and collect CSS variables
  const variables = [];
  const lines = rootBlock.split("\n");

  for (const line of lines) {
    const cssVar = parseCSSVariable(line);
    if (cssVar) {
      variables.push(`  ${cssVar.name}: ${cssVar.value};`);
    }
  }

  if (variables.length === 0) {
    throw new Error("No CSS variables found in :root block");
  }

  // Step 4: Build clean CSS string
  return `:root {\n${variables.join("\n")}\n}`;
}

function removeCSSComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * Extract content within :root { }
 */
function extractRootBlock(css) {
  const rootMatch = css.match(/:root\s*\{([^}]*)\}/);
  return rootMatch ? rootMatch[1] : null;
}

/**
 * Parse a single CSS variable declaration
 */
function parseCSSVariable(line) {
  const trimmed = line.trim();

  // Must start with --
  if (!trimmed.startsWith("--")) {
    return null;
  }

  // Find colon separator
  const colonIndex = trimmed.indexOf(":");
  if (colonIndex === -1) {
    return null;
  }

  const name = trimmed.substring(0, colonIndex).trim();

  // Get value (remove trailing semicolon if present)
  let value = trimmed.substring(colonIndex + 1).trim();
  if (value.endsWith(";")) {
    value = value.slice(0, -1).trim();
  }

  if (!value) {
    return null;
  }

  return { name, value };
}
