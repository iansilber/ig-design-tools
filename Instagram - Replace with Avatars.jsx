var imgDir = "~/path/to/shots/";

function moveLayerTo(fLayer,fX,fY) {

  var Position = fLayer.bounds;
  Position[0] = fX - Position[0];
  Position[1] = fY - Position[1];

  fLayer.translate(-Position[0],-Position[1]);

}

if (typeof Array.prototype.indexOf != "function") {  
    Array.prototype.indexOf = function (el) {  
        for(var i = 0; i < this.length; i++) if(el === this[i]) return i;  
        return -1;  
        }  
} 

function getSelectedLayersIdx() {
      var selectedLayers = new Array;
      var ref = new ActionReference();
      ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
      var desc = executeActionGet(ref);
      if( desc.hasKey( stringIDToTypeID( 'targetLayers' ) ) ){
         desc = desc.getList( stringIDToTypeID( 'targetLayers' ));
          var c = desc.count 
          var selectedLayers = new Array();
          for(var i=0;i<c;i++){
            try{ 
               activeDocument.backgroundLayer;
               selectedLayers.push(  desc.getReference( i ).getIndex() );
            }catch(e){
               selectedLayers.push(  desc.getReference( i ).getIndex()+1 );
            }
          }
       }else{
         var ref = new ActionReference(); 
         ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "ItmI" )); 
         ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
         try{ 
            activeDocument.backgroundLayer;
            selectedLayers.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" ))-1);
         }catch(e){
            selectedLayers.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" )));
         }
      }
      return selectedLayers;
   }

function makeActiveByIndex( idx, visible ){
   for( var i = 0; i < idx.length; i++ ){
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putIndex(charIDToTypeID( "Lyr " ), idx[i])
      desc.putReference( charIDToTypeID( "null" ), ref );
      if( i > 0 ) {
         var idselectionModifier = stringIDToTypeID( "selectionModifier" );
         var idselectionModifierType = stringIDToTypeID( "selectionModifierType" );
         var idaddToSelection = stringIDToTypeID( "addToSelection" );
         desc.putEnumerated( idselectionModifier, idselectionModifierType, idaddToSelection );
      }
      desc.putBoolean( charIDToTypeID( "MkVs" ), visible );
      executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
   }   
}

var sl = getSelectedLayersIdx();
var sLayers = new Array();
for (var i = 0; i < sl.length; i++) {
   makeActiveByIndex([sl[i]], false);
   sLayers.push(activeDocument.activeLayer);
}

var fileIndexes = new Array();

for (var i = 0; i < sLayers.length; ++i) {

  var currentDoc = app.activeDocument;
  var activeLayer = sLayers[i];

  var folder = new Folder(imgDir);
  var files = folder.getFiles(/\.(jpg|tif|psd|bmp|gif|png|)$/i);

  var match = true;
  var index = 0;

  while (match == true) {
    index = Math.floor(Math.random() * files.length - 1);
    if (fileIndexes.indexOf(index) > -1) {
      match = true;
    } else {
      match = false;
    }
  }
  
  var fileRef = File(files[index]);
  fileIndexes.push(index);

  var doc = open(fileRef);

  var newLayer = doc.activeLayer.duplicate(activeLayer, ElementPlacement.PLACEBEFORE);
  doc.close(SaveOptions.DONOTSAVECHANGES);

  var tempWidth = newLayer.bounds[2] - newLayer.bounds[0];
  var width = activeLayer.bounds[2] - activeLayer.bounds[0];

  newLayer.resize(width / tempWidth * 100, width / tempWidth * 100);
  moveLayerTo(newLayer, activeLayer.bounds[0].value, activeLayer.bounds[1].value);

  newLayer.grouped = true;
  
}