/**
 * Created by Berton on 2016/8/11.
 */
$(document).ready(init);

function init() {
  var mainMenuCtr = null;
  // 生成主菜单导航控制器，应该根据媒体查询来判断是否需要该
  mainMenuCtr = new MainMenuController();
  mainMenuCtr.registerMe();  // 注册鼠标响应事件

  // 生成移动菜单单号控制器
  var mobileMenuCtr = null;
  mobileMenuCtr = new MobileMenuController();
  mobileMenuCtr.registerMe();
  // 移动菜单按钮点击
  //

  // 新闻列表
  var newsListCtr = new NewsListController();
  newsListCtr.registerMe();

  // 播放器
  var videoCtr = new VideoPlayerController();
  videoCtr.registerMe();
}

// 主菜单面板控制器
function MainMenuController(){
  "use strict";
  this.timer = -1;
  this.mouseOverMenu = "";
  this.mouseOverPanel ="";
  this.$panel = $("#subNavPanel").children().first();
  this.$menu = $("#mainNav");

  this.showPanel = function (selector) {
    if(selector!=""){
      this.$panel.children(selector).slideDown();
    }
  };

  this.hidePanel = function (selector) {   //是否可以通过bind永久固定this this.hidePanel.bind(this)  来替代临时变量_me，减少内存空间
    var _me = this;
    if(selector!=""){
      // recheck ,检查鼠标是否mouseover自身
      if(this.timer ==-1){
        this.timer = setTimeout(function(){
          _me.hidePanel(selector);
        },300);
      }
      // 第二次，运行，确认是否真的关闭
      else{
        if( this.mouseOverMenu != selector && this.mouseOverPanel != selector ){
          this.$panel.children(selector).slideUp();
          this.timer = -1;
          //debug
          //alert("menu:"+this.mouseOverMenu +" panel:"+ this.mouseOverPanel+"  selector: "+selector);
        }
      }
    }
  };

  this.registerMe = function () {
    // 保存this指针，方便异步调用
    var _me = this;
    var _selector="";
    // 隐藏所有子面板
    this.$panel.children().hide();
    // 注册菜单鼠标事件
    this.$menu.on("mouseenter","li",function () { // 暂不采用mouseover
      _selector = $(this).attr("data-panel");
      if(_selector!=""){
        _me.showPanel(_selector);
        _me.mouseOverMenu = _selector;
      }
    }).on("mouseleave","li",function () {  // 暂不采用mouseout
      _selector = $(this).attr("data-panel");
      if(_selector!=""){
        _me.mouseOverMenu = "";
        _me.hidePanel(_selector);
      }
    });
    // 注册面板鼠标事件
    this.$panel.on("mouseenter","div[data-panel]",function () {
      _selector = $(this).attr("data-panel");
      _me.mouseOverPanel = _selector;
      // debug
      //alert("panel: "+_selector+" mouse enter");  //有触发
    }).on("mouseleave","div[data-panel]",function () {
      _selector = $(this).attr("data-panel");
      if(_selector!=""){
        _me.mouseOverPanel ="";
        _me.hidePanel(_selector);
        //debug
        //alert("panel: "+_selector+"  mouseleave");  // 有触发
      }
    });
    // alert(this.$panel.find("[data-panel]").length);  //ok
  }
}

/**
 * @MobileMenuController 为移动端菜单控制器构造函数
 * 实现功能：
 *     1. 点击右上角关闭按钮，整个窗口自动右移隐藏
 *     2. 点击 li.mobile_main_nav_topic ，下拉子菜单窗口，并添加active样式，关闭其他子窗口，同时窗口自动滚动到该li.mobile_main_nav_topic位置
 *     3. 鼠标移动到子菜单的li项，对应的标题li也响应高亮
 * 接口：
 *     1.  @@open  打开窗口
 *     2.  @@close  关闭窗口
 */

