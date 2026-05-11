const ctHome = {
    initialize : () => {
        // Load page
        ctHome.initContent();
        // btn click
        $("#btnAddRuleHisto").click(() => ctHome.clickAddRuleHistory());
        $("#btnTerminate").click(() => ctHome.clickTerminateContext());
        $("#btnReset").click(() => ctHome.clickReset());
    },
    initContent: () => {
        let content = "";
        
        // get title
        $("#pTitleMain").html("Temps restant : " + ctMain.context.getTotalDuration() + " mn");

        // build history
        content = "<tr><td>Nom</td><td>Dur&eacute;e (mn)</td></tr>";
        ctMain.context.history.forEach((histo,i) => content += "<tr><td>" + histo.name + "</td><td>" + histo.duration + "</td></tr>");
        $("#pRulesHisto table").html(content);

        // fill select rules
        content = "<option value='-'>-</option>";
        ctMain.context.rules.forEach((rule,i) => content += "<option value='" + rule.id + "'>" + rule.name + " (" + rule.duration +  "mn)</option>");
        $("#selListRules").html(content);

        // Disable/enable content
        $("#btnAddRuleHisto").prop('disabled',false);
        $("#btnTerminate").prop('disabled',false);
        $("#selListRules").prop('disabled',false);
        if (ctMain.context.locked) {
            $("#btnAddRuleHisto").prop('disabled',true);
            $("#btnTerminate").prop('disabled',true);
            $("#selListRules").prop('disabled',true);
        }
    },
    clickAddRuleHistory: () => {
        let ruleId = $("#selListRules").val();
        if (ruleId!='-') {
            ctMain.context.applyRule(ruleId*1);
            ctMain.context.saveContext();
            ctHome.initContent();
        }
    },
    clickTerminateContext: () => {
        let result = confirm('Confirmer la fin de la session ?');
        if (result==true) {
            ctMain.history.addItem(ctMain.context);
            ctMain.history.save();
            ctHisto.initContent(); // reload histo content
            ctMain.context.lock();
            ctMain.context.saveContext();
            ctHome.initContent();
        }
    },
    clickReset: () => {
        let result = confirm('Confirmer la reinitialisation ?');
        if (result==true) {
            window.localStorage.removeItem('CTContext');
            ctMain.context = new CTContext(ctMain.configuration);
            ctHome.initContent();   
        }
    },
}

ctHome.initialize();