//app.js
var Bmob = require('utils/bmob.js')
Bmob.initialize("70dc1c250b2eeb391c9320f017c54e68", "bc2fbe2ccd7a7eb941170a8970d05d10");

App({
  onLaunch: function () {
    var user = new Bmob.User();//开始注册用户

    var oldOpenid = wx.getStorageSync('openid')
    if (!oldOpenid) {

      wx.login({
        success: function (res) {
          user.loginWithWeapp(res.code).then(function (user) {
            var openid = user.get("authData").weapp.openid;
            console.log(user, 'user', user.id, res);

            if (user.get("nickName")) {
              // 第二次访问
              console.log(user.get("nickName"), 'res.get("nickName")');

              wx.setStorageSync('openid', openid)
            } else {

              //保存用户其他信息
              wx.getUserInfo({
                success: function (result) {

                  var userInfo = result.userInfo;
                  var nickName = userInfo.nickName;
                  var avatarUrl = userInfo.avatarUrl;

                  var u = Bmob.Object.extend("_User");
                  var query = new Bmob.Query(u);
                  // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
                  query.get(user.id, {
                    success: function (result) {
                      // 自动绑定之前的账号
                      result.set('nickName', nickName);
                      result.set("userPic", avatarUrl);
                      result.set("openid", openid);
                      result.save();
                    }
                  });

                }
              });


            }

          }, function (err) {
            console.log(err, 'errr');
          });

        }
      });
    } else {
      var that = this;
      console.log("oldOpenid:" + oldOpenid);
      var u = Bmob.Object.extend("_User");
      var query = new Bmob.Query(u);
      query.equalTo("openid", oldOpenid);
      query.first({
        success: function (result) {
          console.log(result);
          var realname = result.get("realname");
          that.globalData.user = result; 
          that.globalData.realname = realname;
        }
     });
    }

   },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {

          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData: {
    userInfo: null,
    user: null,
    realname: ""
  }
})
