import CTContext from '../class/CTContext.js'
import CTHistory from '../class/CTHistory.js'
import CTConfiguration from '../class/CTConfiguration.js'
import CTComponentManager from '../class/CTComponentManager.js'
import CTPasswordManager from '../class/CTPasswordManager.js'

/*
* Main CTM object
*/
const ctMain = {
    context : {},
    initialize : () => {

        // Refresh on orientation change
        $(window).on("orientationchange",() => {
            if (JSPopup.isVisible) window.document.location.reload();
        });
       
        // load configuration
        let config = new CTConfiguration();
        config.load().done(() => {
            // Init context & history
            ctMain.context = new CTContext();
            ctMain.context.loadContext(config).done(() => {
                ctMain.history = new CTHistory();
                ctMain.history.load().done(() => {
                   // Init components & build
                    new CTComponentManager().build().done(() => {
                        // get password
                        new CTPasswordManager().showPopup();
                    });   
                }); 
            });
        });     
    }
}

export default ctMain;