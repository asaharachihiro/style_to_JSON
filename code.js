// -------------------------
// Helper functions
// -------------------------
function normalizeName(name) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/\//g, ".");
}

function rgbaString(color, opacity) {
  if (opacity == null) opacity = 1;

  // 透明度を丸める
  opacity = Math.round(opacity * 1000) / 1000;

  var r = Math.round(color.r * 255);
  var g = Math.round(color.g * 255);
  var b = Math.round(color.b * 255);
  return "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
}

function normalizeLineHeight(value) {
  if (typeof value === "number") {
    // 120 → 1.2
    return Math.round((value / 100) * 1000) / 1000;
  }
  return value;
}

// -------------------------
// Floating-point rounding
// -------------------------
function roundFloat(value) {
  if (typeof value !== "number") return value;
  return Math.round(value * 1000) / 1000;
}

function normalizePrimitives(obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var val = obj[k];
    if (typeof val === "number") {
      obj[k] = roundFloat(val);
    } else if (typeof val === "object" && val !== null) {
      normalizePrimitives(val);
    }
  }
}

// -------------------------
// Shadow grouping
// -------------------------
function groupShadowTokens(styles) {
  var result = { low: [], high: [] };

  for (var i = 0; i < styles.length; i++) {
    var s = styles[i];
    var name = normalizeName(s.name);
    var type = name.indexOf("high") !== -1 ? "high" : "low";

    if (!s.effects || s.effects.length === 0) continue;

    var layers = [];

    for (var e = 0; e < s.effects.length; e++) {
      var effect = s.effects[e];

      if (effect.type !== "DROP_SHADOW" && effect.type !== "INNER_SHADOW")
        continue;

      var x =
        effect.offset && typeof effect.offset.x === "number"
          ? effect.offset.x
          : 0;
      var y =
        effect.offset && typeof effect.offset.y === "number"
          ? effect.offset.y
          : 0;

      var blur = effect.radius || 0;
      var spread = effect.spread || 0;

      var alpha = effect.color && effect.color.a != null ? effect.color.a : 1;

      var color = rgbaString(effect.color, alpha);

      layers.push({ x: x, y: y, blur: blur, spread: spread, color: color });
    }

    result[type] = layers;
  }

  return result;
}

// -------------------------
figma.showUI(__html__, { width: 320, height: 200 });

// -------------------------
// Output objects
// -------------------------
var variableIdToPrimitive = {};

var primitives = {
  fontSize: {},
  fontWeight: {},
  lineHeight: {},
  letterSpacing: {},
  fontFamily: {},
  color: {},
  shadow: {},
};

var semantic = {
  typography: [],
  color: [],
  shadow: {},
};

// -------------------------
// 逆引きマップ
// -------------------------
var fontWeightValueToKey = {};
var lineHeightValueToKey = {};

// -------------------------
// fontWeight utility
// -------------------------
function fontWeightNameToNumber(name) {
  var map = {
    Thin: 100,
    ExtraLight: 200,
    Light: 300,
    Regular: 400,
    Medium: 500,
    SemiBold: 600,
    Bold: 700,
    ExtraBold: 800,
    Black: 900,
  };
  return map[name] ? map[name] : 400;
}

// -------------------------
// Variables Fetch (ASYNC)
// -------------------------
async function loadVariables() {
  var collections = await figma.variables.getLocalVariableCollectionsAsync();

  for (var i = 0; i < collections.length; i++) {
    var c = collections[i];

    for (var j = 0; j < c.variableIds.length; j++) {
      var vid = c.variableIds[j];
      var v = figma.variables.getVariableById(vid);
      var name = normalizeName(v.name);

      variableIdToPrimitive[v.id] = {
        type: v.resolvedType,
        name: name,
      };

      var modeId =
        v.defaultModeId != null
          ? v.defaultModeId
          : Object.keys(v.valuesByMode)[0];

      var value = null;

      if (v.valuesByMode && v.valuesByMode[modeId] != null) {
        value = v.valuesByMode[modeId];
      }

      if (v.resolvedType === "VARIABLE_ALIAS") {
        value = figma.variables.resolveVariable(v);
      }

      if (v.resolvedType === "FLOAT") {
        if (name.indexOf("size") !== -1) primitives.fontSize[name] = value;
        else if (name.indexOf("weight") !== -1)
          primitives.fontWeight[name] = value;
        else if (name.indexOf("height") !== -1)
          primitives.lineHeight[name] = value;
        else if (
          name.indexOf("letter") !== -1 ||
          name.indexOf("spacing") !== -1
        )
          primitives.letterSpacing[name] = value;
      } else if (v.resolvedType === "STRING") {
        primitives.fontFamily[name] = value;
      } else if (v.resolvedType === "COLOR") {
        var alpha = value && value.a != null ? value.a : 1;
        primitives.color[name] = rgbaString(value, alpha);
      }
    }
  }

  normalizePrimitives(primitives);

  // 逆引きマップ作成
  var fwKeys = Object.keys(primitives.fontWeight);
  for (var i = 0; i < fwKeys.length; i++) {
    fontWeightValueToKey[primitives.fontWeight[fwKeys[i]]] = fwKeys[i];
  }

  var lhKeys = Object.keys(primitives.lineHeight);
  for (var i = 0; i < lhKeys.length; i++) {
    lineHeightValueToKey[primitives.lineHeight[lhKeys[i]]] = lhKeys[i];
  }
}