function MobileMenuController(){
  "use strict";
  // 保存菜单对象
  this.$menu = $("#mobileMainNav");
  this.$mobileMenuIcon = $("header span.mobile_nav_icon");
  this.$closeButton = this.$menu.find("span.close_mobile_menu");
  this.$searchIcon = $("header span.mobile_search_icon");
  this.$searchForm = $("#mobile_search");

  // 保存滚动条位置
  // 关闭菜单
  this.close=function(){
    this.$menu.css("right","-100%")
      .find("li.mobile_sub_nav").slideUp();// 同时收缩所有的子面板
  };
  // 打开菜单
  this.open = function () {
    this.$menu.css("right","0");
  }.bind(this);
  // 点击打开子菜单，自动判断打开还是关闭
  this.toggleSub = function ($menuItem) {
    // 去除同级其他li.mobile_main_nav_topic的active样式，并关闭对应的子菜单面板
    $menuItem.siblings("li.mobile_main_nav_topic.active").each(function () {
      $(this).toggleClass("active").next().slideToggle();
    });
    // 添加active样式，并展开下级子菜单
    $menuItem.toggleClass("active").next().slideToggle(function(){
      // 将滚动条移至当前位置
      this.$menu.animate({scrollTop:$menuItem.position().top},500);
    }.bind(this));
  };  //测试绑定, 可以避免注册时重新添加变量

  this.toggleSubNavClass = function ($menuItem) {
    // 去除其他li的样式
    $menuItem.siblings().removeClass("active");
    // 本li添加样式
    $menuItem.toggleClass("active");
    // 寻找对应的标题项，并添加样式
    $menuItem.prevAll("li.title").first().toggleClass("active");
  };
  // 注册事件，只对关闭按钮，打开按钮和li.mobile_main_nav_topic注册事件
  this.registerMe = function () {
    var _me = this;
    // 注册关闭按钮
    this.$closeButton.on("click",function () {
      // 隐藏自己
      _me.close();
    });
    // 注册菜单点击
    this.$menu.on("click","li.mobile_main_nav_topic",function () {
      _me.toggleSub($(this));
    }).on("mouseover","li.mobile_sub_nav li",function(){  // 注册鼠标mouseover子菜单选项时高亮
      _me.toggleSubNavClass($(this));
    });
    // 移动菜单按钮鼠标点击
    this.$mobileMenuIcon.on("click",function () {
      // 打开菜单面板
      _me.open();
    });
    // 移动搜索框
    this.$searchIcon.on("click",function () {
      //
      _me.$searchForm.toggle();
    })
  };
}

/**
 * 新闻列表控制器
 * @constructor
 */
function NewsListController(){
  "use strict";
  this.$newsList = $("#news ul").first().children();
  this.$first = this.$newsList.first();
  this.$last = this.$newsList.last();
  this.$current = this.$first;
  this.intervalLog = -1;
  /*
  * 定时自动切换列表新闻
  * */
  this.autoShow= function () {
    if(this.intervalLog==-1){
      this.toggleInterval();
    }
  };
  this.showNext=function () {
    this.$current.toggle();
    this.$current = this.$current.next().length ? this.$current.next() : this.$first;
    this.$current.toggle();
  }.bind(this);
  this.showPrev = function () {
    this.$current.toggle();
    this.$current = this.$current.prev().length ? this.$current.prev() : this.$last;
    this.$current.toggle();
  }.bind(this);
  this.toggleInterval = function () {
    if(this.intervalLog!=-1){  // 取消自动翻转
      clearInterval(this.intervalLog);
      this.intervalLog = -1;
    }else{
      this.intervalLog = setInterval(function(){
        this.showNext();
      }.bind(this),3000);
    }
  };

  this.registerMe = function () {
    // 隐藏除第一外的其他li
    // 鼠标点击
    this.$current.siblings().hide();
    $("#news div.arrow").children().first().on("click",function () {   // 向前翻页
      this.showPrev();
    }.bind(this)).next().on("click",function () {    // 向后翻页
      this.showNext();
    }.bind(this));
    // 鼠标滑到li a上，自动暂停，离开li，又自动开启
    $("#news ul").on("mouseover","a",function () {
      this.toggleInterval();
    }.bind(this)).on("mouseleave","li",function () {
      this.toggleInterval();
    }.bind(this));

    //自动滚动新闻条
    this.autoShow();
  };

}

