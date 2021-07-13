  //User Input Handlers
  export function _handleKeyDown(this:any, event: any){
    if((event.ctrlKey && event.shiftKey)  || (event.metaKey && event.shiftKey)){
      switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
            event.preventDefault();
            this.save(true);
            break;
      }
    }
    else if(event.ctrlKey || event.metaKey){
      switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
            event.preventDefault();
            this.save();
            break;
        case 'o':
            event.preventDefault();
            this.load();
            break;
        case 'n':
          event.preventDefault();
          this.createNew();
          break;
        case 'p':
          event.preventDefault();
          this.togglePopup();
          break;
    }
  }

    switch( event.keyCode ) {
      case 9:
        if(this.state.inPresentation) return;
        this.add();
        break;
      case 13:
        if(this.state.inPresentation) return;
        this.addUnder();
        break;
      case 27:
        this.stopPresentation();
        break;
      case 39:
        this.nextSlide();
        break;
      case 37:
        this.previousSlide();
        break;
      default: 
        if(this.state.inPresentation || this.state.formatInspectorFocused) return;
        this.typing();
        break;
  }

  if(this.state.inPresentation){
    event.stopPropagation();
    event.preventDefault();
  }
}

export function _handleClick(this:any, event: any){
  if(this.state.inPresentation){
    // this.presBar.focus();
  }
}