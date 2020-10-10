function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function objToString(obj, ndeep) {
    switch (typeof obj) {
        case "string":
            return '"' + obj + '"';
        case "function":
            return obj.name || obj.toString();
        case "object":
            var indent = Array(ndeep || 1).join('\t'),
                isArray = Array.isArray(obj);
            return ('{[' [+isArray] + Object.keys(obj).map(function (key) {
                return '\n\t' + indent + (isArray ? '' : key + ': ') + objToString(obj[key], (ndeep || 1) + 1);
            }).join(',') + '\n' + indent + '}]' [+isArray]).replace(/[\s\t\n]+(?=(?:[^\'"]*[\'"][^\'"]*[\'"])*[^\'"]*$)/g, '');
        default:
            return obj.toString();
    }
}

var act_dict = {};


function act(targetKey, value) {
    let target = myDiagram.findNodeForKey(targetKey);
    target.findObject("TEXT").scale = value;
}

var actions = {
    'TEST': act,
};

class TriggerManager {
    constructor() {
        this.triggers = {};
    }

    add(t) {
        this.triggers[t.id] = t;
    }

    remove(id) {
        this.triggers[id].destruct()
        delete this.triggers[id]
    }

    get serialize() {
        return JSON.stringify(this.triggers);
    }

    load(json) {
        this.triggers = JSON.parse(json);
        console.log(this.triggers);
        for (var key in this.triggers) {
            let t = this.triggers[key];
            if (t.type == 'Slider') {
                this.triggers[key] = Object.create(SliderTrigger.prototype, Object.getOwnPropertyDescriptors(this.triggers[key]));
            } else {
                continue;
            }
            this.triggers[key].initialize();
        }
    }
}


class SliderTrigger {
    constructor(min, max, targetKey, value, container_id, action) {
        this.type = "Slider";
        this.id = makeid(5);
        this.min = min;
        this.max = max;
        this.value = value;
        this.container_id = container_id;
        this.action = action;
        this.targetKey = targetKey;
        this.initialize();
    }

    initialize() {
        this.trigger = document.createElement("input");
        this.trigger.setAttribute("type", "range");
        this.trigger.setAttribute("class", "slider");

        this.trigger.setAttribute("id", this.id);
        this.trigger.setAttribute("min", this.min);
        this.trigger.setAttribute("max", this.max);
        this.trigger.setAttribute("value", this.value);

        let c = document.getElementById(this.container_id);
        c.appendChild(this.trigger);

        this.setAction(this.action);
        this.setTargetKey(this.targetKey);
        this.trigger.oninput = this.update;
    }

    setAction(action) {
        this.action = action;
        act_dict[this.id] = actions[action];
    }

    setTargetKey(targetKey) {
        this.targetKey = targetKey;
        this.trigger.setAttribute("targetKey", targetKey);
    }

    update() {
        act_dict[this.id](this.getAttribute("targetKey"), this.value);
    }

    destruct() {
        delete act_dict[this.id];
        this.trigger.remove();
    }
}

//TODO: Checkbox trigger, Value trigger, Select trigger
//TODO: one serialization for whole project

function initTriggers() {
    // let triggerManager = new TriggerManager();
    // let trigger = new SliderTrigger(1, 20, 1, 2, 'top', 'TEST');
    // triggerManager.add(trigger)
    // let trigger1 = new SliderTrigger(1, 20, 2, 2, 'top', 'TEST');
    // triggerManager.add(trigger1)
    // let a = triggerManager.serialize;
    // triggerManager.remove(trigger1.id);
    // triggerManager.remove(trigger.id);
    // triggerManager.load(a);
}