/***
 * 播放器控制器
 * @play 为video对应的dom对象
 * @$foreground 为前景图片层
 * @$player 为视频播放层
 * @$playerCtr 为视频播放控制按钮层
 * @$playerCtr_background 为控制按钮层中的背景层
 * @$playerStart 为控制层中的开始播放层
 * @$playerWait 为控制层中的等待层
 * @$close 为视频播放层中的关闭按钮
 */

function VideoPlayerController(){
  "use strict";
  this.player = document.getElementById("videoPlayer");
  this.$foreground = $("#video div.foreground");
  this.$player = $("#video div.player");
  this.$playerCtr = $("#video div.playerCtr");
  this.$playerCtrBackground = $("#video div.background");
  this.$playerCtrStart =$("#video div.play_start");
  this.$playerCtrWait = $("#video div.play_wait");
  //this.$close = $("#video div.close");
  
  // 只针对前景页面点击
  this.start = function () {
    // 隐藏前景页
    this.$foreground.hide();
    // 隐藏按钮层
    this.$playerCtr.hide();
    this.$player.show();
    // 播放器开始播放
    this.player.play();
  };

  // 只针对播放层中关闭按钮
  // todo : bug  按钮层样式不对
  // todo : player 未完成全部鼠标事件响应，和播放器的事件状态响应
  this.close = function () {
    // 视频暂停
    this.player.pause();
    this.player.currentTime=0;
    // 隐藏该层
    this.$player.hide();
    // 显示前景层
    this.$foreground.show();
    // 设置按钮层中的相关背景
      // 隐藏 wait和start层
    this.$playerCtrStart.hide();
    this.$playerCtrWait.hide();
    // 显示按钮层
      this.$playerCtr.show();
    // 去除playerCtr background playerOn 样式
    this.$playerCtrBackground.removeClass("playerOn")
      .addClass("normal");
    // 动画显示 开始层
    this.$playerCtrStart.show("normal");
  };

  // 用于播放层 响应鼠标点击时的动作,播放或暂停
  this.togglePlay = function () {
    // 检查播放器状态
    //如果是结束或者暂停状态，则开始播放
    if(this.player.paused){
      // 隐藏按钮层
      this.$playerCtr.hide();
      // 开始播放
      this.player.play();
    }else{  // 否则，暂停播放，并显示控制按钮层
      // 暂停播放
      this.player.pause();
      // 确认按钮层为隐藏状态
      if(this.$playerCtr.css("display")!="none"){
        this.$playerCtr.hide();
      }
      // 确认start为显示状态
      if(this.$playerCtrStart.css("display")!="none"){
        this.$playerCtrStart.show();
      }
      // 动画显示按钮图层
      this.$playerCtr.show("normal");
    }
  }

  // 注册鼠标响应事件,和播放器状态信息
  this.registerMe = function(){
    // 鼠标事件
    $("#video").on("click","div.foreground",function () {  // 处理点击前景层
      this.start();
    }.bind(this))
      .on("click","div.player",function(){  // 处理点击播放层
        this.togglePlay();
      }.bind(this))
      .on("click","div.close",function (e) {  // 处理点击关闭
        this.close();
        // 阻止事情冒泡
        e.stopImmediatePropagation();  //?? 冒泡到哪里？？
      }.bind(this))
      .on("mouseover","div.foreground",function () {  // 处理前景层，鼠标悬停
        // 按钮背景变成红色半透明
        this.$playerCtrBackground.removeClass("normal")
          .addClass("foreOn");
      }.bind(this))
      .on("mouseout","div.foreground",function () {  // 鼠标移出前景层，背景恢复原状 ，尽量采用类
        this.$playerCtrBackground.removeClass("foreOn")
          .addClass("normal");
      }.bind(this))
      .on("mouseover","div.player",function () {
        this.$playerCtrBackground.removeClass("normal")
          .addClass("playerOn");
      }.bind(this))
      .on("mouseout","div.player",function(){
        this.$playerCtrBackground.removeClass("normal")
          .addClass("playerOn");
      }.bind(this));
    // 播放器事件处理
  }
}