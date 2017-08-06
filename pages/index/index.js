//index.js
//获取应用实例
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var util = require('../../utils/util.js');
var that;
var app = getApp()
Page({
  data: {
    iconurl: '../../img/icon.png',
    appname: '小 麻 雀 订 餐 系 统',
    showinputrealname: true,
    notOrder:true
  },
  //事件处理函数
  gotoHome: function() {
    wx.redirectTo({
      url: '../home/home'
    })
  },
  onLoad: function () {
    var realname = wx.getStorageSync('realname')
    if (realname != "") {
      this.setData({
        showinputrealname: false
      })
    }
    getOrderInfos(this);
  },
  
  formSubmit: function(event) {
    if (this.data.notOrder) {
      var that = this;
      if (this.data.showinputrealname) {
        var realname = event.detail.value.realname;
        if (realname != "") {
          var openid = wx.getStorageSync('openid');
          var u = Bmob.Object.extend("_User");
          var query = new Bmob.Query(u);
          query.equalTo("openid", openid);
          query.first({
            success: function (result) {
              result.set("realname", realname);
              result.save();
              common.showTip('填写姓名成功', 'success', new function () {
                getApp().globalData.realname = realname;
                wx.setStorage({
                  key: "realname",
                  data: realname
                })

                wx.redirectTo({
                  url: '../home/home'
                })
              })
            },
            error: function (error) {
              common.showModal(error.message, '请求失败');
            }
          });
        } else {
          common.showModal('请填写正确的真实姓名!', '填写错误');
        }
      } else {
        wx.redirectTo({
          url: '../home/home'
        })
      }
    } else {
      wx.redirectTo({
        url: '../order/order'
      })
    }
  }
})

/*
  * 获取数据
  */
function getOrderInfos(t) {
  that = t;
  var OrderInfo = Bmob.Object.extend("OrderInfo");
  var query = new Bmob.Query(OrderInfo);
  var openid = wx.getStorageSync('openid')
  query.ascending('foodid');
  query.equalTo("openid", openid);
  query.equalTo("orderday", util.getNowDate());
  // 查询所有数据
  query.limit(that.data.limit);
  query.find({
    success: function (results) {
      if (results.length > 0) {
        that.setData({
          notOrder: false
        })
      }
     
    },
    error: function (error) {
      that.setData({
        notOrder: true
      })
      console.log("查询失败: " + error.code + " " + error.message);
    }
  });
}