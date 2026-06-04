/*
* Password manager
*/
export default class CTPasswordManager {
    constructor() {}
    getCurrentPassword() {
        let res = $.Deferred();
        var me = this;
        localforage.getItem('CTPassword').then((data) => {
            if (data!=null) {
                res.resolve(data);
            }
            else {
                res.resolve('');
            }
        }).catch(function(err) {
            console.log(err);
            res.reject();
        });
        return res;
    }
    setPassword(pwd) {
        let res = $.Deferred();
        localforage.setItem('CTPassword', pwd)
            .then(() => {
                res.resolve();
            })
            .catch((err) => {
                res.reject();
                console.log(err);
            });
        return res;
    }
    removePassword() {
        let res = $.Deferred();
        localforage.removeItem('CTPassword')
            .then(() => {
                res.resolve();
            })
            .catch((err) => {
                res.reject();
                console.log(err);
            });
        return res;
    }
    getPasswordAttempts() {
        let res = $.Deferred();
        var me = this;
        localforage.getItem('CTPasswordAttempts').then((data) => {
            res.resolve(data);
        }).catch(function(err) {
            console.log(err);
            res.reject();
        });
        return res;
    }
    clearPasswordAttempts() {
        let res = $.Deferred();
        var me = this;
        localforage.removeItem('CTPasswordAttempts').then(() => {
            res.resolve(data);
        }).catch(function(err) {
            console.log(err);
            res.reject();
        });
        return res;
    }
    setPasswordAttempt() {
        let res = $.Deferred();
        this.getPasswordAttempts().done((data) => {
            if (!data) data = [];
            data.push(new Date().toLocaleString());            
            localforage.setItem('CTPasswordAttempts', data)
            .then(() => {
                res.resolve();
            })
            .catch((err) => {
                res.reject();
                console.log(err);
            });
        });
        return res;
    }
    needPassword() {
        return window.sessionStorage['CTPasswordOk']==null;
    }
    showPopup() {
        var me = this;
        
        if (!this.needPassword()) return;
        
        this.getCurrentPassword().done((currentPwd) => {
            // Determine 1st password
            JSPopup.currentPwd = currentPwd;
            let message = 'Saisir le mot de passe';
            if (currentPwd=='') message = 'Initialiser le mot de passe';              
            // get Password
            let settings = {
            'title' : "Mot de passe",
            'message' : "<center><br/>" + message + "<br/><br/><input type='password' id='txtPwd'></input></center>",
            'type' : JSPopup.PopupType.OK,
            'modal' : true,
            'handler' : (res) => {
                    let pwd = $('#txtPwd').val();
                    // pwd creation
                    if ((JSPopup.currentPwd=='') && (pwd!='')) {
                        me.setPassword(pwd).done(() => {
                            window.document.location.reload(); 
                            return;
                        });
                        return;
                    }
                    // pwd check
                    if ((pwd=='') || (pwd!=JSPopup.currentPwd)) {
                        me.setPasswordAttempt().done(() => {
                            window.document.location.reload();  
                            return;
                        });    
                    }
                    else {
                        window.sessionStorage['CTPasswordOk'] = new Date().toISOString();
                        me.clearPasswordAttempts();
                        $('#divMain').show();   
                    }
                }
            };
            $('#divMain').hide();
            JSPopup.ShowPopup(settings);
        });
    }
}