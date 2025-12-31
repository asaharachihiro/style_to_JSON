/**
 * semantic tokens → Tailwind theme
 */
export function convertTailwind(_primitives, semantic) {
  return {
    theme: {
      fontSize: buildFontSize(semantic),
      colors: buildColors(semantic),
      boxShadow: buildBoxShadow(semantic),
    },
  };
}

/* ----------------------------------------
 * helpers
 * ------------------------------------- */

const PX = (v) => `${v}px`;
const EM = (v) => `${v}em`;

/**
 * Style Dictionary token を unwrap
 */
function unwrap(token) {
  if (token && typeof token === "object" && "value" in token) {
    return token.value;
  }
  return token;
}

/* ----------------------------------------
 * colors
 * ------------------------------------- */

function buildColors(semantic) {
  const result = {};
  const colors = semantic?.color ?? {};

  for (const [key, token] of Object.entries(colors)) {
    result[key] = unwrap(token);
  }

  return result;
}

/* ----------------------------------------
 * fontSize
 * ------------------------------------- */

function buildFontSize(semantic) {
  const result = {};
  const typography = semantic?.typography ?? {};

  for (const [key, typo] of Object.entries(typography)) {
    const fontSize = unwrap(typo.fontSize);
    if (!fontSize) continue;

    const options = {};

    const lineHeight = unwrap(typo.lineHeight);
    if (lineHeight !== undefined) {
      options.lineHeight = PX(lineHeight);
    }

    const fontWeight = unwrap(typo.fontWeight);
    if (fontWeight !== undefined) {
      options.fontWeight = String(fontWeight);
    }

    const letterSpacing = unwrap(typo.letterSpacing);
    if (letterSpacing !== undefined) {
      options.letterSpacing = EM(letterSpacing);
    }

    const fontFamily = unwrap(typo.fontFamily);
    if (fontFamily) {
      options.fontFamily = Array.isArray(fontFamily)
        ? fontFamily
        : [fontFamily];
    }

    result[key] = [PX(fontSize), options];
  }

  return result;
}

/* ----------------------------------------
 * boxShadow
 * ------------------------------------- */

function buildBoxShadow(semantic) {
  const result = {};
  const shadows = semantic?.shadow ?? {};

  for (const [key, shadow] of Object.entries(shadows)) {
    const x = unwrap(shadow.x);
    const y = unwrap(shadow.y);
    const blur = unwrap(shadow.blur);
    const spread = unwrap(shadow.spread) ?? 0;
    const color = unwrap(shadow.color);

    if (
      x === undefined ||
      y === undefined ||
      blur === undefined ||
      color === undefined
    ) {
      continue;
    }

    result[key] = `${PX(x)} ${PX(y)} ${PX(blur)} ${PX(spread)} ${color}`;
  }

  return result;
}
