const ctMenu = {
    initialize : () => {
        // menu
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