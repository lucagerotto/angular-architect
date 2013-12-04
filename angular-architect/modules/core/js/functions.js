function capitalize( text, allWords ,lower, firstLetterUpper) {
	var reg = allWords ? /(?:^|\s)\S/g : /(?:^|\s)\S/;
    return (lower ? text.toLowerCase() : text).replace(reg, function(a) { return firstLetterUpper ? a.toUpperCase() : a.toLowerCase(); });
}

/**
 * Probabilmente questa funzione andrebbe spostata altrove
 */
function split(text, length, sep) {
    if (isNaN(length)){
        length = 10;
	}            
	var t = (typeof text === 'String')  ? text : ''+text;
    if (t.length <= length ) {
        return t;
    }
    else {
    	var chunks = [];
    	for (var i = 0, charsLength = t.length; i < charsLength; i += length) {
			chunks.push(t.substring(i, i + length));
		}
		if(typeof sep === 'undefined'){
			sep = ' ';
		}
        return chunks.join( sep );
    }
}

function splitLine(st,n) {
	var b = ''; 
	var s = st;
	while (s.length > n) {
		var c = s.substring(0,n);
		var d = c.lastIndexOf(' ');
		var e =c.lastIndexOf('\n');
		if (e != -1) d = e; 
		if (d == -1) d = n;
		b += c.substring(0,d) + '\n';
		s = s.substring(d+1);
	}
	return b+s;
}

/**
 * Probabilmente questa funzione andrebbe spostata altrove
 */
function truncate(text, length, end) {
    if (isNaN(length)){
        length = 10;
	}
    if (typeof end === 'undefined'){
        end = "...";
	}
	var t = (typeof text === 'String') ? text : ''+text;
    if (t.length <= length || t.length - end.length <= length) {
        return t;
    }
    else {
    	t = t.substring(0, length - end.length);
        return t.substr(0,t.lastIndexOf(' ')) + end;
    }
}

/**
 * Verifica se un elemento è contenuto in una collezione a partire dall'indice specificato o in tutta la collezione
 * @param collection
 * @param element
 * @param index
 * @returns {Boolean}
 */
function contains( collection, element, index){
	if (typeof index === 'undefined'){
        index = 0;
	}
	var e = (typeof element === 'String') ? element : ''+element;	
	return (typeof collection !== 'undefined' && collection !== null ) ? (collection.indexOf(e,index)>-1) : false;
}

/**
 * Aggiorna l'altezza della #sidebar e del #content in base alle variazioni della dimesione della finestra
 * @param wh window height
 */
function updateContentHeight( ww , wh){
	var th = 0;jQuery('#toolbars .btn-toolbar:visible').each(function(){ th += jQuery(this).height(); });
	var toolbarsHeight = th; //altezza blocco toolbars
	var topBarHeight   = jQuery(".jazz-admin-topbar .row-1.navbar-inner").outerHeight() || 0;//altezza top bar
	var closetHeight   = (wh  - (topBarHeight) ) ||0 ;//altezza closet
    var sidebarHeight  = jQuery('.jazz-admin.jazz-admin-sidebar').height(); //altezza sidebar
    var sidebarWidth   = jQuery('.jazz-admin.jazz-admin-sidebar').width(); //larghezza sidebar
    
    jQuery('#content').height( closetHeight );
    jQuery('#content-container').height( closetHeight );
    jQuery('#content-body').height( closetHeight - toolbarsHeight );    
    jQuery('.iframeView').height( closetHeight - toolbarsHeight ).width( ww - sidebarWidth );
}

/*
function updateViewIframeDimensions(){
	var ww = $rootScope.windowWidth;
	var wh = $rootScope.windowHeight;
	var topBarHeight = jQuery(".jazz-admin-topbar .row-1.navbar-inner").outerHeight();//altezza top bar
	var closetHeight = (wh  - (topBarHeight) );//altezza closet
    var toolbarsHeight = jQuery('#toolbars').height(); //altezza blocco toolbars            
    var sidebarWidth = jQuery('.jazz-admin.jazz-admin-sidebar').width(); //larghezza sidebar
    
    jQuery('.iframeView').height( closetHeight - toolbarsHeight ).width( ww - sidebarWidth );
}
*/

