// JavaScript Document
//全局方法整理
/*
ZY.UIManager.scrollToTarget($("#id")) 页面垂直滚动到#id元素对应的位置
ZY.UIManager.showArticle(url) 加载展开页面，url是请求页面的地址
ZY.UIManager.hideArticle()关闭加载的页面
ZY.UIManager.showImageDetail(url)显示缩略图对应的大图，url是请求图片的地址
ZY.UIManager.showVideoDetail(url)显示缩略图对应的视频，url是请求视频的地址
ZY.UIManager.hideDetail()隐藏弹出层
ZY.UIManager.initMusicPlayer() 初始化音乐播放器，绑定必须各种事件
ZY.UIManager.nextMusic() 播放音乐列表中的下一首
ZY.UIManager.toggleMusicPlayPause() 切换音乐播放与暂停状态
ZY.UIManager.popOutInit() 初始化popOut窗口，绑定各种事件
ZY.UIManager.popOutMsg(msg) 弹出窗口显示msg字符串
ZY.UIManager.popoutHide() 隐藏popOut窗口
ZY.UIManager.callLoadingSpinner(target) 在target元素的DOM中添加loadingspinner
ZY.UIManager.hideLoadingSpinner(target) 在target元素的DOM中移除loadingspinner
ZY.UIManager.updateSectionBG(data,target) 更新目标元素的背景主题
ZY.UIManager.bindHScrollOnWheel(targetID)在ID属性为targetID的元素上绑定鼠标滚轮横轴滚动事件
ZY.UIManager.scrollingHandler() 更新页面所有悬浮元素的位置
ZY.UIManager.fadingIn(target) 使target的透明度从0渐变到1，需预先设置target的css transition
ZY.UIManager.wheelScrollModeOn() 启动页面滚轮模式
*/
var ZY=ZY||{};
ZY.UIManager=function(){
	//私有属性
	var lastBlackoutZ=0;
	var lastPageY=0;
    var musicPlaying=true; //音乐是否应该播放

    //私有方法
	var showBlackout=function(zindex){
			lastBlackoutZ=$("#zy_wrap").css("z-index");
			$("#zy_wrap").css("z-index",zindex);
			if($("#zy_wrap").hasClass("zy_hidden")){
				$("#zy_wrap").removeClass("zy_hidden")
            }
        };
	var hideBlackout=function(){
			if(!$("#zy_wrap").hasClass("zy_hidden")){
				$("#zy_wrap").addClass("zy_hidden")
				$("#zy_wrap").css("z-index",lastBlackoutZ);
            }
        };
		
	//公共属性及方法定义
	return{    
		scrollToTarget:function(target){
			var top=$(target).offset().top;
			if(top!= undefined){
				//$("body,html").stop();
				//$("body,html").animate({'scrollTop':top},1000,"swing");
				TweenLite.killTweensOf(window)
				TweenLite.to(window, 1, {scrollTo:{y:top+10, x:0}});
            }
			
        },		
		showArticle:function(post_id,post_type){
			var _self=this;
			//首先要清除原有的内容
			$("#zy_article_content").find("article").remove();
        	showBlackout(9996);
        	$("#zy_article_container").animate({left:"0%"},300,function(){
				_self.callLoadingSpinner($("#zy_article_content"));
                ZY.DataManager.get_posts_detail(post_id,post_type);
			});
        },
		hideArticle:function(){
			$("#zy_article_container").animate({left:"100%"},300);
			hideBlackout();
			this.hideLoadingSpinner($("#zy_article_content"))
        },
		showVideoDetail:function(url){
			var _self=this;
			$("#zy_show_load_container").html("");
        	showBlackout(9998);
        	$("#zy_show_section").removeClass("zy_hidden");
       		$("#zy_show_load_container").load(url,function(response, status, xhr){
                _self.hideLoadingSpinner($("#zy_article_content"));
                if (status == "error") {
                    _self.popOutMsg(ZY.Config.errorCode.connectionError+xhr.status + " " + xhr.statusText);
                }
            });
        	//暂停音乐
        	$("#zy_music_audio")[0].pause();        	
        },
		showImageDetail:function(url){
       		showBlackout(9998);
        	$("#zy_show_section").removeClass("zy_hidden");
        	$("#zy_show_load_container").html("<img src='"+url+"'>");
        },
		hideDetail:function(){
            var audio=$("#zy_music_audio")[0];
			$("#zy_wrap").css("z-index",lastBlackoutZ);
        	$("#zy_show_section").addClass("zy_hidden");
        	$("#zy_show_load_container").html("");

        	//恢复音乐
            if(musicPlaying){
                audio.play();
            }
        },
		initMusicPlayer:function(){
			//绑定播放暂停控制
			var _self=this;
            var audio= $("#zy_music_audio");
			$("#zy_music_control").click(function(){
				_self.toggleMusicPlayPause();
            });
			//绑定下一首
			$("#zy_music_next").click(function(){
				_self.nextMusic();
			});
			
			//绑定进度条
            audio[0].addEventListener("timeupdate",function(){
				var audio=$(this)[0];
				var totalTime=audio.duration;
				var currentTime=audio.currentTime;
				$("#zy_music_process_value").css("width",currentTime/totalTime*100+"%");
			//animate({width:"100%"},(times-currentTime)*1000);
			});

			
			//绑定结束事件
            audio[0].addEventListener("ended",function(){
				_self.nextMusic();
			});
        },
		toggleMusicPlayPause:function(){
			if($("#zy_music_control").hasClass("zy_music_play")){
           		this.playMusic();
       		}else if ($("#zy_music_control").hasClass("zy_music_pause")){
            	this.pauseMusic();

            }
        },
		pauseMusic:function(){
            var audio=$("#zy_music_audio");
            audio[0].pause();
            musicPlaying=false;
            audio.attr("autoplay",false);
           	$("#zy_music_control").removeClass("zy_music_pause").addClass("zy_music_play");
		},
		playMusic:function(){
            var audio=$("#zy_music_audio");
            audio[0].play();
            musicPlaying=true;
            audio.attr("autoplay","autoplay");
            $("#zy_music_control").addClass("zy_music_pause").removeClass("zy_music_play");
		},
		nextMusic:function(){
			$("#zy_music_process_value").stop().width("0%");
        	var target=$(".active_music").next().length!=0?$(".active_music").next():$("#zy_music_list li:eq(0)");
			$(".active_music").removeClass("active_music");
			$("#zy_music_audio").attr("src",target.html());//设置音乐路径
			$("#zy_music_author").html("Directed by "+target.data("music-author"));
			$("#zy_music_title").html(target.data("music-title"));
			target.addClass("active_music");

        },
		popOutInit:function(){
			var _self=this;
			$("#zy_popout_win>.zy_popout_btn").on("click",function(){
				_self.popOutHide();
            });
			if(!$("#zy_popout_win").hasClass("zy_hidden")){
				$("#zy_popout_win").addClass("zy_hidden");
            }
        },
		popOutMsg:function(msg,showblackout){
			if($("#zy_popout_win").hasClass("zy_hidden")){
				$("#zy_popout_win").removeClass("zy_hidden").find(".zy_popout_title").html(msg)
				//this.showBlackout(9999);
            }
			if(showblackout){
				showBlackout(9999)
				}
        },
		popOutHide:function(){
			$("#zy_popout_win").addClass("zy_hidden").find(".zy_popout_title").html("");
			//this.hideBlackout();
        },
		callLoadingSpinner:function(target){
			var spinnerDOM="<div class='zy_loading_spinner'>"
					+"<div class='zy_loading_spinner_layer1'></div>"
					+"<div class='zy_loading_spinner_layer2'></div></div>";
			var	spinner=$(spinnerDOM);
            //添加到target DOM中
            if($(target).find(".zy_loading_spinner").length<=0){
                $(target).append(spinner);
            }
				
        },
		hideLoadingSpinner:function(target){
			$(target).find(".zy_loading_spinner").detach();
        },
		updateSectionBG:function(data,target){

            /*
             * 修改背景图
             * params data数据数组,target 背景图的img标签
             * */

             if(data["background"]){
                //第一次才换背景
                if(data["background"]["type"]!="mp4"){
                    //$(target).find(".zy_theme_bg_content").attr("src",data["background"]["filepath"]);
					$(target).append($("<img class='zy_theme_bg_content' src='"+data["background"]["filepath"]+"' onload='ZY.UIManager.fadingIn(this)' />"));
                }else if(!ZY.Config.deviceCode.iOS){
                    //视频作为背景
					$(target).append($("<video class='zy_theme_bg_content' autoplay loop muted oncanplay='ZY.UIManager.fadingIn(this)'><source src='"+data["background"]["filepath"]+"' type='video/mp4' /></video>"));
                }
            }
        },
		bindHScrollOnWheel:function(targetID){
			var target=document.getElementById(targetID)
			var mousewheelEvt="onwheel" in document.createElement("div") ? "wheel" : 
				document.onmousewheel !== undefined ? "mousewheel" : 
				"DOMMouseScroll"; 
				
			target.addEventListener(mousewheelEvt, function(evt) {
				var evt = window.event || evt; 
				//var delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));
				var delta =evt.deltaY || evt.wheelDelta*-1/40 || evt.detail;
				console.log($(this).scrollLeft()+delta)
				$(this).scrollLeft($(this).scrollLeft()+delta*50)
				//var target=$(targetID)
				//$(this).stop();
				//$(this).animate({"scrollLeft":$(this).scrollLeft()+(delta > 0 ? 1000 : -1000)},200,"swing")
				evt.preventDefault();
				evt.stopPropagation();
				return false;
    		});
		},
		fadingIn:function(target){
			$(target).css("opacity",1)
		},
		scrollingHandler:function(){
			
			var sy=window.pageYOffset;
			var navH=$("#zy_nav").height();
			var winH=$(window).height();
			var tpH=$(".zy_top_post").height();
			var ftH=$(".zy_featured").height();
			var landScapeBG=$("#zy_landscape_theme .zy_theme_bg_content");
			var peopleBG=$("#zy_people_theme .zy_theme_bg_content");
			var artifactBG=$("#zy_artifact_theme .zy_theme_bg_content");
			var communityBG=$("#zy_community_theme .zy_theme_bg_content");
			
			var tpY=$(".zy_top_post").offset().top;
			var ftY=$(".zy_featured").offset().top;
			var landScapeY=$("#zy_landscape").offset().top;
			var peopleY=$("#zy_people").offset().top;
			var artifactY=$("#zy_artifact").offset().top;
			var communityY=$("#zy_community").offset().top;
			var footerY=$(".zy_footer").offset().top;
			
			//导航边栏跟随
			if(sy<=ftY){
				//TweenLite.to($("#zy_nav"), 0.4, {top:100+(landScapeY-navH-200)/ftY*sy});
				$("#zy_nav").css("top",100+(landScapeY-navH-200)/ftY*sy)
			}
			
			//设置顶部菜单状态
			//首先重置所有菜单
			$(".zy_top_nav ul li a").removeClass("active")
			if(sy<=landScapeY){
				
			}else if(sy<=peopleY){
				$(".zy_top_nav ul li:nth-child(1) a").addClass("active")	
			}else if(sy<=artifactY){
				$(".zy_top_nav ul li:nth-child(2) a").addClass("active")	
			}else if(sy<=communityY){
				$(".zy_top_nav ul li:nth-child(3) a").addClass("active")	
			}else if(sy<=footerY){
				$(".zy_top_nav ul li:nth-child(4) a").addClass("active")
			}
			
			//设置背景状态
			if(sy>landScapeY-winH && sy<=landScapeY+720){
				if(!ZY.Config.deviceCode.iOS){
					landScapeBG.addClass("zy_bg_fixed");
				}
				if(!ZY.DataManager.landscapeLoaded){
				/*====获取第1个分类(风景）文章，等宽340===*/
     			ZY.DataManager.zy_get_posts($("#zy_landscape_contain"),240,3,ZY.DataManager.lastLandscapeDate,true);
				ZY.DataManager.landscapeLoaded=true;
				}
								
			}else{				
				landScapeBG.removeClass("zy_bg_fixed");				
			}
			
			if(sy>peopleY-winH && sy<=peopleY+720){
				if(!ZY.Config.deviceCode.iOS){
					peopleBG.addClass("zy_bg_fixed");
				}
				
				if(!ZY.DataManager.peopleLoaded){
				/*====获取第2个分类（人文）文章,左边有一个大的===*/
    			ZY.DataManager.zy_get_posts($("#zy_people_contain"),340,2,ZY.DataManager.lastPeopleDate,true);
				ZY.DataManager.peopleLoaded=true;
				}
			}else{
				peopleBG.removeClass("zy_bg_fixed");
			}
			
			if(sy>artifactY-winH && sy<=artifactY+720){
				if(!ZY.Config.deviceCode.iOS){
					artifactBG.addClass("zy_bg_fixed");
				}
				if(!ZY.DataManager.artifactLoaded){
				/*====获取第3个分类(物语）文章，等宽400===*/
    			ZY.DataManager.zy_get_posts($("#zy_artifact_contain"),400,5,ZY.DataManager.lastArtifactDate,true);
				ZY.DataManager.artifactLoaded=true;
				}
			}else{
				artifactBG.removeClass("zy_bg_fixed");
			}
			if(sy>communityY-winH && sy<=communityY+720){
				if(!ZY.Config.deviceCode.iOS){
					communityBG.addClass("zy_bg_fixed");
				}
				
				if(!ZY.DataManager.communityLoaded){
				/*====获取第4个分类(社区）文章，等宽400===*/
     			ZY.DataManager.zy_get_posts($("#zy_community_contain"),340,4,ZY.DataManager.lastCommunityDate,true);
				ZY.DataManager.communityLoaded=true;
				}
			}else{
				communityBG.removeClass("zy_bg_fixed");
			}
        },

        /**
         * 函数说明：针对窗口放大缩小，每个分类展示的响应事件
         * 主要是设置ul外围容器container的宽度和显示影藏下一页按钮
         * 由于当窗口缩小时显示的个数少了，原来显示的最后一页当前可能已经不是最后一页，此时需要判断移除zy_disable类
         * 由于当窗口放大时显示的个数多了，原来显示的不是最后一页当前可能已经是最后一页，此时需要判断添加zy_disable类
         * @param {object} targetContain     最外围的容器section
         * @param {int} width    每个li的宽度
         * @param {bool} loaded  是否已经加载过数据
         */
        doResizeOfCategory:function(targetContain,width,loaded){
            var limit=parseInt($("body").width()/width);
            var nextBtn=targetContain.find("a.zy_contain_next");
            var list=targetContain.find("ul");
            var targetContainer=targetContain.find(".zy_list_container");

            //设置容器的宽度
            targetContainer.width(limit*width);

            //判断下一页按钮是否能够显示,针对缩小主要是移除zy_disable类，针对放大主要是加上zy_disable类
            if(parseInt(list.css("left"))>-(list.find("li").length-limit)*width&&loaded){

                //如果left的值没有到总数的前一页，那么就还没有到最后一页，需要取出zy_disable类。
                nextBtn.removeClass("zy_disable");
            }else{

                //需要数据加载后才做次操作
                if(loaded){
                    nextBtn.addClass("zy_disable");
                }
            }
        },
		wheelScrollModeOn:function(){
			var mousewheelEvt="onwheel" in document.createElement("div") ? "wheel" : 
				document.onmousewheel !== undefined ? "mousewheel" : 
				"DOMMouseScroll"; 
			var mousewheelHandler=function (evt) {
				var evt = window.event || evt; 
				var delta =evt.deltaY || evt.wheelDelta*-1/40 || evt.detail;
				TweenLite.killTweensOf(window)
				TweenLite.to(window, 0.5, {scrollTo:{y:window.pageYOffset+(delta > 0 ? 500 : -500)}});				
    		}	
			window.addEventListener(mousewheelEvt, mousewheelHandler);
			}
//类属性及方法定义结束
		}
	}()