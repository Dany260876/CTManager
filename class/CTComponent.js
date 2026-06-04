/*
* CTComponent : component (js+html+css)
*/
export default class CTComponent {
    constructor(name, dest) {
        this.name = name;
        this.dest = dest;
    }
    load() {
        let res = $.Deferred();
        $.get("./component/" + this.name + "/" + this.name + ".html")
            .done((data) => {
                // set html content
                $("#" + this.dest).html(data);
               
                // Add js script 
                var new_script = document.createElement('script');
                new_script.setAttribute('type',"module");
                new_script.setAttribute('src',"./component/" + this.name + "/" + this.name + ".js");
                document.head.appendChild(new_script);
                
                res.resolve();
            })
            .fail(() => {
                console.log('template error : ' + this.name)
                res.reject();
            });
        return res.promise();
    }
}