/*Usata solo per debug */
function writeDimensions(ww,wh){
	var th = 0;jQuery('#toolbars .btn-toolbar:visible').each(function(){ th += jQuery(this).height(); });
	var topBarHeight = jQuery(".jazz-admin-topbar .row-1.navbar-inner").outerHeight() || 0;//altezza top bar
	var closetHeight = (wh  - (topBarHeight) );//altezza closet    
	var socksHeaderHeight = (jQuery('.sidebar-socks-head').outerHeight() || 0)+(jQuery(".breadcrumbs").outerHeight() || 0);//altezza intestazione sidebar
    var socksItemHeader = jQuery('.sidebar-socks-entries.item_header').outerHeight() || 0;//altezza intestazione sidebar item
    //var toolbarsHeight = jQuery('#toolbars').height() || jQuery('#toolbars .btn-toolbar').each(function(){ th += jQuery(this).height(); }) || 0; //altezza blocco toolbars
    var toolbarsHeight = th; //altezza blocco toolbars
    var sidebarWidth = jQuery('.jazz-admin.jazz-admin-sidebar').width(); //larghezza sidebar
    var sidebarHeight = jQuery('.jazz-admin.jazz-admin-sidebar').height();    
    var centralHeight = jQuery('#content-body').height() || 0;    
    
    var horizontalScrollBarHeight = 2;// margin-top: 2px sulle ancore .arnoldo-admin .sidebar-socks-extras .extra-add
    var MIN_HEIGHT_EXTRA = 64 + horizontalScrollBarHeight;
    var MIN_HEIGHT_NAV = 200;    
    
    var navigatorHeight = closetHeight - socksHeaderHeight;  //altezza voci e pulsanti    
    var navigatorItemsHeight = navigatorHeight - MIN_HEIGHT_EXTRA; //altezza voci 
    var navigatorScollableItemsHeight = navigatorItemsHeight - socksItemHeader;//altezza voci scrollabili
   
    console.log("Window height = "+ wh);
	console.log("  topBarHeight    = "+ topBarHeight);
	console.log("  closetHeight      = "+ closetHeight);
	console.log("      socksHeaderHeight = "+ socksHeaderHeight);		
	console.log("      navigatorHeight = "+ navigatorHeight);
	console.log("  toolbarsHeight  = "+ toolbarsHeight);
	console.log("  centralHeight   = "+ centralHeight);
	console.log("  sidebarHeight   = "+ sidebarHeight);
	
}


