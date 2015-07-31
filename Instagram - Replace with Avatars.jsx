/*
<javascriptresource>
<name>Replace with Avatars</name>
</javascriptresource>
*/
#include "common.jsx";

var layers = getSelectedLayers();
var fileIndexes = new Array();
var files = shuffle(getFilesFromFolder(avatarDir));

for (var i = 0; i < layers.length; ++i) {

  var activeLayer = layers[i];
  var fileRef = File(files[i]);

  var doc = open(fileRef);

  var newLayer = doc.activeLayer.duplicate(activeLayer, ElementPlacement.PLACEBEFORE);
  doc.close(SaveOptions.DONOTSAVECHANGES);

  var tempWidth = newLayer.bounds[2] - newLayer.bounds[0];
  var width = activeLayer.bounds[2] - activeLayer.bounds[0];

  newLayer.resize(width / tempWidth * 100, width / tempWidth * 100);
  moveLayerTo(newLayer, activeLayer.bounds[0].value, activeLayer.bounds[1].value);
  newLayer.name = fileRef.name.replace(".jpg", "");
  newLayer.grouped = true;

}
