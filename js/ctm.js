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
    constructor() {
        // Default values
        this.history = [];
        this.timestamp = new Date();
        this.duration = 60;
        this.rules = [];   
        this.locked = false;
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
        let res = $.Deferred();
        localforage.setItem('CTContext', this).then((value) => {
            res.resolve();
        }).catch(function(err) {
            console.log(err);
            res.reject();
        });
        return res;
    }
    loadContext(configuration) {
        let res = $.Deferred();
        var me = this;
        localforage.getItem('CTContext').then(function(objContext) {
            if (objContext!=null) {
                me.history = objContext.history;
                me.timestamp = objContext.timestamp;
                me.rules = objContext.rules;
                me.duration = objContext.duration;
                me.locked = objContext.locked;

                if (me.hasExpired() && configuration) {
                    me.duration = configuration.dailyDuration;
                    me.rules = configuration.rules;
                    me.timestamp = new Date();
                    me.history = [];
                    me.locked = false;
                }
                res.resolve();
            }
            else {
                if (configuration) {
                    me.duration = configuration.dailyDuration;
                    me.rules = configuration.rules;
                    me.timestamp = new Date();
                    me.history = [];
                    me.locked = false;
                }
                res.resolve();
            }
        }).catch(function(err) {
            console.log(err);
            res.reject();
        });
        return res;
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
        this.listItems = [];
    }
    load() {
        let res = $.Deferred();
        var me = this;
        localforage.getItem('CTHistory').then((items) => {
            if (items!=null) {
                me.listItems = items;
                res.resolve();
            }
            else {
                res.resolve();
            }
        }).catch(function(err) {
            console.log(err);
            res.reject();
        });
        return res;
    }
    addItem(context) {
        let item = {};
        item.date = new Date().toLocaleDateString("fr-FR", { dateStyle:'full'});
        item.duration = context.getTotalDuration();
        item.history = context.history;
        this.listItems.push(item);
    }
    save() {
        let res = $.Deferred();
        localforage.setItem('CTHistory', this.listItems)
            .then(() => {
                res.resolve();
            })
            .catch((err) => {
                res.reject();
                console.log(err);
            });
        return res;
    }
    clear() {
        let res = $.Deferred();
        this.listItems = [];
        localforage.removeItem('CTHistory')
            .then(() => {
                res.resolve();
            })
            .catch((err) => {
                console.log(err);
                res.reject();
            });
        return res;
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
* Password manager
*/
class CTPasswordManager {
    constructor() {}
    getCurrentPassword() {
        let res = $.Deferred();
        var me = this;
        localforage.getItem('CTPassword').then((data) => {
            if (data!=null) {
                res.resolve(data);
            }
            else {
                res.resolve('');
            }
        }).catch(function(err) {
            console.log(err);
            res.reject();
        });
        return res;
    }
    setPassword(pwd) {
        let res = $.Deferred();
        localforage.setItem('CTPassword', pwd)
            .then(() => {
                res.resolve();
            })
            .catch((err) => {
                res.reject();
                console.log(err);
            });
        return res;
    }
    needPassword() {
        return window.sessionStorage['CTPasswordOk']==null;
    }
    showPopup() {
        var me = this;
        
        if (!this.needPassword()) return;
        
        this.getCurrentPassword().done((currentPwd) => {
            // Determine 1st password
            JSPopup.currentPwd = currentPwd;
            let message = 'Saisir le mot de passe';
            if (currentPwd=='') message = 'Initialiser le mot de passe';
            
            // Password
            let settings = {
            'title' : "Mot de passe",
            'message' : "<center><br/>" + message + "<br/><br/><input type='password' id='txtPwd'></input></center>",
            'type' : JSPopup.PopupType.OK,
            'modal' : true,
            'handler' : (res) => { 
                    let pwd = $('#txtPwd').val();
                    if ((JSPopup.currentPwd=='') && (pwd!='')) {
                        me.setPassword(pwd).done(() => {
                           window.document.location.reload(); 
                        });
                    }
                    if (pwd!=JSPopup.currentPwd) {
                        window.document.location.reload();
                    }
                    window.sessionStorage['CTPasswordOk'] = new Date().toISOString();
                }
            };
            JSPopup.ShowPopup(settings); 
        });
    }
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
            ctMain.context = new CTContext();
            ctMain.context.loadContext(config).done(() => {
                ctMain.history = new CTHistory();
                ctMain.history.load().done(() => {
                    // get password
                    new CTPasswordManager().showPopup();
                   // Init components & build
                    new CTComponentManager().build().done(() => {
                    });   
                }); 
            });
        });
    }
}