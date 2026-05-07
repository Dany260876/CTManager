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
    addRule(rule) {
        this.rules.push(rule);
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
    constructor() {}
    loadTemplate(name, dest) {
        let res = $.Deferred();
        $.get("./component/" + name + ".html")
            .done((data) => {
              $("#" + dest).html(data);
              res.resolve();
            })
            .fail(() => {
                console.log('template error : ' + name)
                res.reject();
            });
        return res.promise();
    }
}

/*
* View manager
*/
const ctViewManager = {
    initialize : () => {
        let res = $.Deferred();       
        // Init templates
        let t1 = new CTTemplate().loadTemplate('menu', 'divMenu');
        let t2 = new CTTemplate().loadTemplate('home', 'divContent');
        let t3 = new CTTemplate().loadTemplate('config', 'divConfiguration');
        let t4 = new CTTemplate().loadTemplate('histo', 'divHistory');
        $.when(t1,t2,t3,t4)
            .done(() => {
                res.resolve();
            })
            .fail(() => {
                res.reject();
            }); 
        return res.promise();
    },
    clickMenu: (idMenu) => {
        $("div.content").removeClass('visible').addClass('hidden');
        if (idMenu=='home') $("#divContent").addClass('visible').removeClass('hidden');
        if (idMenu=='config') $("#divConfiguration").addClass('visible').removeClass('hidden');
        if (idMenu=='histo') $("#divHistory").addClass('visible').removeClass('hidden');
    },
    clickAddRuleHistory: () => {
        let ruleId = $("#selListRules").val();
        if (ruleId!='-') {
            ctMain.context.applyRule(ruleId*1);
            ctMain.context.saveContext();
            ctMain.initialize();
        }
    },
    clickTerminateContext: () => {
        ctMain.context.lock();
        ctMain.context.saveContext();
        ctMain.initialize();
    },
    clickReset: () => {
        window.localStorage.removeItem('CTContext');
        ctMain.initialize();
    },
    initEvents: () => {
        // menu
        $("#tdMenuHome").click(() => ctViewManager.clickMenu('home'));
        $("#tdMenuConfig").click(() => ctViewManager.clickMenu('config'));
        $("#tdMenuHisto").click(() => ctViewManager.clickMenu('histo'));

        // btn
        $("#btnAddRuleHisto").click(() => ctViewManager.clickAddRuleHistory());
        $("#btnTerminate").click(() => ctViewManager.clickTerminateContext());
        $("#btnReset").click(() => ctViewManager.clickReset());
    },
    initPage: () => {
        // init home page
        ctViewManager.loadHomePage();
        ctViewManager.loadConfigurationPage();
    },
    loadHomePage: () => {
        let content = "";
        
        // get title
        content = $("#pTitleMain").html();
        content = content.replace("[CONTENT]", ctMain.context.getTotalDuration() + " mn");
        $("#pTitleMain").html(content);

        // build history
        content = $("#pRulesHisto table").html();
        ctMain.context.history.forEach((histo,i) => content += "<tr><td>" + histo.name + "</td><td>" + histo.duration + "</td></tr>");
        $("#pRulesHisto table").html(content);

        // fill select rules
        content = $("#selListRules").html();
        ctMain.context.rules.forEach((rule,i) => content += "<option value='" + rule.id + "'>" + rule.name + " (" + rule.duration +  "mn)</option>");
        $("#selListRules").html(content);

        if (ctMain.context.locked) {
            $("#btnAddRuleHisto").prop('disabled',true);
            $("#btnTerminate").prop('disabled',true);
            $("#selListRules").prop('disabled',true);
        }
    },
    loadConfigurationPage: () => {
        let content = "";
        content += "<tr><td></td><td>Nom</td><td>Valeur</td></tr>";
        ctMain.configuration.rules.forEach((rule,i) => content += "<tr><td><input type='checkbox'/></td><td>" + rule.name + "</td><td>" + rule.duration + "</td></tr>");
        $("#tblConfiguration").html(content);
        $("#txtDailyDuration").val(ctMain.configuration.dailyDuration);
    }
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
            // Init context
            ctMain.context = new CTContext(ctMain.configuration);
            
            // Init view
            ctViewManager.initialize().done(() => {
                // init events
                ctViewManager.initEvents();
                // init view
                ctViewManager.initPage();
            }); 
        });
    }
}