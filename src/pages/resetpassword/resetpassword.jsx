import Taro, { Component } from '@tarojs/taro'
import { View, Text, Form, Input, Button } from '@tarojs/components'
import './resetpassword.less'
import { postRequest, CarryTokenRequest } from '../../common/util/request'
import servicePath from "../../common/util/api/apiUrl";

class ResetPassword extends Component {

  state = {
    isDisabled: false, // 禁用发送验证码按钮
    btnTxt: "获取验证码", // 发送验证码按钮text
    timer: "", // 验证码定时器
    phoneVal: "", // 手机号
    codeImg: "", // 图形验证码
    imgCodeVal: "", // 图片验证码输入框的值
    openId: "", // 传到后台的openId
    uuid: "",
  }

  // 手机号输入框输入事件
  handlePhoneVal = (e) => {
    this.setState({
      phoneVal: e.target.value
    })
  }

  // 获取验证码按钮点击事件
  handleVerCode = (e) => {
    e.preventDefault();
    const phoneReg = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[0-9])\d{8}$/;
    if (this.state.phoneVal === "") {
      Taro.showToast({
        title: "请输入手机号",
        duration: 1000,
        icon: 'none'
      })
    } else if (!phoneReg.test(this.state.phoneVal)) {
      Taro.showToast({
        title: "请输入正确的手机号",
        duration: 2000,
        icon: 'none'
      })
    } else if (this.state.imgCodeVal === "") {
      Taro.showToast({
        title: "请输入图形验证码",
        duration: 2000,
        icon: 'none'
      })
    } else {
      this.getSendSmsCode();
    }
  }

  // 图形验证码输入框
  handleImgCodeVal = (e) => {
    this.setState({
      imgCodeVal: e.detail.value
    })
  }

  // 表单提交事件
  handleSubmit = e => {
    const { confirmPassword, password, phone, verCode, imgCodeVal } = e.detail.value;
    const phoneReg = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[0-9])\d{8}$/;
    if (phone === "") {
      Taro.showToast({
        title: "请输入手机号",
        duration: 1000,
        icon: "none"
      })
      return false;
    } else if (!phoneReg.test(phone)) {
      Taro.showToast({
        title: "请输入正确的手机号",
        duration: 1000,
        icon: "none"
      });
      return false;
    } else if (imgCodeVal === "") {
      Taro.showToast({
        title: "请输入图形验证码",
        duration: 1000,
        icon: "none"
      });
      return false
    } else if (verCode === "") {
      Taro.showToast({
        title: "请输入验证码",
        duration: 1000,
        icon: "none"
      });
      return false
    } else if (password === "") {
      Taro.showToast({
        title: "请输入密码",
        duration: 1000,
        icon: "none"
      });
      return false;
    } else if (confirmPassword !== password) {
      Taro.showToast({
        title: "两次密码不一致",
        duration: 1000,
        icon: "none"
      });
      return false;
    } else {
      let uuid = this.getCookie('uid');
      const postData = {
        mobile: `${phone}`,
        smsCode: `${verCode}`,
        password: `${password}`,
        code: `${imgCodeVal}`,
        confirmPassword: `${confirmPassword}`,
        type: 2,
        deviceNo: uuid
      }
      Taro.showLoading({
        title: "加载中...",
        mask: true,
        success: () => {
          this.getResetPassword(postData);
        }
      });
    }
  }

  // 图形验证码点击事件
  CodeImgClick = () => {
    this.getPaplVerCode();
  }

  // 设置获取验证码按钮禁用
  setBtnDisabled() {
    this.setState({
      isDisabled: true,
    });
    let time = 60;
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.timer = setInterval(() => {
      time--;
      this.setState({
        btnTxt: `${time} s`,
      });
      if (time === 0) {
        clearInterval(this.state.timer);
        this.setState({
          btnTxt: "获取验证码",
          isDisabled: false,
        });
      }
    }, 1000);
  }

  // 修改密码请求
  getResetPassword(postData) {
    postRequest(servicePath.resetPassword, postData)
      .then(res => {
        console.log("修改密码成功", res.data);
        Taro.hideLoading();
        if (res.data.code === 0) {
          Taro.showToast({
            title: res.data.data,
            duration: 1500,
            icon: 'none',
            success: res => {
              setTimeout(() => {
                Taro.navigateBack({
                  delta: 1
                })
              }, 1500);
            }
          });
        } else {
          Taro.showToast({
            title: res.data.msg,
            duration: 1500,
            icon: 'none'
          });
        }
      })
      .catch(err => {
        Taro.hideLoading();
        console.log("返回数据失败", err);
      })
  }

  // 发送验证码
  getSendSmsCode() {
    let uuid = this.getCookie('uid');
    const postData = {
      mobile: `${this.state.phoneVal}`,
      code: `${this.state.imgCodeVal}`,
      type: 2,
      deviceNo: uuid
    };
    postRequest(servicePath.sendSmsCode, postData)
      .then((res) => {
        console.log("返回数据成功", res.data);
        if (res.data.code === 0) {
          this.setBtnDisabled();
        } else {
          Taro.showToast({ title: res.data.msg, icon: 'none', duration: 1000 });
          this.getPaplVerCode();
        }
      })
      .catch((err) => {
        console.log("返回数据失败", err);
      });
  }

  // 获取图形验证码
  getPaplVerCode() {
    let uuid = this.getCookie('uid');
    postRequest(servicePath.VerCode, {
      deviceNo: uuid
    })
      .then(res => {
        console.log("获取图形验证码成功", res.data);
        if (res.data.code === 0) {
          this.setState({
            codeImg: res.data.data.img
          })
        }
      })
      .catch(err => {
        console.log("获取图形验证码失败", err);
      })
  }

  // 生成guid
  generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      // eslint-disable-next-line eqeqeq
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    this.setState({ uuid });
    return uuid;
  };

  getCookie(name) {
    var prefix = name + "="
    var start = document.cookie.indexOf(prefix)

    if (start === -1) {
      return null;
    }

    var end = document.cookie.indexOf(";", start + prefix.length)
    if (end === -1) {
      end = document.cookie.length;
    }

    var value = document.cookie.substring(start + prefix.length, end)
    return unescape(value);
  }

  componentDidMount () {
    if (document.cookie === '') {
      document.cookie = "uid=" + this.generateUUID(); 
      this.getPaplVerCode();
    } else {
      const uuid = this.getCookie('uid');
      this.setState({ 
        uuid 
      }, () => {
        this.getPaplVerCode();
      });
    }
  }

  componentDidShow() {
  }

  config = {
    navigationBarTitleText: '忘记密码',
    usingComponents: {}
  }

  render () {

    const { isDisabled, btnTxt, codeImg } = this.state

    return (
      <View id='resetpassword'>
        <View className="resetpassword-title">请填写以下信息</View>
        <View className="resetpasw-form">
          <Form onSubmit={this.handleSubmit}>
            <View className="form-item">
              <View className="form-item-title">
                <img className="item-icon" src={require("../../static/register/phone-icon.png")} />
                <Text>手机号码</Text>
              </View>
              <View className="form-item-input">
                <Input name="phone" type="text" onInput={ this.handlePhoneVal } placeholder="请输入您的手机号码" />
              </View>
            </View>
            <View className="form-item">
              <View className="form-item-title">
                <img className="item-icon" src={require("../../static/register/vercode-icon.png")} />
                <Text>图形验证码</Text>
              </View>
              <View className="form-item-input">
                <Input 
                  className="verCode-input" 
                  onInput={ this.handleImgCodeVal } 
                  name="imgCodeVal" 
                  type="text" 
                  placeholder="请输入图片上的结果" 
                />
                <img onClick={this.CodeImgClick} src={ codeImg } />
              </View>
            </View>
            <View className="form-item">
              <View className="form-item-title">
                <img className="item-icon" src={require("../../static/register/vercode-icon.png")} />
                <Text>验证码</Text>
              </View>
              <View className="form-item-input">
                <Input className="verCode-input" maxLength="8" name="verCode" type="text" placeholder="请输入您收到验证码" />
              </View>
              <View className="ver-code-btn">
                <Button disabled={isDisabled} onClick={this.handleVerCode}>{btnTxt}</Button>
              </View>
            </View>
            <View className="form-item">
              <View className="form-item-title">
                <img className="item-icon" src={require("../../static/register/password-icon.png")} />
                <Text>请输入新密码</Text>
              </View>
              <View className="form-item-input">
                <Input name="password" type="password" placeholder="请设置您的密码" />
              </View>
            </View>
            <View className="form-item">
              <View className="form-item-title">
                <img className="item-icon" src={require("../../static/register/password-icon.png")} />
                <Text>请输入确认密码</Text>
              </View>
              <View className="form-item-input">
                <Input name="confirmPassword" type="password" placeholder="请设置您的密码" />
              </View>
            </View>
            <View className="form-item-btn">
              <Button className="form-btn" formType="submit">完成</Button>
            </View>
          </Form>
        </View>
      </View>
    )
  }
}

export default ResetPassword;