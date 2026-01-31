import { decode, encode } from "@msgpack/msgpack";
import { THEMES } from "../../styles/themes/themes";
import { getDbItem, removeDbItem, setDbItem } from "./db";

function applyTheme(rootCSS) {
  let style = document.getElementById("theme");

  if (!style) {
    style = document.createElement("style");
    document.head.appendChild(style);
  }

  style.textContent = rootCSS;
}

export async function loadTheme() {
  const theme = localStorage.getItem("theme");
  let fth = "";

  if (theme) {
    const themeName = theme.split("-")[1];

    const t_type = theme.split("-")[0];

    if (t_type === "usertheme") {
      // load from db
      const rootCSS = await getDbItem(theme);
      if (rootCSS) {
        applyTheme(decode(rootCSS));
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
  const usrTheme = localStorage.getItem("userthemes");
  if (usrTheme) {
    const btn = document.createElement("button");
    btn.innerText = usrTheme;
    btn.id = `usertheme-${usrTheme}`;

    if (usrTheme === fth) {
      btn.classList.add("sel");
    }

    th_btns.appendChild(btn);
  }
}

export async function createNewUserTheme(rootCSS, name) {
  const prevTheme = localStorage.getItem("theme");

  const thName = `usertheme-${name}`;
  localStorage.setItem("theme", thName);

  await setDbItem(thName, encode(rootCSS));

  const setUp = (el) => {
    el.id = thName;
    el.innerText = name;
    el.classList.add("sel");
    return el;
  };

  document.getElementById(prevTheme).classList.remove("sel");

  const prev = document.querySelector('button[id^="usertheme-"]');
  const btn = prev ? setUp(prev) : setUp(document.createElement("button"));

  document.getElementById("th-btns").appendChild(btn);
  localStorage.setItem("userthemes", name); // keep record

  applyTheme(rootCSS);
}
export async function applyThemeByName(name) {
  const th = localStorage.getItem("theme");
  //   console.log(name, th);

  if (th) {
    // console.log(th);
    document.getElementById(th).classList.remove("sel");
  }

  let root;

  if (th === null || th !== name) {
    if (name.split("-")[0] === "usertheme") {
      const rootCSS = await getDbItem(name);
      if (rootCSS) root = decode(rootCSS);
    } else {
      root = THEMES[name.split("-")[1]];
    }
  }

  // const root = await setDbItem(thName, rootCSS);
  if (root) {
    document.getElementById(name).classList.add("sel");

    localStorage.setItem("theme", name);
    applyTheme(root);
  }
}

export async function removeUserTheme(id) {
  localStorage.removeItem("userthemes");

  await removeDbItem(id);
  localStorage.setItem("theme", "apptheme-DARK");
  //   localStorage.removeItem("theme", "apptheme-dark");

  document.querySelector('button[id^="usertheme-"]')?.remove();
  document.getElementById("apptheme-DARK")?.classList.add("sel");

  applyTheme(THEMES["DARK"]);
}
