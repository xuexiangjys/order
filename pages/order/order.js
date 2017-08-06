// order.js
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var util = require('../../utils/util.js');
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderinfos: [],
    total:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    getOrderInfos(this);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  reOrder: function() {
    deleteOrders(this);
  }
})


 /*
  * 获取订单数据
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
      // 循环处理查询到的数据
      var total = 0;
      for (var id in results) {
        var order = results[id];
        total += order.attributes.foodprice * order.attributes.foodnumber;
      }
      that.setData({
        orderinfos: results,
        total: total
      })
    },
    error: function (error) {
      console.log("查询失败: " + error.code + " " + error.message);
    }
  });
}

/*
  * 删除订单数据，重新下单
  */
function deleteOrders(t) {
  that = t;
  wx.showLoading({
    title: '重新下单中..',
  });
  Bmob.Object.destroyAll(that.data.orderinfos).then(function () {
    wx.hideLoading();
    common.showTip("重新下单成功", "success", function () {
      wx.redirectTo({
        url: '../home/home'
      })
    }, 2000);
  },
  function (error) {
    wx.hideLoading();
    common.showTip("重新下单失败", "fail", null, 2000);
    console.log(error.message);
  });

}