function updateNavigatorScrolls( ww, wh ){
	var th = 0;jQuery('#toolbars .btn-toolbar:visible').each(function(){ th += jQuery(this).height(); });
	var topBarHeight = jQuery(".jazz-admin-topbar .row-1.navbar-inner").outerHeight() || 0;//altezza top bar
	var closetHeight = (wh  - (topBarHeight) );//altezza closet    
	var socksHeaderHeight = (jQuery('.sidebar-socks-head').outerHeight() || 0)+(jQuery(".breadcrumbs").outerHeight() || 0);//altezza intestazione sidebar
    var socksItemHeader = jQuery('.sidebar-socks-entries.item_header').outerHeight() || 0;//altezza intestazione sidebar item
    var toolbarsHeight = th; //altezza blocco toolbars
    var sidebarWidth = jQuery('.jazz-admin.jazz-admin-sidebar').width() || 0; //larghezza sidebar
    var sidebarHeight = jQuery('.jazz-admin.jazz-admin-sidebar').height() ||0; //altezza sidebar  
    
    var horizontalScrollBarHeight = 2;// margin-top: 2px sulle ancore .arnoldo-admin .sidebar-socks-extras .extra-add
    var MIN_HEIGHT_EXTRA = 64 + horizontalScrollBarHeight;
    var MIN_HEIGHT_NAV = 200;    
    
    var navigatorHeight = closetHeight - socksHeaderHeight;  //altezza voci e pulsanti    
    var navigatorItemsHeight = navigatorHeight - MIN_HEIGHT_EXTRA; //altezza voci 
    var navigatorScollableItemsHeight = navigatorItemsHeight - socksItemHeader;//altezza voci scrollabili   	
/* 
    var nh = jQuery('#side-navigation').height();	//altezza reale navigatore voci e pulsanti
    var esh = jQuery('.sidebar-socks-extras').height();//altezza reale pulsanti navigatore
     
    var scrollExtra = (closetHeight-(nv+esh)>0) && (esh > MIN_HEIGHT_EXTRA);
    var scrollNav = (closetHeight-(nv+esh)>0) && (nh > MIN_HEIGHT_NAV);
    
    var navigatorHeight = nh;
    var extraHeight = esh;
    if (!scrollExtra && scrollNav){
    	navigatorHeight = closetHeight - esh;
    	scrollExtra = esh;
    }
    if (!scrollNav && scrollExtra){
    	navigatorHeight = nh;
    	scrollExtra = closetHeight - nh;
    }
    if (!scrollNav && scrollExtra){
    	scrollExtra = MIN_HEIGHT_EXTRA;
    	navigatorHeight = closetHeight - scrollExtra;
    	
    }
*/    
    jQuery('#content').height( closetHeight );
    jQuery('#content-container').height( closetHeight );
    jQuery('#content-body').height( closetHeight - toolbarsHeight );    
    jQuery('.iframeView').height( closetHeight - toolbarsHeight ).width( ww - sidebarWidth );
   
    jQuery('.jazz-admin.jazz-admin-sidebar .navbar').height( closetHeight );
	jQuery(".sidebar-closet").height( closetHeight );
	jQuery(".sidebar-socks").height( closetHeight );
	jQuery(".sidebar-socks-inner").height( closetHeight );
	jQuery(".sidebar-socks-scroll-wrapper").height( navigatorItemsHeight  );//padding 10 sopra e sotto
	
	//writeDimensions( ww, wh);
	
	var slimConfig = { height:  navigatorScollableItemsHeight+'px', size: '7px', color: '#467389', distance: '4px' };
/*		
	if (scrollNav){
		jQuery('.jazz-admin .sidebar-socks-scroll').slimScroll( slimConfig );
	}
	if (scrollExtra){
		jQuery('.jazz-admin .sidebar-socks-extras-scroll').slimScroll(jQuery.extend(slimConfig, { height: (jQuery('.sidebar-closet').height() - navigatorHeight)} ));
	}

*/		
	var scrollExtraHeight = 0;
	if( jQuery('.jazz-admin .sidebar-socks-scroll').height() && jQuery('.jazz-admin .sidebar-socks-extras-scroll').height() ){
		//jQuery('.jazz-admin .sidebar-socks-scroll').slimScroll( slimConfig );
		scrollExtraHeight = MIN_HEIGHT_EXTRA;//(closetHeight- navigatorHeight);
		if (jQuery('#side-navigation div.slimScrollDiv').length>0){//se ho già lo slimscroll... adatto le altezze
			jQuery('#side-navigation div.slimScrollDiv').height(navigatorScollableItemsHeight);
			jQuery('.jazz-admin .items_list').height(navigatorScollableItemsHeight);				
			//slim per gli extra (bottoni)
			jQuery('.sidebar-socks-extras-scroll div.slimScrollDiv').height( scrollExtraHeight );
			jQuery('.sidebar-socks-extras').height( scrollExtraHeight );
		} else {//se non è già presente lo slimscroll lo inizializzo
			jQuery('.jazz-admin .items_list').slimScroll( slimConfig );
			jQuery('.jazz-admin .sidebar-socks-extras').slimScroll(jQuery.extend(slimConfig, { height: scrollExtraHeight+'px' } ));
		}		
    } else if( jQuery('.jazz-admin .sidebar-socks-scroll').height()  ){
    	scrollItemsHeight = navigatorScollableItemsHeight + MIN_HEIGHT_EXTRA;
    	if (jQuery('#side-navigation div.slimScrollDiv').length>0){//se ho già lo slimscroll... adatto le altezze
			jQuery('#side-navigation div.slimScrollDiv').height(scrollItemsHeight);
			jQuery('.jazz-admin .items_list').height(scrollItemsHeight);	
		} else {//se non è già presente lo slimscroll lo inizializzo
			jQuery('.jazz-admin .items_list').slimScroll(jQuery.extend(slimConfig, { height: scrollItemsHeight +'px' } ));
		}
    }	
	else if (jQuery('.jazz-admin .sidebar-socks-extras-scroll').height()){
    	 scrollExtraHeight = navigatorItemsHeight;
        if (jQuery('.sidebar-socks-extras-scroll div.slimScrollDiv').length>0){//se ho già lo slimscroll... adatto le altezze
        	jQuery('.sidebar-socks-extras-scroll div.slimScrollDiv').height( scrollExtraHeight );
        	jQuery('.sidebar-socks-extras').height( scrollExtraHeight );
        } else {//se non è già presente lo slimscroll lo inizializzo
        	jQuery('.jazz-admin .sidebar-socks-extras').slimScroll(jQuery.extend(slimConfig, { height: scrollExtraHeight+'px'}));  
        }
    }
	
	jQuery('#side-navigation div.slimScrollDiv').css('width','100%');
	jQuery('.jazz-admin .items_list').css('width','100%');
	jQuery('.jazz-admin .sidebar-socks-extras').css('width','100%');
}

function disable_scroll() {
	jQuery('#content-body').css('position','fixed').css('overflow','hidden');
}

function enable_scroll() {
	jQuery('#content-body').css('position','relative').css('overflow','auto');
}


function isClosetClosed(){
	return jQuery('.jazz-admin .sidebar-closet').hasClass('sidebar-closet-closed');
}
var delayOpenCloseCloset = 300;
function closetHide() {
    jQuery('.jazz-admin .sidebar-closet').switchClass(
            'sidebar-closet-open sidebar-closet-full',
            'sidebar-closet-closed',
            delayOpenCloseCloset
            );
}

function closetClose() {
    jQuery('.jazz-admin .sidebar-closet').switchClass(
            'sidebar-closet-open sidebar-closet-full',
            'sidebar-closet-closed',
            delayOpenCloseCloset
            );
}

function closetOpen() {
    //closetClose();
    jQuery('.jazz-admin .sidebar-closet').switchClass(
            'sidebar-closet-open sidebar-closet-closed',
            'sidebar-closet-full',
            delayOpenCloseCloset
            );
}

function closetOpenWidth() {
    jQuery('.jazz-admin .sidebar-closet').switchClass(
            'sidebar-closet-full sidebar-closet-closed',
            'sidebar-closet-open',
            delayOpenCloseCloset
            );
}

function closetOpenHeight() {
    jQuery('.jazz-admin .sidebar-closet').switchClass(
            'sidebar-closet-open sidebar-closet-closed',
            'sidebar-closet-full',
            0
            );
}