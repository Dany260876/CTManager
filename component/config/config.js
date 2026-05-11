const ctConfig = {
    initialize : () => {
        // Load page
        ctConfig.initContent();
    },
    initContent: () => {
        let content = "";
        content += "<tr><td></td><td>Nom</td><td>Valeur</td></tr>";
        ctMain.configuration.rules.forEach((rule,i) => content += "<tr><td><input type='checkbox'/></td><td>" + rule.name + "</td><td>" + rule.duration + "</td></tr>");
        $("#tblConfiguration").html(content);
        $("#txtDailyDuration").val(ctMain.configuration.dailyDuration);
    },
}

ctConfig.initialize();