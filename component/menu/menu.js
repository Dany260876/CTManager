const ctMenu = {
    initialize : () => {

        // Toggle menu
        $("#btnHamburger").on("click", function() {
            $("#menuItemsList").toggleClass("show");
        });
    
        // Close menu
        $(".menuItem").on("click", function() {
            $("#menuItemsList").removeClass("show");
        });
        
        // Menu events
        $("#tdMenuHome").click(() => ctMenu.clickMenu('home'));
        $("#tdMenuConfig").click(() => ctMenu.clickMenu('config'));
        $("#tdMenuHisto").click(() => ctMenu.clickMenu('histo'));
    },
    clickMenu: (idMenu) => {
        $("div.content").removeClass('visible').addClass('hidden');
        if (idMenu=='home') $("#divContent").addClass('visible').removeClass('hidden');
        if (idMenu=='config') $("#divConfiguration").addClass('visible').removeClass('hidden');
        if (idMenu=='histo') $("#divHistory").addClass('visible').removeClass('hidden');
    },
}

ctMenu.initialize();