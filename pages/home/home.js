// home.js
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var util = require('../../utils/util.js');
var app = getApp();
var that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    foodsList:[],
    cart: {
      count: 0,
      total: 0,
      list: {}
    },
    showCartDetail: false
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
    getFoodList(this);
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

  showCartDetail: function () {
    this.setData({
      showCartDetail: !this.data.showCartDetail
    });
  },
  hideCartDetail: function () {
    this.setData({
      showCartDetail: false
    });
  },
  
  tapAddCart: function (e) {
    console.log(e);
    this.addCart(e.currentTarget.dataset.foodid);
  },
  tapReduceCart: function (e) {
    this.reduceCart(e.currentTarget.dataset.foodid);
  },
  addCart: function (id) {
    console.log(id);
    var num = this.data.cart.list[id] || 0;
    this.data.cart.list[id] = num + 1;
    this.countCart();
  },
  reduceCart: function (id) {
    var num = this.data.cart.list[id] || 0;
    if (num <= 1) {
      delete this.data.cart.list[id];
    } else {
      this.data.cart.list[id] = num - 1;
    }
    this.countCart();
  },
  countCart: function () {
    var count = 0,
      total = 0;
    console.log(this.data.cart);
    for (var id in this.data.cart.list) {
      var foods = this.data.foodsList[id];
      count += this.data.cart.list[id];
      total += foods.attributes.price * this.data.cart.list[id];
    }
    this.data.cart.count = count;
    this.data.cart.total = total;
    this.setData({
      cart: this.data.cart
    });
  },

  submit: function() {
    var content = "您选择的是：\n";
    for (var id in this.data.cart.list) {
      var foods = this.data.foodsList[id];
      var num = this.data.cart.list[id];
      content += "品名：" + foods.attributes.foodname + " 单价：" + foods.attributes.price + "¥  数量：" + num + "\n";
    }
    content += "共计" + this.data.cart.total + "元";
    var that = this;
    wx.showModal({
      title: "确认订单",
      content: content,
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          submitOrder(that);
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})


  /*
   * 获取数据
   */
function getFoodList(t) {
  that = t;
  var FoodInfo = Bmob.Object.extend("FoodInfo");
  var query = new Bmob.Query(FoodInfo);
 
  query.ascending('foodid');
  // 查询所有数据
  query.limit(that.data.limit);
  query.find({
    success: function (results) {
      // 循环处理查询到的数据
      console.log(results);
      that.setData({
        foodsList: results
      })
    },
    error: function (error) {
      console.log("查询失败: " + error.code + " " + error.message);
    }
  });
}


/*
 * 获取数据
 */
function submitOrder(t) {
  wx.showLoading({
    title: '提交订单中',
  });
  that = t;
  var OrderInfo = Bmob.Object.extend("OrderInfo");
  var realname = wx.getStorageSync('realname');
  var openid = wx.getStorageSync('openid');
  var orderday = util.getNowDate();
  var orders = [];
  for (var id in that.data.cart.list) {
    var foods = that.data.foodsList[id];
    var num = that.data.cart.list[id];
   
    var orderinfo = new OrderInfo();
    orderinfo.set("realname", realname);
    orderinfo.set("openid", openid);
    orderinfo.set("foodid", parseInt(id));
    orderinfo.set("orderday", orderday);
    orderinfo.set("foodname", foods.attributes.foodname);
    orderinfo.set("foodprice", foods.attributes.price);
    orderinfo.set("foodnumber", num);
    orders.push(orderinfo);
  }
  Bmob.Object.saveAll(orders).then(function (objects) {
    wx.hideLoading();
    common.showTip("下单成功","success", function(){
      wx.redirectTo({
        url: '../order/order'
      })
    }, 2000);
  },
  function (error) {
    wx.hideLoading();
    common.showTip("下单失败", "fail", null, 2000);
    console.log(error.message);
  });
}