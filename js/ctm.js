/* 
* CTRule : rule for Time adjustment
*/
class CTRule {
    constructor(name, duration) {
        this.id = new Date().getTime();
        this.name = name;
        this.duration = duration;
    }
}

/*
* CTConfiguration : read static configuration
*/
class CTConfiguration {
    constructor() {}
    load() {
        let res = $.Deferred();
        $.get("./config/config.json")
            .done((data) => {
              if (data.dailyDuration) {
                this.dailyDuration = data.dailyDuration;
                this.rules = data.rules;     
              }
              else {
                let config = JSON.parse(data);
                this.dailyDuration = config.dailyDuration;
                this.rules = config.rules;   
              }
              res.resolve();
            })
            .fail(() => {
                console.log('configuration error');
                res.reject();
            });
        return res.promise();
    }
}

/*
* CTContext : current CT Context
*/
class CTContext {
    constructor(configuration) {
        let isLoaded = false;
        
        // Default values
        this.history = [];
        this.timestamp = new Date();
        this.duration = 60;
        this.rules = [];   
        this.locked = false;
        
        // load current context, check if expired
        if (this.loadContext()) {
            isLoaded = !this.hasExpired();
        }

        // if not loaded, try to load from config 
        if (!isLoaded) {
            if (configuration) {
                this.duration = configuration.dailyDuration;
                this.rules = configuration.rules;
                this.timestamp = new Date();
                this.history = [];
                this.locked = false;
            }   
        }
    }
    lock() {
        this.locked = true;
    }
    unlock() {
        this.locked = false;
    }
    addRule(rule) {
        this.rules.push(rule);
    }
    removeLastRule() {
        if (this.history.length>0) {
            this.history = this.history.slice(0, this.history.length - 1);
            return true;
        }
        return false;
    }
    applyRule(id) {
        // Change timestamp & add rule to history
        this.timestamp = new Date();
        let rule = this.rules.filter((r,i) => { if (r.id==id) return r })
        if (rule.length>0) {
            this.history.push(rule[0]);
            return true;
        }
        return false;
    }
    saveContext() {
        if (window.localStorage) {
            window.localStorage["CTContext"] = JSON.stringify(this);
            return true;
        }
        return false;
    }
    loadContext() {
        if (window.localStorage && window.localStorage["CTContext"]) {
            let objContext = JSON.parse(window.localStorage["CTContext"]);
            this.history = objContext.history;
            this.timestamp = objContext.timestamp;
            this.rules = objContext.rules;
            this.duration = objContext.duration;
            this.locked = objContext.locked;
            return true;
        }
        return false;
    }
    getTotalDuration() {
        let total = this.duration;
        this.history.forEach((h,i) => total += h.duration);
        return total;
    }
    hasExpired() {
        return (new Date().toLocaleDateString()!=new Date(this.timestamp).toLocaleDateString());
    }
}

/*
* CTTemplate : template manipulation
*/
class CTTemplate {
    constructor(name, dest) {
        this.name = name;
        this.dest = dest;
    }
    load() {
        let res = $.Deferred();
        $.get("./component/" + this.name + "/" + this.name + ".html")
            .done((data) => {
                // set html content
                $("#" + this.dest).html(data);
                // Add js script 
                var new_script = document.createElement('script');
                new_script.setAttribute('src',"./component/" + this.name + "/" + this.name + ".js");
                document.head.appendChild(new_script);              
                res.resolve();
            })
            .fail(() => {
                console.log('template error : ' + this.name)
                res.reject();
            });
        return res.promise();
    }
}

/*
* CTHistory : ct context history management
*/
class CTHistory {
    constructor() {
        this.listItems = [];
        if (window.localStorage && window.localStorage['CTHistory']) {
            let items = JSON.parse(window.localStorage['CTHistory']);
            this.listItems = items;
        }
    }
    addItem(context) {
        let item = {};
        item.date = new Date().toLocaleDateString("fr-FR", { dateStyle:'full'});
        item.duration = context.getTotalDuration();
        item.history = context.history;
        this.listItems.push(item);
    }
    save() {
        if (window.localStorage)
            window.localStorage['CTHistory'] = JSON.stringify(this.listItems);
    }
    clear() {
        this.listItems = [];
        if (window.localStorage && window.localStorage['CTHistory'])
            window.localStorage.removeItem('CTHistory');
    }
}

/*
* ctTemplatesManager : Templates manager
*/
class CTTemplatesManager {
    constructor(templates) {
        this.templates = templates;
    }
    build() {
        let res = $.Deferred();       
        // Init templates
        let defs = this.templates.map((t) => t.load());
        $.when(defs)
            .done(() => {
                res.resolve();
            })
            .fail(() => {
                res.reject();
            }); 
        return res.promise();
    };
}

/*
* Main CTM object
*/
const ctMain = {
    configuration : new CTConfiguration, 
    context : {},
    initialize : () => {
        // load configuration
        ctMain.configuration.load().done(() => {
            // Init context & history
            ctMain.context = new CTContext(ctMain.configuration);
            ctMain.history = new CTHistory();
            
            // Init templates & build
            let templates = [];
            templates.push(new CTTemplate('menu', 'divMenu'));
            templates.push(new CTTemplate('home', 'divContent'));
            templates.push(new CTTemplate('config', 'divConfiguration'));
            templates.push(new CTTemplate('histo', 'divHistory'));
            new CTTemplatesManager(templates).build().done(() => {
            }); 
        });
    }
}