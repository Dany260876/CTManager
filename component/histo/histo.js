const ctHisto = {
    initialize : () => {
        // Load page
        ctHisto.initContent();
        // btn click
        $("#btnClearHisto").click(() => ctHisto.clickClearHistory());
    },
    initContent: () => {
        let content = "<tr class='header'><td>Date</td><td>Dur&eacute;e</td></tr>";
        if (ctMain.history && ctMain.history.listItems.length>0) {
            ctMain.history.listItems.forEach((item,i) => {
                let rowClass = 'odd';
                if (i%2==0) rowClass = 'even';
                content += "<tr class='" + rowClass + "'><td>" + item.date + "</td><td>" + item.duration + " mn</td></tr>"; 
            });
        }
        $("#tblHistory").html(content);
    },
    clickClearHistory: () => {
        let settings = {
            'title' : "Effacer l'historique",
            'message' : "Confirmez-vous la suppression definitive de l'historique de temps ?",
            'type' : JSPopup.PopupType.YES_NO,
            'modal' : true,
            'handler' : (res) => { 
                if (res==2) {
                    ctMain.history.clear().done(() => {
                        ctHisto.initContent(); 
                    });
                }
            }
        };
        JSPopup.ShowPopup(settings);
    }
}

ctHisto.initialize();