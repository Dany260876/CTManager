const JSPopup = {
	PopupType: {
		'OK': 0,
		'OK_CANCEL': 1,
		'YES_NO': 2,
		'YES_NO_CANCEL': 3
	},
	ButtonType: {
		'CANCEL': 0,
		'OK': 1,
		'YES': 2, 
		'NO': 3
	},
	PositionType: {
		'CENTER_CENTER': 0,
		'TOP_CENTER': 1,
		'TOP_LEFT': 2,
		'CUSTOM': 3
	},
	eventInit: false,
	dragObj: null,
	isVisible: false,
	ApplyCss: function(width,height,position,position_left,position_top) {
		// Size
		if (!width) width = 320;
		if (!height) height = 200;
		// Position
		var posLeft = 1;
		var posTop = 1;
		if (position == JSPopup.PositionType.CENTER_CENTER) 
		{
			posLeft = (window.innerWidth-width)/2;
			posTop = (window.innerHeight-height-100)/2;
		}
		if (position == JSPopup.PositionType.CUSTOM) 
		{
			if (position_left) posLeft = position_left;
			if (position_top) posTop = position_top;
		}
		if (position == JSPopup.PositionType.TOP_CENTER) 
			posLeft = (window.innerWidth-width)/2;
		
		// content	
		var cssPopup = {
			'position':'absolute',
			'width': width + 'px',
			'height': height + 'px',
			'left':posLeft,
			'top':posTop,
			'border':'solid',
			'border-width': '1',
			'border-color': '#929292',
			'background-color': 'white'
		};
		$("#divPopup").css(cssPopup);
		// header
		var cssHeader = {
			'position':'relative',
			'width':'100%',
			'height':'18px',
			'top':'-1',
			'left':'-1',
			'background-color':'#eaeaea',
			'border':'solid',
			'border-width': '1',
			'border-color': '#929292',
			'text-align': 'center',
			'font-size': 'small',
			'font-weight': 'bolder',
			'font-family': 'sans-serif',
			'padding-top': '5px'
		};
		$("#divPopupHeader").css(cssHeader);
		// footer
		var cssFooter = {
			'position':'relative',
			'width':'100%',
			'height':'20px',
			'top': (height - 90),
			'left':'0',
			'border':'none',
			'text-align': 'center'
		};
		$("#divPopupFooter").css(cssFooter);	
		// Content
		var cssContent = {
			'width':'95%',
			'height':'20px',
			'text-align': 'left',
			'margin':'8px'
		};
		$("#divPopupContent").css(cssContent);
		// Modal frame
		if ($("#divModalForm").length > 0) 
		{
			var cssModal = {
				'position':'absolute',
				'width':'100%',
				'height':'100%',
				'left':'0',
				'top':'0',
				'background-color': '#000000',
				'opacity': '0.2',
				'filter': 'alpha(opacity=30)'
			};
			$("#divModalForm").css(cssModal);
		}
		// Buttons
		$(".btnPopup").css("width","80px");
	},
	PressButton: function (res, handlerFct) {
		if (handlerFct) handlerFct(res);
		$("#divPopup").hide();
		$("#divPopup").remove();
		if ($("#divModalForm").length>0) {
			$("#divModalForm").hide();
			$("#divModalForm").remove();
		}
		JSPopup.eventInit = false;
		JSPopup.dragObj = null;
		JSPopup.isVisible = false;
	},
	InitEvents: function(handlerFct) {
		if (!JSPopup.eventInit) 
		{
			$("#divPopupHeader").mousedown(function(event) {
				JSPopup.dragObj = $("#divPopup");
				$(JSPopup.dragObj).data('posX',event.offsetX);
				$(JSPopup.dragObj).data('posY',event.offsetY);
			});
			
			$(document.body).mousemove(function(event) {
				if (JSPopup.dragObj) {
					$(JSPopup.dragObj).offset({
						top: event.clientY - $(JSPopup.dragObj).data('posY'),
						left: event.clientX - $(JSPopup.dragObj).data('posX')
					});
				}
			});
			
			$(document.body).mouseup(function(event) {
				JSPopup.dragObj = null;
			});
			
			$("#btnOK").click(function(){
				JSPopup.PressButton(JSPopup.ButtonType.OK, handlerFct);
			});
			
			$("#btnCancel").click(function(){
				JSPopup.PressButton(JSPopup.ButtonType.CANCEL, handlerFct);
			});
			
			$("#btnYes").click(function(){
				JSPopup.PressButton(JSPopup.ButtonType.YES, handlerFct);
			});
			
			$("#btnNo").click(function(){
				JSPopup.PressButton(JSPopup.ButtonType.NO, handlerFct);
			});
			
			JSPopup.eventInit = true;
		}
	},
	BuildFooterButtons:function(buttons) {
		var sHtmlButtons = "";
		if (buttons==JSPopup.PopupType.OK) {
			sHtmlButtons += "<button class='btnPopup' id='btnOK'>OK</button>";
		}
		if (buttons==JSPopup.PopupType.OK_CANCEL) {
			sHtmlButtons += "<button class='btnPopup' id='btnOK'>OK</button>";
			sHtmlButtons += "&nbsp;";
			sHtmlButtons += "<button class='btnPopup' id='btnCancel'>Annuler</button>";
		}
		if (buttons==JSPopup.PopupType.YES_NO) {
			sHtmlButtons += "<button class='btnPopup' id='btnYes'>Oui</button>";
			sHtmlButtons += "&nbsp;";
			sHtmlButtons += "<button class='btnPopup' id='btnNo'>Non</button>";
		}
		if (buttons==JSPopup.PopupType.YES_NO_CANCEL) {
			sHtmlButtons += "<button class='btnPopup' id='btnYes'>Oui</button>";
			sHtmlButtons += "&nbsp;";
			sHtmlButtons += "<button class='btnPopup' id='btnNo'>Non</button>";
			sHtmlButtons += "&nbsp;";
			sHtmlButtons += "<button class='btnPopup' id='btnCancel'>Annuler</button>";
		}
		return sHtmlButtons;
	},
	ShowPopup : function(objParam) {
		// Prevent re-dislay
		if (JSPopup.isVisible==true) return;
		// default values
		if (!objParam.title) objParam.title = "";
		if (!objParam.message) objParam.message = "";
		if (!objParam.type) objParam.type = JSPopup.PopupType.OK;
		if (!objParam.position) objParam.position = JSPopup.PositionType.CENTER_CENTER;
		// Build & Display popup
		if ($("#divPopup").length==0)
		{				
			var sHtml = "";
			if (objParam.modal==true) sHtml += "  <div id='divModalForm'></div>";
			sHtml += "<div id='divPopup'>";
			sHtml += "  <div id='divPopupHeader'>" + objParam.title + "</div>";
			sHtml += "  <div id='divPopupContent'>" + objParam.message + "</div>";
			sHtml += "  <div id='divPopupFooter'>" + JSPopup.BuildFooterButtons(objParam.type) + "</div>";
			sHtml += "</div>";
			$(document.body).append(sHtml);
		}					
		JSPopup.ApplyCss(objParam.width,objParam.height,objParam.position,objParam.position_left,objParam.position_top);
		JSPopup.InitEvents(objParam.handler);
		if ($("#divModalForm").length>0) $("#divModalForm").show();
		$("#divPopup").show();
		JSPopup.isVisible = true;
	}
};