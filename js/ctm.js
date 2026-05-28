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
    resetHistory() {
        this.history = [];
    }
    addRule(rule) {
        this.rules.push(rule);
    }
    removeRule(id) {
        let index = this.rules.findIndex((r) => r.id==id);
        this.rules.splice(index,1);
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
            let newRule = rule[0];
            newRule.time = new Date().toLocaleTimeString();
            this.history.push(newRule);
            return true;
        }
        return false;
    }
    saveContext() {
        localforage.setItem('CTContext', this).then((value) => {
            return true;
        });
        return false;
    }
    loadContext() {
        var me = this;
        localforage.getItem('CTContext').then(function(objContext) {
            if (objContext!=null) {
                me.history = objContext.history;
                me.timestamp = objContext.timestamp;
                me.rules = objContext.rules;
                me.duration = objContext.duration;
                me.locked = objContext.locked;
                return true;   
            }
            return false;
        }).catch(function(err) {
            console.log(err);
            return false;
        });
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
* CTHistory : ct context history management
*/
class CTHistory {
    constructor() {
        var me = this;
        me.listItems = [];
        localforage.getItem('CTHistory').then((items) => {
            if (items!=null) me.listItems = items;
        }).catch(function(err) {
            console.log(err);
        });
    }
    addItem(context) {
        let item = {};
        item.date = new Date().toLocaleDateString("fr-FR", { dateStyle:'full'});
        item.duration = context.getTotalDuration();
        item.history = context.history;
        this.listItems.push(item);
    }
    save() {
        localforage.setItem('CTHistory', this.listItems).catch(function(err) {
            console.log(err);
        });
    }
    clear() {
        this.listItems = [];
        localforage.removeItem('CTHistory').catch(function(err) {
            console.log(err);
        });
    }
}

/*
* CTComponent : component (js+html+css)
*/
class CTComponent {
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
* CTComponentManager : Components manager
*/
class CTComponentManager {
    constructor() {}
    build() {
        let res = $.Deferred();

        // get component config
        $.get("./component/components.json")
         .done((data) => {
            let configComponents = {};

            // convert json if needed
            if (data[0].name)
                configComponents = data;
            else
                configComponents = JSON.parse(data);
            
            // build components list 
            let components = [];
            configComponents.forEach((c) => {
                components.push(new CTComponent(c.name, c.container));    
            });

            // Load components
            let defs = components.map((t) => t.load());
            $.when(defs)
                .done(() => {
                    res.resolve();
                })
                .fail(() => {
                    res.reject();
                });  
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
    context : {},
    initialize : () => {
        // load configuration
        let config = new CTConfiguration();
        config.load().done(() => {
            // Init context & history
            ctMain.context = new CTContext(config);
            ctMain.history = new CTHistory();
            
            // Init components & build
            new CTComponentManager().build().done(() => {
            }); 
        });
    }
}