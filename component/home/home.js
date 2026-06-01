const ctHome = {
    initialize : () => {
        // Load page
        ctHome.initContent();
        
        // btn click
        $("#btnTerminate").click(() => ctHome.clickTerminateContext());
        $("#btnReset").click(() => ctHome.clickReset());
        $("#selListRules").change(() => ctHome.clickAddRuleHistory());
        $("#btnCancel").click(() => ctHome.clickCancelInput());
    },
    initContent: () => {
        let content = "";
        
        // init title
        ctHome.initTitle();

        // Init history
        ctHome.initRulesHistory();

        // Fill select rules
        ctHome.initRulesList();

        // Fill pwd attempts
        new CTPasswordManager().getPasswordAttempts().done((pwdAttempts) => {
            if (pwdAttempts) {
                $('#divPwdMsg').html(pwdAttempts.length + ' tentative(s) de connexion (' + pwdAttempts[pwdAttempts.length-1] + ').')
            }        
        });
            
        // Disable/enable content
        $("#btnCancel").prop('disabled',false);
        $("#btnTerminate").prop('disabled',false);
        $("#selListRules").prop('disabled',false);
        if (ctMain.context.locked) {
            $("#btnCancel").prop('disabled',true);
            $("#btnTerminate").prop('disabled',true);
            $("#selListRules").prop('disabled',true);
        }
    },
    initTitle:() => {
         $("#pTitleMain").html("Temps disponible : " + ctMain.context.getTotalDuration() + " mn");
    },
    initRulesHistory: () => {
        // build history
        content = "<tr class='header'><td>Heure</td><td>Nom</td><td>Dur&eacute;e (mn)</td><td></td></tr>";
        if (ctMain.context.history.length>0)
            ctMain.context.history.forEach((histo,i) => {
                let rowClass = 'odd', emo = "";
                if (i%2==0) rowClass = 'even';
                if (histo.duration>0) {
                    rowClass += ' positiveValue'; 
                    emo = "&#128522;"
                }
                else {
                    rowClass += ' negativeValue'; 
                    emo = "&#128543;"
                }
                
                content += "<tr class='" + rowClass + "'><td>" + histo.time + "</td><td>" + histo.name + "</td><td>" + histo.duration + "</td><td>" + emo + "</td></tr>";
            });
        else 
            content += "<tr><td>Aucun</td><td>-</td></tr>"
        
        $("#pRulesHisto table").html(content);
    },
    initRulesList: () => {
        // fill select rules
        content = "<option value='-'>-</option>";
        ctMain.context.rules.forEach((rule,i) => content += "<option value='" + rule.id + "'>" + rule.name + " (" + rule.duration +  "mn)</option>");
        $("#selListRules").html(content);
    },
    clickAddRuleHistory: () => {
        let ruleId = $("#selListRules").val();
        if (ruleId!='-') {
            ctMain.context.applyRule(ruleId*1);
            ctMain.context.saveContext().done(() => {
                ctHome.initContent(); 
            });
        }
    },
    clickTerminateContext: () => {
        let settings = {
            'title' : "Fin de la session",
            'message' : "Confirmez-vous la fin de la session en cours ?<br/><br/><small>Cela validera la duree journaliere ainsi que les ajustements effectues et ajoutera une entree dans l'historique.</small>",
            'type' : JSPopup.PopupType.YES_NO,
            'modal' : true,
            'handler' : (res) => { 
                if (res==2) {
                    ctMain.history.addItem(ctMain.context);
                    ctMain.history.save().done(() => {
                        ctHisto.initContent(); // reload histo content
                        ctMain.context.lock();
                        ctMain.context.saveContext().done(() => {
                            ctHome.initContent(); 
                        });    
                    });
                }
            }
        };
        JSPopup.ShowPopup(settings);
    },
    clickReset: () => {
        let settings = {
            'title' : "Reinitialisation de la session",
            'message' : "Reinitialisation de la session courante ?<br/><br/><small>Toute modification non validee sera perdue.</small>",
            'type' : JSPopup.PopupType.YES_NO,
            'modal' : true,
            'handler' : (res) => { 
                if (res==2) {
                    ctMain.context.resetHistory();
                    ctMain.context.unlock();
                    ctMain.context.saveContext().done(() => {
                        ctHome.initContent();    
                    });
                }
            }
        };
        JSPopup.ShowPopup(settings);
    },
    clickCancelInput : () => {
        if (ctMain.context.removeLastRule()) {
            ctMain.context.saveContext().done(() => {
               ctHome.initContent(); 
            });
        }
    }
}

ctHome.initialize();