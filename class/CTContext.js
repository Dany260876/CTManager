/*
* CTContext : current CT Context
*/
export default class CTContext {
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