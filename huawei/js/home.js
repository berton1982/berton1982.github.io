/**
 * Created by Berton on 2016/8/8.
 */
/* 模仿华为首页 */
// 当文档加载完毕后进行初始化
$(document).ready(init);

function init() {
  // 生成菜单导航对象，应该根据媒体查询来判断是否需要该
  var mainMenuObj = getMainMenuPanelObj();
  mainMenuObj.register();  // 注册鼠标响应事件
}

// 设定subMenuPanelObj，采用构造函数的方式，在移动模式下，不占空间，resize窗口时，根据实际情况清空对象或申请对象
function MainMenuPanelObj(){
  // @timer  定时器，用于判断是否真的关闭子面板
  this.timer = -1;
  // @$panel jquery对象，保存子面板
  this.$panel = $("#subNavPanel");
  // @$menu  jquery对象，保存主菜单ul对象，非li
  this.$menu = $("#mainNav");
  // @$currentPanel  jquery对象，保存当前显示的面板，减少jquery遍历，提高性能
  this.$currentPanel = null;
  // @mouseOverPanelFlag 鼠标是否在子面板上方标志，防止误关闭子面板
  this.mouseOverPanelFlag = false;
  // @mouseOverMenuFlag 鼠标是否在菜单上，防止误关闭子面板
  this.mouseOverMenuFlag = false;
  /*
   * @showPanel(selector)
   * 显示指定的子面板
   */
  this.showPanel = function (selector)  {
    this.hideCurrentPanel();
    if(selector!=""){
      this.$currentPanel = this.$panel.children(selector).first();
      // --
      this.$currentPanel.slideDown(); // 调试修改
      //this.$currentPanel.show();
      // --
    }
  };
  /**
   * @hideCurrentPanel()
   * 隐藏当前子面板
   */
  this.hideCurrentPanel = function () {
    if(this.$currentPanel) {
      this.$currentPanel.slideUp();  //--调试修改
      // --
      //this.$currentPanel.hide();
      // --
    }
  };
  /**
   * @ hidePanel()
   * 隐藏整个面板，同时做判断防止误隐藏，设定事件判定间隔50ms
   */
  this.hidePanel = function(){
    var me = this;
    if(this.timer == -1){  // 第一次调用本程序，需重新进入以确认需要关闭整个子菜单
      this.timer = setTimeout(function () {
        me.hidePanel();
      },50);
    }else{  // 第二次调用本程序，确认关闭事件
      if(this.mouseOverMenuFlag==false && this.mouseOverPanelFlag==false){ // 关闭条件
        //this.$currentPanel.slideUp();   //关闭窗口  --调试修改
        //---
        this.$currentPanel.hide();
        //---
        this.$currentPanel = null;
      }
      this.timer = -1; // 重置timer
    }
  };
  /**
   * @register()
   * 注册鼠标相关事件，menu的mouseover和mouseleave事件，panel的mouseover和mouseout事件
   * 注意如何兼容ie8以前的
   */
  this.register = function () {
    var me = this;
    // 子面板所有panel全部收缩
    // this.$panel.children().css("height",0); //调试修改
    // --
    this.$panel.children().hide();
    // --
    // 注册菜单menu的相关事件
    this.$menu.on("mouseover","li",function () {  // 鼠标滑入，设置标志，并显示相关面板，
      var _selector = $(this).attr("data-panel");
      me.mouseOverMenuFlag = true;
      me.showPanel(_selector);
    }).on("mouseleave","li",function () {   // 鼠标移出，设置标志，并尝试关闭面板
      me.mouseOverMenuFlag=false;
      me.hidePanel();  // 尝试关闭子面板
    });
    // 注册子面板相关鼠标事件
    this.$panel.on("mouseover",function () {  // 鼠标移入，设置当前标志
      me.mouseOverPanelFlag =true;
    }).on("mouseleave",function () {  // 鼠标移出，设置标志，尝试关闭面板
      me.mouseOverPanelFlag = false;
      me.hidePanel();
    });
  }
}

/**
 * 根据页面尺寸来决定是否生成新对象，以适应响应式设计
 */
function getMainMenuPanelObj() {

   if($("header div.mainNavRow").css("display")!="none"){ // 如果主菜单显示，则生成对象，否则返回空
      return new MainMenuPanelObj();
   }
  return null;
 }