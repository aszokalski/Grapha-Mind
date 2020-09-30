function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

var act_dict = {};

class SliderTrigger{
    constructor(min, max, targetKey, value, container, action){
        this.id = makeid(5);
        this.trigger = document.createElement("input");
        this.trigger.setAttribute("type", "range");
        this.trigger.setAttribute("class", "slider");
        this.trigger.setAttribute("id", this.id);
        this.trigger.setAttribute("min", min);
        this.trigger.setAttribute("max", max);
        this.trigger.setAttribute("value", value);

        container.appendChild(this.trigger);
        
        this.setAction(action);
        this.setTargetKey(targetKey);
        this.trigger.oninput = this.update;
    }

    setAction(action){
        act_dict[this.id] = action;
    }

    setTargetKey(targetKey){
        this.trigger.setAttribute("targetKey", targetKey);
    }

    update() {
        act_dict[this.id](this.getAttribute("targetKey"), this.value);
    }

    destruct(){
        delete act_dict[this.id];
        this.trigger.remove();
    }
}