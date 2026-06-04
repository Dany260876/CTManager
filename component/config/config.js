import ctMain from '../../js/ctm.js'
import ctHome from '../home/home.js'
import CTPasswordManager from '../../class/CTPasswordManager.js'
import CTRule from '../../class/CTRule.js'

const ctConfig = {
    initialize : () => {
        // Load page
        ctConfig.initContent();
    },
    initContent: () => {
        // init content
        let content = "";
        content += "<tr class='header'><td>Nom</td><td>Valeur</td><td></td></tr>";
        ctMain.context.rules.forEach((rule,i) => { 
            let rowClass = 'odd';
            if (i%2==0) rowClass = 'even';
            content += "<tr class='" + rowClass + "'><td>" + rule.name + "</td><td>" + rule.duration + "</td><td><button data-id='" + rule.id + " ' class='btnRemoveItem'>&#10060;</button></td></tr>";
        });
        content += "<tr><td><input type='text' id='txtItemName' maxlength='20'></input></td><td><input type='number' id='txtItemDuration'></input></td><td><button class='btnAddItem'>&#128221;</button></td></tr>";
        $("#tblConfiguration").html(content);       
        $("#txtDailyDuration").val(ctMain.context.duration);
       
        // init actions
        $(".btnRemoveItem").click(() => ctConfig.clickRemoveItem());
        $(".btnAddItem").click(() => ctConfig.clickAddItem());
        $("#btnDurationOk").click(() => ctConfig.clickDurationOk());
        $("#btnExportRules").click(() => ctConfig.clickExportRules());
        $("#btnImportRules").click(() => ctConfig.clickImportRules());
        $("#btnInitPwd").click(() => ctConfig.clickInitPwd());
    },
    clickRemoveItem: () => {
        let id = $(event.srcElement).data('id')*1;
        ctMain.context.removeRule(id);
        ctMain.context.saveContext().done(() => {
            ctConfig.initContent();
            ctHome.initRulesList();    
        });
    },
    clickAddItem: () => {
        let name = $('#txtItemName').val();
        let duration = $('#txtItemDuration').val()*1;

        if ((name!="") && (duration!=0)) {
            ctMain.context.addRule(new CTRule(name, duration));
            ctMain.context.saveContext().done(() => {
                ctConfig.initContent();
                ctHome.initRulesList();
            });
        }
    },
    clickDurationOk: () => {
        let value = $('#txtDailyDuration').val();
        ctMain.context.duration = value*1;
        ctMain.context.saveContext().done(() => {
            ctConfig.initContent();
            ctHome.initTitle();
        });
    },
    clickExportRules: () => {
        let encodedContent = btoa(JSON.stringify(ctMain.context.rules));
        let content = "";
        content += "<tr><td colspan=2><input type='text' id='txtExportRule' value='" + encodedContent + "'/></td></tr>";
        content += "<tr>";
        content += "<td></td>";
        content += "<td class='tdActionRules'><button id='btnCloseExport'>&#10060;</button></td>";
        content += "</tr>";
        $("#tblConfiguration").html(content);
        $("#btnCloseExport").click(() => {
            ctConfig.initContent();
        });
    },
    clickImportRules: () => {
        let content = "";
        content += "<tr><td colspan=2><input type='text' id='txtExportRule'/></td></tr>";
        content += "<tr>";
        content += "<td></td>";
        content += "<td class='tdActionRules'><button id='btnValidateExport'>&#9989;</button></td>";
        content += "</tr>";
        $("#tblConfiguration").html(content);
        $("#btnValidateExport").click(() => {
            let encodedValue = $('#txtExportRule').val();
            if (encodedValue!='') {
                let decodedValue = atob(encodedValue);
                let obj = JSON.parse(decodedValue);
                if ((obj.length>0) && (obj[0].id)) {
                    ctMain.context.rules = obj;
                    ctMain.context.saveContext().done(() => {
                        ctConfig.initContent();
                        ctHome.initRulesList();
                        return;
                    });
                }
            }
            ctConfig.initContent();
        });
    },
    clickInitPwd:() => {

        let settings = {
            'title' : "R&eacute;init mot de passe",
            'message' : "Confirmez-vous la r&eacute;initialisation du mot de passe ?<br/><br/>Cela supprimera le mot de passe en cours et vous serez d&eacute;connect&eacute;.",
            'type' : JSPopup.PopupType.YES_NO,
            'modal' : true,
            'handler' : (res) => { 
                if (res==2) {
                    new CTPasswordManager().removePassword().done(() => {
                        window.sessionStorage.removeItem('CTPasswordOk');
                        window.document.location.reload(); 
                    });          
                }
            }
        };
        JSPopup.ShowPopup(settings);
    }
}

ctConfig.initialize();

export default ctConfig;