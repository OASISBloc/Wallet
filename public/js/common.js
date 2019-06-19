$(document).ready(function(){
    
	
	formActive();
	transactionTbl();
});

//tab
function tabActive(id){
	var idNum = id.replace('tabActive','');
	var tabWrapId = $('#tabWrap' + idNum);
	var btn = $('#' + id).find('a');
	var idx = $('#' + id).find('li.on').index();
	tabWrapId.find('> .tab-cont').hide().eq(idx).show();
	btn.on('click', function(e){
		var targetLink = $(this).attr('href');
		$(this).closest('li').addClass('on').siblings('li').removeClass('on');
		tabWrapId.find('> .tab-cont').hide();
		$(targetLink).show();
		e.preventDefault();
		transactionTbl();
	});
}

//layer popup open
function popupOpen(id){
	$(id).parent('.layer_wrap').css('display','block');
	var clientW = document.documentElement.clientWidth;
	var clientH = document.documentElement.clientHeight;
	var popupW = $(id).width();
	var popupH = $(id).height();
	
	$(id).css({
		'left' : (clientW-popupW)/2,
		//'top' : (clientH-popupH)/2
	});
}

//layer popup close
function popupClose(e){
	$(e).parents('.layer_wrap:visible').hide();
}

//form
function formActive(){
	//input[text]
	$('.has-clear input[type="text"], .has-clear input[type="password"]').on('input propertychange', function() {
		var $this = $(this);
		var visible = Boolean($this.val());
		$this.toggleClass('on', visible).siblings('.form-control-clear').toggleClass('hidden', !visible);
	}).trigger('propertychange');
	$('.form-control-clear').click(function() {
		$(this).siblings('input[type="text"], input[type="password"]').val('').trigger('propertychange').focus().removeClass('error');
	});

	//password
	$('.password .btn-code').on('click',function(){
		var pwdIpt = $(this).siblings('input');
		$(this).toggleClass('on');
		if($(this).is('.on')){
			pwdIpt.attr('type','text');
		}else{
			pwdIpt.attr('type','password');
		}
	});

	//selectbox
	$('.select').each(function(){
		var txt = $(this).find('.txt');
		var $select = $(this).find('ul');
		txt.on('click', function(){
			if(!$select.is(':visible')){
				$select.slideDown();
			}else{
				$select.slideUp(150);
			}
		});
		$select.find('a').on('click', function(){
			var selTxt = $(this).text();
			txt.text(selTxt);
			$select.slideUp(150);
		});
	});



}

//transaction-tbl
function transactionTbl(){
	var tblW = $('.transaction-tbl').width();
	var memoCellW = $('.transaction-tbl tr td:last-child').width();
	$('.transaction-tbl .memo').css('margin-left', - (tblW - memoCellW));
}

