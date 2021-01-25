import Taro, { Component, getCurrentPages } from '@tarojs/taro'
import { View, Text, Image, Form, Input, Button, Navigator } from '@tarojs/components'
import './login.less'
import "../../common/globalstyle.less"
import servicePath from '../../common/util/api/apiUrl';
import { postRequest, CarryTokenRequest } from '../../common/util/request';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openId: 0,  //用户openId
    }
  }

  // 密码输入框失去焦点事件
  handleInputBlur = (e) => {
    e.preventDefault();
    /* document.body.scrollTop = 0;
    console.log(document.body.scrollTop); */
    window.scrollTo(0, 0);
  }

  // 登录表单提交事件
  handleLoginSubmit = (e) => {
    const phoneReg = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[0-9])\d{8}$/;
    if (e.detail.value.phone === "") {
      Taro.showToast({
        title: "请输入手机号",
        duration: 1500,
        icon: 'none'
      })
      return false;
    } else if (!phoneReg.test(e.detail.value.phone)) {
      Taro.showToast({
        title: "请输入正确的手机号",
        duration: 1500,
        icon: 'none'
      })
      return false;
    } else if (e.detail.value.password === "") {
      Taro.showToast({
        title: "请输入密码",
        duration: 1500,
        icon: 'none'
      });
      return false;
    } else {
      const postData = {
        loginName: `${e.detail.value.phone}`,
        password: `${e.detail.value.password}`,
        /* source: 'smallRoutine' */
      };
      this.getLogin(postData);
    }
  }

  // 登录接口
  getLogin(params) {
    Taro.request({
      url: servicePath.Login,
      data: JSON.stringify(params),
      method: "POST",
      header: {
        'Content-Type': 'application/json',
      },
      success: (res) => {
        console.log("登录返回数据成功", res.data);
        if (res.data.code === 0) {
          window.sessionStorage.setItem("JWT-Token", res.header["jwt-token"])
          this.getUserInfo();
          this.getMyRecommondCode()
          this.updateRecommendCode()
          Taro.showToast({
            title: "登录成功",
            duration: 1500,
            icon: 'success',
            success: toastRes => {
              let pages = getCurrentPages();
              const prevPage = pages[pages.length - 2];
              try {
                if (prevPage.props.location.path === "/pages/register/register" || prevPage.props.location.path === "/pages/resetpassword/resetpassword") {
                  setTimeout(() => {
                    Taro.redirectTo({
                      url: "/pages/person/person"
                    })
                  }, 1500);
                } else {
                  setTimeout(() => {
                    Taro.navigateBack({
                      delta: 1,
                    });
                  }, 1500);
                }
              } catch (error) {
                setTimeout(() => {
                  Taro.redirectTo({
                    url: "/pages/person/person"
                  })
                }, 1500);
              }
            }
          })
        } else {
          Taro.showToast({
            title: res.data.msg,
            duration: 1500,
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.log("登录接口异常", err);
      }
    })
  }

  // 获取用户信息
  getUserInfo() {
    CarryTokenRequest(servicePath.getUserInfo, "")
      .then(res => {
        console.log("获取用户信息成功", res.data);
        if (res.data.code === 0) {
          res.data.data.mobile = res.data.data.mobile.replace(
            /^(\d{3})\d{4}(\d+)/,
            "$1****$2"
          );
          window.sessionStorage.setItem('userinfo', JSON.stringify(res.data.data));
          Taro.setStorage({
            key: 'accid',
            data: res.data.data.accid, //IM帐号
          });
          Taro.setStorage({
            key: 'netToken',
            data: res.data.data.netToken, //IMtoken
          });
        }
      })
      .catch(err => {
        console.log("获取用户信息失败", err);
      })
  }

  //获取我的推荐码
  getMyRecommondCode = () => {
    CarryTokenRequest(servicePath.getMyRecommondCode)
      .then(res => {
        if (res.data.code === 0) {
          window.sessionStorage.setItem('shareRecommend', res.data.data)
        }
      })
  }

  //更新绑定推荐码
  updateRecommendCode = () => {
    const registerRecommend = window.sessionStorage.getItem('registerRecommend')
    const recommendTime = JSON.parse(window.sessionStorage.getItem('recommendTime') || 'null')
    const postData = {
      recommend: registerRecommend,
      recommendTime
    }
    CarryTokenRequest(servicePath.updateRecommendCode, postData)
  }

  componentDidMount () {
  }

  config = {
    navigationBarTitleText: '登录',
  }

  render () {
    return (
      <View id='login'>
        <View className="login-bg">
          <Image src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/login/register-bg.png" />
        </View>
        <View className="login-form">
          <Form onSubmit={ this.handleLoginSubmit }>
            <View className="form-item">
              <Image className="form-item-icon" src={require("../../static/login/account-num.png")} />
              <View className="form-item-input">
                <Input name="phone" type="text" placeholder="请输入手机号码" />
              </View>
            </View>
            <View className="form-item">
              <Image className="form-item-icon" src={require("../../static/login/password.png")} />
              <View className="form-item-input">
                <Input name="password" onBlur={this.handleInputBlur} type="password" placeholder="请输入密码" />
              </View>
            </View>
            <View className="form-submit-btn">
              <Button formType="submit">登录</Button>
              <View className="login-links">
                <Navigator url="/pages/register/register">注册</Navigator>
                <Navigator url="/pages/resetpassword/resetpassword">忘记密码</Navigator>
              </View>
            </View>
          </Form>
        </View>
      </View>
    )
  }
}

export default Login;