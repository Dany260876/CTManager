const ctConfig = {
    initialize : () => {
        // Load page
        ctConfig.initContent();
    },
    initContent: () => {
        let content = "";
        content += "<tr class='header'><td>Nom</td><td>Valeur</td><td></td></tr>";
        ctMain.context.rules.forEach((rule,i) => { 
            let rowClass = 'odd';
            if (i%2==0) rowClass = 'even';
            content += "<tr class='" + rowClass + "'><td>" + rule.name + "</td><td>" + rule.duration + "</td><td><button onclick='ctConfig.clickRemoveItem(" + rule.id + ")'>&#10060;</button></td></tr>";
        });
        content += "<tr><td><input type='text' id='txtItemName'></input></td><td><input type='number' id='txtItemDuration'></input></td><td><button onclick='ctConfig.clickAddItem()'>&#128221;</button></td></tr>";
        $("#tblConfiguration").html(content);
        $("#txtDailyDuration").val(ctMain.context.duration);
    },
    clickRemoveItem: (id) => {
        ctMain.context.removeRule(id);
        ctMain.context.saveContext();
        ctConfig.initContent();
        ctHome.initRulesList();
    },
    clickAddItem: () => {
        let name = $('#txtItemName').val();
        let duration = $('#txtItemDuration').val()*1;

        if ((name!="") && (duration!=0)) {
            ctMain.context.addRule(new CTRule(name, duration));
            ctMain.context.saveContext();
            ctConfig.initContent();
            ctHome.initRulesList();   
        }
    }
}

ctConfig.initialize();