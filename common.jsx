/*
<javascriptresource>
<enableinfo>false</enableinfo>
</javascriptresource>

/* CONFIG */
var imgDir = "~/path/to/shots/";
var avatarDir = "~/path/to/avatars/";

/* FUNCTIONS */
function moveLayerTo(fLayer, fX, fY) {
  var Position = fLayer.bounds;
  Position[0] = fX - Position[0];
  Position[1] = fY - Position[1];
  fLayer.translate(-Position[0], -Position[1]);
}

function shuffle(array) {
  var m = array.length, t, i;
  while (m > 0)
  {
  i = Math.floor(Math.random() * m--);
  t = array[m];
  array[m] = array[i];
  array[i] = t;
  }
  return array;
}

if (typeof Array.prototype.indexOf != "function") {
  Array.prototype.indexOf = function(el) {
    for (var i = 0; i < this.length; i++)
      if (el === this[i]) return i;
    return -1;
  }
}

function createSmartObject(layer) {
  var doc = app.activeDocument;
  doc.activeLayer = layer || doc.activeLayer;
  try {
    var idnewPlacedLayer = stringIDToTypeID("newPlacedLayer");
    executeAction(idnewPlacedLayer, undefined, DialogModes.NO);
    return doc.activeLayer;
  } catch (e) {
    return undefined;
  }
}

function getSelectedLayersIdx() {
  var selectedLayers = new Array;
  var ref = new ActionReference();
  ref.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
  var desc = executeActionGet(ref);
  if (desc.hasKey(stringIDToTypeID('targetLayers'))) {
    desc = desc.getList(stringIDToTypeID('targetLayers'));
    var c = desc.count;
    var selectedLayers = new Array();
    for (var i = 0; i < c; i++) {
      try {
        activeDocument.backgroundLayer;
        selectedLayers.push(desc.getReference(i).getIndex());
      } catch (e) {
        selectedLayers.push(desc.getReference(i).getIndex() + 1);
      }
    }
  } else {
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID("Prpr"), charIDToTypeID("ItmI"));
    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
    try {
      activeDocument.backgroundLayer;
      selectedLayers.push(executeActionGet(ref).getInteger(charIDToTypeID("ItmI")) - 1);
    } catch (e) {
      selectedLayers.push(executeActionGet(ref).getInteger(charIDToTypeID("ItmI")));
    }
  }
  return selectedLayers;
}

function getSelectedLayers() {
  var selectedLayerIDs = getSelectedLayersIdx();
  var selectedLayers = new Array();
  for (var i = 0; i < selectedLayerIDs.length; i++) {
    makeActiveByIndex([selectedLayerIDs[i]], false);
    selectedLayers.push(activeDocument.activeLayer);
  }
  return selectedLayers;
}

function getFilesFromFolder(dir) {
  var fileIndexes = new Array();
  var folder = new Folder(dir);
  return folder.getFiles(/\.(jpg|tif|psd|bmp|gif|png|)$/i);
}

function makeActiveByIndex(idx, visible) {
  for (var i = 0; i < idx.length; i++) {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putIndex(charIDToTypeID("Lyr "), idx[i]);
    desc.putReference(charIDToTypeID("null"), ref);
    if (i > 0) {
      var idselectionModifier = stringIDToTypeID("selectionModifier");
      var idselectionModifierType = stringIDToTypeID("selectionModifierType");
      var idaddToSelection = stringIDToTypeID("addToSelection");
      desc.putEnumerated(idselectionModifier, idselectionModifierType, idaddToSelection);
    }
    desc.putBoolean(charIDToTypeID("MkVs"), visible);
    executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
  }
}

function placeScaleRotateFile(file, xOffset, yOffset, theXScale, theYScale, theAngle, linked) {
  var idPlc = charIDToTypeID("Plc ");
  var desc5 = new ActionDescriptor();
  var idnull = charIDToTypeID("null");
  desc5.putPath(idnull, new File(file));
  var idFTcs = charIDToTypeID("FTcs");
  var idQCSt = charIDToTypeID("QCSt");
  var idQcsa = charIDToTypeID("Qcsa");
  desc5.putEnumerated(idFTcs, idQCSt, idQcsa);
  var idOfst = charIDToTypeID("Ofst");
  var desc6 = new ActionDescriptor();
  var idHrzn = charIDToTypeID("Hrzn");
  var idPxl = charIDToTypeID("#Pxl");
  desc6.putUnitDouble(idHrzn, idPxl, xOffset);
  var idVrtc = charIDToTypeID("Vrtc");
  var idPxl = charIDToTypeID("#Pxl");
  desc6.putUnitDouble(idVrtc, idPxl, yOffset);
  var idOfst = charIDToTypeID("Ofst");
  desc5.putObject(idOfst, idOfst, desc6);
  var idWdth = charIDToTypeID("Wdth");
  var idPrc = charIDToTypeID("#Prc");
  desc5.putUnitDouble(idWdth, idPrc, theYScale);
  var idHght = charIDToTypeID("Hght");
  var idPrc = charIDToTypeID("#Prc");
  desc5.putUnitDouble(idHght, idPrc, theXScale);
  var idAngl = charIDToTypeID("Angl");
  var idAng = charIDToTypeID("#Ang");
  desc5.putUnitDouble(idAngl, idAng, theAngle);
  if (linked == true) {
    var idLnkd = charIDToTypeID("Lnkd");
    desc5.putBoolean(idLnkd, true);
  };
  executeAction(idPlc, desc5, DialogModes.NO);
  return app.activeDocument.activeLayer;
};

function resizeAndMoveLayer(newLayer, existingLayer) {
  var tempWidth = newLayer.bounds[2] - newLayer.bounds[0];
  var width = existingLayer.bounds[2] - existingLayer.bounds[0];

  newLayer.resize(width / tempWidth * 100, width / tempWidth * 100);
  moveLayerTo(newLayer, existingLayer.bounds[0].value, existingLayer.bounds[1].value);

}

function placeFile(file, activeLayer) {
  var fileRef = File(file);
  var newLayer = placeScaleRotateFile(fileRef, 0, 0, 100, 100, 0, false);
  resizeAndMoveLayer(newLayer, activeLayer);
  newLayer.name = fileRef.name.replace(".jpg", "");
}
