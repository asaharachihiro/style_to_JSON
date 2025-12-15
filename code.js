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

figma.showUI(__html__, { width: 320, height: 200 });

// -------------------------
// Output objects
// -------------------------
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

      // defaultModeId が無い場合は valuesByMode の最初のキーを使う
      var modeId =
        v.defaultModeId != null
          ? v.defaultModeId
          : Object.keys(v.valuesByMode)[0];

      var value = null;

      if (v.valuesByMode && v.valuesByMode[modeId] != null) {
        value = v.valuesByMode[modeId];
      }

      // alias resolve
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
}

// -------------------------
// Styles → semantic tokens
// -------------------------
function loadStyles() {
  var textStyles = figma.getLocalTextStyles();

  for (var i = 0; i < textStyles.length; i++) {
    var style = textStyles[i];
    var name = normalizeName(style.name);

    // lineHeight
    var lineHeightValue = null;
    if (style.lineHeight && typeof style.lineHeight.value === "number") {
      lineHeightValue = style.lineHeight.value;
    }

    // fontFamily（mixed 対策）
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
      var varId = style.fontName.variableId;
      var variable = figma.variables.getVariableById(varId);

      var modeId =
        variable.defaultModeId != null
          ? variable.defaultModeId
          : Object.keys(variable.valuesByMode)[0];

      fontWeightValue = variable.valuesByMode[modeId];
    } else if (primitives.fontWeight[name] != null) {
      fontWeightValue = primitives.fontWeight[name];
    } else if (
      style.fontName !== figma.mixed &&
      style.fontName &&
      style.fontName.weight
    ) {
      fontWeightValue = fontWeightNameToNumber(style.fontName.weight);
    } else {
      fontWeightValue = 400;
    }

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

    semantic.typography.push({
      name: name,
      type: "typography",
      value: {
        fontSize:
          primitives.fontSize[name] != null
            ? primitives.fontSize[name]
            : style.fontSize,
        fontWeight: fontWeightValue,
        lineHeight:
          primitives.lineHeight[name] != null
            ? Math.round(primitives.lineHeight[name])
            : lineHeightValue != null
            ? Math.round(lineHeightValue)
            : null,
        letterSpacing:
          primitives.letterSpacing[name] != null
            ? primitives.letterSpacing[name]
            : style.letterSpacing,
        fontFamily:
          primitives.fontFamily[name] != null
            ? primitives.fontFamily[name]
            : fontFamilyValue,
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

      if (primitives.color[paintName] == null) {
        primitives.color[paintName] = colorValue;
      }

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
