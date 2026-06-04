/*
* CTHistory : ct context history management
*/
export default class CTHistory {
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
