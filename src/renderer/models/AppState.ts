import * as go from 'gojs';
import {User} from './User'

export interface AppState {
    nodeDataArray: Array<go.ObjectData>;
    modelData: go.ObjectData;
    selectedData: go.ObjectData | null;
    skipsDiagramUpdate: boolean;
    focus: number;
    graphId: string;
    verticalButtonDisabled: boolean;
    showPopup: boolean;
    showSplash: boolean;
    username: string;
    warning: string;
    saved: boolean;
    first: boolean;
    path: string | null;
    inPresentation : boolean;
    snackbarVisible : boolean;
    slideNumber : number;
    openDrawer : boolean;
    openMenu : boolean;
    openAccordion : boolean;
    openFormatDrawer : boolean;
    openExportPopup : boolean;
    anchorEl : any;
    cloudSaved : boolean;
    cloudSaving : boolean;
    cloudChecked : boolean;
    openTooltip : boolean;
    coworkers : { [id: string] : User};
    isHost : boolean;
    formatInspectorFocused : boolean;
    lastTransactionKey: Array<string>;
  }