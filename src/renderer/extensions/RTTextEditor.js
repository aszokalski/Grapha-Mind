
  var textarea = document.createElement('textarea');
  textarea.id = "myTextArea";

 textarea.addEventListener('input', function(e) {
    var tool = TextEditor.tool;
    if (tool.textBlock === null) return;
    var textBlock = tool.textBlock;
    var diagram = tool.diagram;
    console.log(diagram.startTransaction());
    textBlock.text = this.value;
    diagram.commitTransaction("input text");
    var tempText = tool.measureTemporaryTextBlock(this.value);
    var scale = this.textScale;
    var loc = textBlock.getDocumentPoint(go.Spot.Center);
    var pos = diagram.position;
    var sc = diagram.scale;
    var textscale = textBlock.getDocumentScale() * sc;
    // if (textscale < tool.minimumEditorScale) textscale = tool.minimumEditorScale;
    // Add slightly more width/height to stop scrollbars and line wrapping on some browsers
    // +6 is firefox minimum, otherwise lines will be wrapped improperly
    var textwidth = (textBlock.naturalBounds.width * textscale) + 6;
    var textheight = (textBlock.naturalBounds.height * textscale) + 2;
    var left = (loc.x - pos.x) * sc + 3;
    var top = (loc.y - pos.y) * sc - 1;
    var paddingsize = 1;
    this.style.width = 2 + tempText.measuredBounds.width * scale + "px";
    this.style.height = 1 + tempText.measuredBounds.height * scale + "px";
    this.style.left = ((left - (textwidth / 2) | 0) - paddingsize) + "px";
    this.style.top = ((top - (textheight / 2) | 0) - paddingsize) + "px";
    this.rows = tempText.lineCount;
  }, false);

  textarea.addEventListener('keydown', function(e) {
    var tool = TextEditor.tool;
    if (tool.textBlock === null) return;
    var keynum = e.which;
    if (keynum === 13) { // Enter
      //tool.textBlock.diagram.clearSelection();
      if (tool.textBlock.isMultiline === false) e.preventDefault();
      tool.acceptText(go.TextEditingTool.Enter);
      return;
    } else if (keynum === 9) { // Tab
      //tool.textBlock.diagram.clearSelection();
      tool.acceptText(go.TextEditingTool.Tab);
      e.preventDefault();
      
      return;
    } else if (keynum === 27) { // Esc
      var tb = tool.textBlock;
      tool.doCancel();
      tb.diagram.startTransaction();
      tb.text = TextEditor.originalString;
      tb.diagram.commitTransaction("cancel text edit");
      if (tool.diagram !== null) tool.diagram.doFocus();
    }
  }, false);

  // handle focus:
  textarea.addEventListener('focus', function(e) {
    var tool = TextEditor.tool;
    if (tool.currentTextEditor === null) return;

    if (tool.state === go.TextEditingTool.StateActive) {
      tool.state = go.TextEditingTool.StateEditing;
    }

    if (tool.selectsTextOnActivate) {
      textarea.select();
      textarea.setSelectionRange(0, 9999);
    }
  }, false);

  // Disallow blur.
  // If the textEditingTool blurs and the text is not valid,
  // we do not want focus taken off the element just because a user clicked elsewhere.
  textarea.addEventListener('blur', function(e) {
    var tool = TextEditor.tool;

    textarea.focus();

  }, false);


  var TextEditor = new go.HTMLInfo();

  TextEditor.valueFunction = function() { return textarea.value; }

  TextEditor.mainElement = textarea; // to reference it more easily


  // used to be in doActivate
  TextEditor.show = function(textBlock, diagram, tool) {
    if (!(textBlock instanceof go.TextBlock)) return;

    TextEditor.tool = tool;  // remember the TextEditingTool for use by listeners
    TextEditor.originalString = textBlock.text;

    // This is called during validation, if validation failed:
    if (tool.state === go.TextEditingTool.StateInvalid) {
      textarea.style.border = '3px solid red';
      textarea.focus();
      return;
    }

    // This part is called during initalization:

    var loc = textBlock.getDocumentPoint(go.Spot.Center);
    var pos = diagram.position;
    var sc = diagram.scale;
    var textscale = textBlock.getDocumentScale() * sc;

    var node = diagram.selection.first();
    var background = "white";
    var color = "black;"

    if(node instanceof go.Node){
      var d = node.data.depth;
      switch(d){
        case "0":
          background= "rgb(255,0,0)";
          color = "white;"
          break;
        case "1":
          background="rgb(232,232,232)";
          color = "black;"
          break;
        default:
          background="rgb(250,250,250)";
          color = "black;"
          break;
      }
    }

    // if (textscale < tool.minimumEditorScale) textscale = tool.minimumEditorScale;
    // Add slightly more width/height to stop scrollbars and line wrapping on some browsers
    // +6 is firefox minimum, otherwise lines will be wrapped improperly
    var textwidth = (textBlock.naturalBounds.width * textscale) + 6;
    var textheight = (textBlock.naturalBounds.height * textscale) + 2;

    var left = (loc.x - pos.x) * sc ;
    var top = (loc.y - pos.y) * sc ;

    textarea.value = textBlock.text;
    // the only way you can mix font and fontSize is if the font inherits and the fontSize overrides
    // in the future maybe have textarea contained in its own div
    diagram.div.style['font'] = textBlock.font;

    var paddingsize = 1;

    textarea.style.cssText =
    'position: absolute;' +
    'z-index: 100;' +
    'font: inherit;' +
    'font-size: ' + (textscale * 100) + '%;' +
    'lineHeight: normal;' +
    'width: ' + (textwidth) + 'px;' +
    'height: ' + (textheight) + 'px;' +
    'left: ' + ((left - (textwidth / 2) | 0) - paddingsize + 3) + 'px;' +
    'top: ' + ((top - (textheight / 2) | 0) - paddingsize - 1) + 'px;' +
    'textAlign: ' + textBlock.textAlign + ';' +
    'margin: 0;' +
    'padding: ' + paddingsize + 'px;' +
    'border: 0;' +
    'outline: none;' +
    'white-space: pre-wrap;' +
    'overflow: hidden;' +
    'resize: none;'+
    'background-color:' +(background)+';'+
    'color:' + (color) + ';' +
    // 'caret-color: black;' +
    'border-radius: 3px;'


    textarea.textScale = textscale; // attach a value to the textarea, for convenience

    // Show:
    diagram.div.appendChild(textarea);

    // After adding, focus:
    textarea.focus();
    
    if (tool.selectsTextOnActivate) {
      textarea.select();
      textarea.setSelectionRange(0, 9999);
    }
  };

  TextEditor.hide = function(diagram, tool) {

    diagram.div.removeChild(textarea);
    TextEditor.tool = null;  // forget reference to TextEditingTool
  }

  function getEditor(){
    return TextEditor;
  }

  export default getEditor;