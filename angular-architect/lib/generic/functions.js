jQuery(document).ready(function() {
	
//spostata nella direttiva	jQuery('.jazz-admin .navbar-fixed-side').height(jQuery(document).height());

    /* apri chiudi closet SPOSTATO NELLA DIRETTIVA* /	
	jQuery('.jazz-admin .sidebar-main-main a').click(function() {
		if (jQuery(this).parent().hasClass('sidebar-disabled')){
			closetClose();
	    	return false;
	    } else {
	        if ( jQuery(this).closest('li').hasClass('active') && isClosetClosed() ){
	        	if (!jQuery(this).closest('li').hasClass('no-closet')) { closetOpen(); }
	        	return false;
	        } else if (!isClosetClosed() ) {
	            closetClose();
	        }
	        collapseOpen();	        
	        return false;// jazz TEAM ci blocca i link 
    	}
	});
    //*/
	
	/* collassa SPOSTATO NELLA DIRETTIVA * /
	jQuery('.extra-collapse a').click(function() {
		if(jQuery(this).closest('li').hasClass('extra-collapse-collapsed')){
			collapseOpen();
		} else {
			collapseClose();
		}
		return false;
	});
	//*/
	/* decollassa SPOSTATO NELLA DIRETTIVA * /
	jQuery('.extra-collapse-collapsed a').click( function() {
		collapseOpen();
		//jQuery(this).find('i').
		return false;
	});
	//*/
/* FIXME: vanno eseguiti solo in pageBundle carousel blockbar * /
	jQuery('.menu-blockbar').on('cycle-initialized', function (e, opts, API) {
            var carouselVisible = parseInt(Math.floor(jQuery(".menu-blockbar").width()/jQuery(".menu-blockbar li:first").width()));                                                                       			
            if(carouselVisible>=opts.slideCount){
                jQuery(".menu-blockbar-next").hide();
                jQuery(".menu-blockbar-prev").hide();
            }
            else{
                jQuery(".menu-blockbar-next").show();
            }
    });
 	jQuery('.menu-blockbar').on( 'cycle-next', function (e, opts, API) {
	            var carouselVisible = parseInt(Math.floor(jQuery(".menu-blockbar").width()/jQuery(".menu-blockbar li:first").width()));
	                                            
	            if((carouselVisible+opts.currSlide)==opts.slideCount)
	                jQuery(".menu-blockbar-next").hide();
	            
	            jQuery(".menu-blockbar-prev").show();
	                                                    			
	});
    jQuery('.menu-blockbar').on( 'cycle-prev', function (e, opts, API) {
	            var carouselVisible = parseInt(Math.floor(jQuery(".menu-blockbar").width()/jQuery(".menu-blockbar li:first").width()));
	                                            
	            if(opts.currSlide===0)
	                jQuery(".menu-blockbar-prev").hide();
	            
		jQuery(".menu-blockbar-next").show();
	});            
//*/
/* drag blocchi */
/*	
	jQuery('.menu-blockbar li').draggable({
		helper: 'clone',
		appendTo: '.jazz-admin-container',
		start: function(e, ui) {
			//jQuery(this).addClass('menu-blockbar-sel').find('a').css({color:'red'});
		},
		stop: function(e, ui) {
			jQuery(this).removeClass('menu-blockbar-sel');
			//console.log('stop!');
		},
		revert: 'invalid'
	});
*/	
	// container principale droppable 
	jQuery('.jazz-admin-container p').droppable({
		accept: '.menu-blockbar li',
		drop    : function(e, ui) {
			//console.log('dragged! ' + ui.draggable.text());
	  	} 
	});
//*/
});

