import Taro, { Component, getStorage } from '@tarojs/taro';
import { View, Text, Input , Image, Button, Form } from '@tarojs/components';
import ServicePath  from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request';
import '../../common/globalstyle.less';
import './bindwechat.less';

export default class BindWeChat extends Component {

  constructor(props) {
    super(props);
    this.state = {
      openId: 0, //用户openId
      imgCodeUrl: '', //图形验证码图片
      phone: '', //填写手机号
      imgCode: '', //填写图形码
      phoneCode: 0, //填写手机验证码
      sendText: '获取验证码', //按钮文字
      allowSendCode: true, //是否允许获取验证码（是否冷却中）
      sendTiming: 0, //获取倒计时
      nickName: '', //用户昵称
      headPic: 0, //头像图片地址
      sex: 0, //性别  1：男 2：女 3：其他
    }

  }


  //综合获取openId,成功后获取一次图形验证码
  getOpenId = () => {

    //使用code获取openId
    const getWechatJsAppOpenId = (code) => {
      let openId = 0;
      const postData = {
        'code': code
      };
      CarryTokenRequest(ServicePath.getWechatJsAppOpenId, postData)
        .then(res => {
          if (res.data.code === 0) {
            openId = res.data.data.openId;
            Taro.setStorage({
              key: 'openId',
              data: openId,
            });
            this.setState({ openId }, () => {
              this.getWechatBindCode(openId);
            })
          }
        })   
    }    

    let openId = Taro.getStorageSync('openId');
    if (openId) {
      this.setState({ openId }, () => {
        this.getWechatBindCode(openId);
      })
    } else {
      Taro.login({
        success: function (res) {
          if (res.code) {
            getWechatJsAppOpenId(res.code);
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    }
  }

  //获取图形验证码
  getWechatBindCode = () => {
    const postData = {
      openId: this.state.openId
    };
    CarryTokenRequest(ServicePath.wechatBindCode, postData)
      .then(res => {
        if (res.data.code === 0) {
          this.setState({
            imgCodeUrl: res.data.data.img
          })
        }
      })    
  }

  //填写手机号事件
  handleInputPhone = (e) => {
    this.setState({
      phone: e.target.value
    })
  }

  //填写图形验证码事件
  handleInputImgCode = (e) => {
    this.setState({
      imgCode: e.target.value
    })
  }

  //发送绑定微信短信验证码
  sendBindSmsCode = (phone, imgCode) => {
    const postData = {
      mobile: phone,
      code: imgCode,
      openId: this.state.openId,
    };
    CarryTokenRequest(ServicePath.sendBindSmsCode, postData)
      .then(res => {
        if (res.data.code === 0) {
          this.setState({
            sendText: `已发送(60s)`,
            allowSendCode: false,
            sendTiming: 60,
          }, this.sendCodeTiming())
        }
      })
  }

  //获取验证码倒计时
  sendCodeTiming = () => {
    this.sendTiming = setInterval(() => {
      this.setState({
        sendTiming: this.state.sendTiming - 1,
        sendText: `已发送(${this.state.sendTiming}s)`
      });
      if (this.state.sendTiming === 1) {
        clearInterval(this.sendTiming);
        setTimeout(() => {
          this.setState({
            sendText: '获取验证码',
            allowSendCode: true,
          })
        }, 1000);
      }
    }, 1000);
  }

  //获取短信验证码事件
  handleSmsCode = () => {
    if (this.state.phone === '') {
      Taro.showToast({
        title: "请输入手机号",
        duration: 2000,
        icon: 'none'
      });      
    } else if (this.state.imgCode === '') {
      Taro.showToast({
        title: "请输入图形验证码",
        duration: 2000,
        icon: 'none'
      });      
    } else {
      this.sendBindSmsCode(this.state.phone, this.state.imgCode)
    }
  }

  //提交验证事件
  handleSubmit = (e) => {
    const value = e.detail.value;
    if (value.phone === '') {
      Taro.showToast({
        title: "请输入手机号",
        duration: 2000,
        icon: 'none'
      });
      return false;
    } else if (value.phoneCode === '') {
      Taro.showToast({
        title: "请输入手机验证码",
        duration: 2000,
        icon: 'none'
      });
      return false;
    } else {
      const postData = {
        mobile: value.phone,
        smsCode: value.phoneCode,
        openId: this.state.openId,
        nickName: this.state.nickName,
        headPic: this.state.headPic, 
        sex: this.state.sex, 
      };
      this.bindWeChat(postData);
    }
  }

  //绑定微信号
  bindWeChat = (postData) => {
    CarryTokenRequest(ServicePath.bindWechat, postData)
      .then(res => {
        if (res.data.code === 0) {
          Taro.showToast({
            title: '绑定成功,返回登录页后请重新点击微信登录',
            duration: 3000,
            complete() {
              setTimeout(() => {
                Taro.navigateBack({
                delta: 1
                })                    
              }, 3000);  
            }            
          });
        } else {
          Taro.showToast({
            title: res.data.msg,
            duration: 2000,
            icon: 'none'
          })
        }
      })
  }

  //获取用户信息
  getWeChatUserInfo = () => {
    const setState = this.setState.bind(this);
    const t = this;
    Taro.getUserInfo({
      success: function(res) {
        setState({
          nickName: res.userInfo.nickName, 
          headPic: res.userInfo.avatarUrl, 
          sex: res.userInfo.gender,
        }, () => {
          console.log(t.state, 'state')
        })
      }
    })
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '绑定微信'
    })

    this.getOpenId();
    this.getWeChatUserInfo();

  }
  
  render() {

    const { imgCodeUrl, sendText, allowSendCode } = this.state;

    return(
      <View className="bindWeChat">
        
        <Text className="title">请填写以下验证信息</Text>

        <Form onSubmit={this.handleSubmit}>
          <View className="item_list">

            <View className="item phone">
              <Text className="item_desc">手机号：</Text>
              <Input className="value" name="phone" placeholder='请输入手机号' onInput={this.handleInputPhone} />
            </View>

            <View className="item imgCode">
              <Text className="item_desc">验证码：</Text>
              <Input className="value" name="imgCode" placeholder='请输入图形验证码' onInput={this.handleInputImgCode} />
              <Image src={imgCodeUrl} onClick={this.getWechatBindCode} />
            </View>

            <View className="item phoneCode">
              <Text className="item_desc">手机验证码：</Text>
              <Input className={`value ${allowSendCode===false?'disable':''}`} name="phoneCode" placeholder='请输入手机验证码' />
              <Button 
                className={allowSendCode===false?'disable':''} 
                onClick={this.handleSmsCode}
                disabled={allowSendCode===true?'':'disabled'}
              >
                {sendText}
              </Button>
            </View>

          </View>

          <Button formType="submit" className="submit">绑定微信</Button>
          {/* <Button openType="getUserInfo" onGetUserInfo={this.handleGetUserInfo}>获取</Button> */}
        </Form>
        
      </View>
    )
  }
}