// -------------------------
// Styles → semantic tokens
// -------------------------
function loadStyles() {
  var textStyles = figma.getLocalTextStyles();

  for (var i = 0; i < textStyles.length; i++) {
    var style = textStyles[i];
    var name = normalizeName(style.name);

    // fontSize
    var fontSizeValue = null;
    if (
      style.boundVariables &&
      style.boundVariables.fontSize &&
      style.boundVariables.fontSize.id
    ) {
      var vid = style.boundVariables.fontSize.id;
      var ref = variableIdToPrimitive[vid];
      if (ref) fontSizeValue = "{fontSize." + ref.name + "}";
    } else {
      fontSizeValue = style.fontSize;
    }

    // lineHeight
    var lhValue = null;
    if (style.lineHeight && typeof style.lineHeight.value === "number") {
      var ratio = normalizeLineHeight(style.lineHeight.value);
      var lhKey = lineHeightValueToKey[ratio];
      lhValue = lhKey ? "{lineHeight." + lhKey + "}" : ratio;
    }

    // letterSpacing
    var letterSpacingValue = null;
    if (
      style.boundVariables &&
      style.boundVariables.letterSpacing &&
      style.boundVariables.letterSpacing.id
    ) {
      var lsVid = style.boundVariables.letterSpacing.id;
      var lsRef = variableIdToPrimitive[lsVid];
      if (lsRef) letterSpacingValue = "{letterSpacing." + lsRef.name + "}";
    } else {
      letterSpacingValue = style.letterSpacing;
    }

    // fontFamily
    var fontFamilyValue = "";
    if (
      style.fontName !== figma.mixed &&
      style.fontName &&
      style.fontName.family
    ) {
      fontFamilyValue = style.fontName.family;
    }

    // fontWeight
    var fontWeightValue = null;
    if (
      style.fontName !== figma.mixed &&
      style.fontName &&
      style.fontName.variableId
    ) {
      var fwVid = style.fontName.variableId;
      var fwRef = variableIdToPrimitive[fwVid];
      if (fwRef) fontWeightValue = "{fontWeight." + fwRef.name + "}";
    }
    if (
      fontWeightValue == null &&
      style.fontName !== figma.mixed &&
      style.fontName &&
      style.fontName.weight
    ) {
      var fwNum = fontWeightNameToNumber(style.fontName.weight);
      var fwKey = fontWeightValueToKey[fwNum];
      fontWeightValue = fwKey ? "{fontWeight." + fwKey + "}" : fwNum;
    }
    if (fontWeightValue == null)
      fontWeightValue = "{fontWeight.font-weight-regular}";

    semantic.typography.push({
      name: name,
      type: "typography",
      value: {
        fontSize: fontSizeValue,
        fontWeight: fontWeightValue,
        lineHeight: lhValue,
        letterSpacing: letterSpacingValue,
        fontFamily: fontFamilyValue,
      },
    });
  }

  // Colors
  var paintStyles = figma.getLocalPaintStyles();
  for (var k = 0; k < paintStyles.length; k++) {
    var p = paintStyles[k];
    var paintName = normalizeName(p.name);
    var paint = p.paints && p.paints.length > 0 ? p.paints[0] : null;
    if (paint && paint.type === "SOLID") {
      var opacity = paint.opacity != null ? paint.opacity : 1;
      var colorValue = rgbaString(paint.color, opacity);
      if (primitives.color[paintName] == null)
        primitives.color[paintName] = colorValue;
      semantic.color.push({
        name: paintName,
        type: "color",
        value: primitives.color[paintName],
      });
    }
  }

  // Shadows
  var shadowStyles = figma.getLocalEffectStyles();
  semantic.shadow = groupShadowTokens(shadowStyles);
  primitives.shadow = semantic.shadow;
}

// -------------------------
// Run all (ASYNC SEQUENCE)
// -------------------------
(async function () {
  await loadVariables();
  loadStyles();

  var exportJson = { primitives: primitives, semantic: semantic };

  figma.ui.postMessage({
    type: "export-json",
    data: JSON.stringify(exportJson, null, 2),
  });
})();
