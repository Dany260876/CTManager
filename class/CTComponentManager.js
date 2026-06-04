import CTComponent from './CTComponent.js';

/*
* CTComponentManager : Components manager
*/
export default class CTComponentManager {
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