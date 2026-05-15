const ctConfig = {
    initialize : () => {
        // Load page
        ctConfig.initContent();
    },
    initContent: () => {
        let content = "";
        content += "<tr class='header'><td></td><td>Nom</td><td>Valeur</td></tr>";
        ctMain.configuration.rules.forEach((rule,i) => { 
            let rowClass = 'odd';
            if (i%2==0) rowClass = 'even';
            content += "<tr class='" + rowClass + "'><td><input type='checkbox'/></td><td>" + rule.name + "</td><td>" + rule.duration + "</td></tr>";
        });
        $("#tblConfiguration").html(content);
        $("#txtDailyDuration").val(ctMain.configuration.dailyDuration);
    },
}

ctConfig.initialize();