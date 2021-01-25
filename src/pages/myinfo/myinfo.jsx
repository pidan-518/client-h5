import Taro, { Component } from '@tarojs/taro'
import { View, Input, Form, Picker, Button, Image } from '@tarojs/components'
import '../../common/globalstyle.less'
import './myinfo.less';
import servicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request';
import Navigation from '../../components/Navigation/Navigation';

class MyInfo extends Component {

  state = {
    headImg: "", // 头像
    otherHeadImg: '', // 传给后台的头像
    nickName: "", // 昵称
    gender: ['男', '女'], // 性别选择器
    genderIndex: 0, // 性别选择器选择后的数据
    /* livePlace: ['广东省', '深圳市', '南山区'], // 现居住地展示数据
    bornPlace: ['广东省', '深圳市', '南山区'], // 身份证地区展示数据 */
    myInfo: {}, // 我的信息数据
    openId: null, //绑定微信标识
  }

  // 头像点击事件
  ChangeAvatar = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: res => {
        let tempFilePaths = res.tempFilePaths;
        Taro.showLoading({ title: "上传中..." });
        Taro.uploadFile({
          url: servicePath.uploadUserHeadImage,
          filePath: tempFilePaths[0],
          name: "file",
          fileName: res.tempFiles[0].originalFileObj.name,
          header: {
            /* "Content-Type": "multipart/form-data;", */
            'JWT-Token': window.sessionStorage.getItem("JWT-Token")
          },
          success: response => {
            console.log(response);
            const data = JSON.parse(response.data);
            if (data.code === 0) {
              this.setState({
                headImg: tempFilePaths[0],
                otherHeadImg: data.data
              }, () => {
                Taro.hideLoading();
              })
            } else {
              Taro.showToast({
                title: "上传失败，稍后重试",
                icon: 'none',
                duration: 1000,
              });
            }
          },
          fail: err => {
            console.log(err);
          }
        })
      }
    })
  }

  // 昵称输入框事件
  handleNickNameInput = (e) => {
    this.setState({
      nickName: e.detail.value
    });
  }

  // 性别选择器事件
  handleGenderSelector(e) {
    e.preventDefault();
    this.setState({
      genderIndex: Number(e.detail.value)
    })
  }

  // 性别选择器确定事件
  handleGenderCancel(e) {
    e.preventDefault();
    console.log("进入", e);
  }

  // 保存信息提交事件
  handleSubmitMyinfo = (e) => {
    e.preventDefault();
    Taro.showLoading({
      title: '加载中...',
      success: () => {
        this.getSaveBaseInfo(e.detail.value);
      }
    })
  }

  // 修改密码点击事件
  handleResetPassword = (e) => {
    e.preventDefault();
    Taro.navigateTo({
      url: "/pages/resetpassword/resetpassword"
    })
  }

  // 退出登录按钮点击事件
  handleSignOut = (e) => {
    e.preventDefault();
    CarryTokenRequest(servicePath.Logout)
      .then(res => {
        console.log('退出成功', res.data);
        if (res.data.code === 0) {
          window.sessionStorage.removeItem('userinfo');
          window.sessionStorage.removeItem('JWT-Token');
          Taro.showToast({
            title: '退出登录成功',
            icon: 'none',
            duration: 1500,
            success: (res) => {
              setTimeout(() => {
                Taro.navigateBack({
                  delta: 1
                });
              }, 1500);
            }
          })
        }
      })
      .catch(err => {
        console.log('退出失败', err);
      })
  }

  // 更新个人信息
  getSaveBaseInfo(params) {
    let nickName = params.nickName !== "" ? params.nickName : this.state.myInfo.mobile;
    const postData = {
      // liveAddressPath: params.livePlace.join(':'),
      // bornAddressPath: params.bornPlace.join(':'),
      sex: parseInt(params.gender) === 0 ? 1 : 2,
      headPic: this.state.otherHeadImg,
      nickName: `${nickName}`,
    };
    CarryTokenRequest(servicePath.saveBaseInfo, postData)
      .then((res) => {
        console.log("保存个人信息成功", res.data);
        Taro.hideLoading();
        if (res.data.code === 0) {
          const getUser = JSON.parse(window.sessionStorage.getItem('userinfo'));
          getUser.nickName = nickName;
          getUser.sex = parseInt(params.gender) === 0 ? 1 : 2;
          // getUser.liveAddressPath = params.livePlace.join(':');
          // getUser.bornAddressPath = params.bornPlace.join(':');
          getUser.headPic = this.state.headImg;
          window.sessionStorage.setItem('userinfo', JSON.stringify(getUser));
          Taro.showToast({
            title: '保存个人信息成功',
            icon: 'none',
            duration: 1000,
            success: () => {
              setTimeout(() => {
                Taro.navigateBack({
                  delta: 1
                });
              }, 1500)
            }
          });
        } else {
          Taro.showToast({
            title: '保存个人信息失败',
            icon: 'none',
            duration: 1000,
          });
        }
      })
      .catch((err) => {
        Taro.hideLoading();
        Taro.showToast({
          title: '保存个人信息失败',
          icon: 'none',
          duration: 1000,
        });
        console.log("更新个人信息失败", err);
      });
  }

  componentWillMount () { }

  componentDidMount () {  
  }

  componentDidShow () {
    let getUser = window.sessionStorage.getItem('userinfo') || "";
    if (getUser !== '') {
      getUser = JSON.parse(getUser);
      let { headPic, sex } = getUser;
      let genderIndex = sex === 1 ? 0 : 1;
      this.setState({ 
        myInfo: getUser,
        genderIndex,
        // livePlace,
        // bornPlace,
        headImg: headPic,
        otherHeadImg: headPic,
        nickName: getUser.nickName !== null ? getUser.nickName : getUser.mobile
      });
    } else {
      this.setState({
        genderIndex: ""
      })
    }
  }


  config = {
    navigationBarTitleText: '我的信息',
    usingComponents: {}
  }

  render () {

    const { 
      gender, 
      genderIndex,
      // livePlace,
      // bornPlace,
      headImg,
      myInfo,
      nickName
    } = this.state;

    return (
      <View>
        <View id="my-info">
          <View id="my-head" onClick={this.ChangeAvatar}>
            <Image className="my-head-img" src={headImg} />
            <View className="my-head-txt">更换头像</View>
          </View>
          <View id="my-info-form">
            <Form onSubmit={this.handleSubmitMyinfo}>
              <View className="my-info-item">
                <View className="item-label">昵称</View>
                <View className="item-value">
                  <Input 
                    name="nickName" 
                    value={nickName} 
                    onInput={this.handleNickNameInput} 
                  />
                </View>
              </View>
              <View className="my-info-item">
                <View className="item-label">真实姓名</View>
                <View className="item-value">
                  <Input name="realName" disabled={true} value={myInfo.realName} />
                </View>
              </View>
              <View className="my-info-item">
                <View className="item-label">性别</View>
                <View className="item-value">
                  <Picker 
                    name="gender" 
                    range={gender} 
                    value={genderIndex}
                    mode="selector" 
                    onChange={this.handleGenderSelector.bind(this)} 
                    onCancel={this.handleGenderCancel.bind(this)}
                  >
                    <View className="gender">{gender[genderIndex]}</View>
                  </Picker>
                </View>
              </View>
              {/* <Button 
                className="bindWeChat my-info-item" 
                style={{display: openId===null?'':'none'}}
                onClick={this.bindWeChat}
              >
                绑定微信号
              </Button>
              <Button 
                className="unbindWeChat my-info-item" 
                style={{display: openId!==null?'':'none'}}
                onClick={this.unBindWeChat}
              >
                解除绑定微信号
              </Button> */}
              {/* <View className="my-info-item">
                <View className="item-label">居住地</View>
                <View className="item-value">
                  <Picker name="livePlace" value={livePlace} mode="region" onChange={this.handleLivePlaceSelector}>
                    <View className="place">{`${livePlace[0]}${livePlace[1]}${livePlace[2]}`}</View>
                  </Picker>
                </View>
              </View>
              <View className="my-info-item">
                <View className="item-label">家乡</View>
                <View className="item-value">
                  <Picker name="bornPlace" value={bornPlace} mode="region" onChange={this.handleBornPlaceSelector}>
                    <View className="place">{`${bornPlace[0]}${bornPlace[1]}${bornPlace[2]}`}</View>
                  </Picker>
                </View>
              </View> */}
              <View className="form-submit-btn">
                <Button formType="submit">保存信息</Button>
                <View className="operation">
                  <Button className="modify-password" onClick={this.handleResetPassword}>修改密码</Button>
                  <Button className="sign-out-btn" onClick={this.handleSignOut}>退出登录</Button>
                </View>
              </View>
            </Form>
          </View>
        </View>
        {/* <View className="operation">
          <Button className="modify-password">修改密码</Button>
          <Button className="sign-out-btn" onClick={this.handleSignOut}>退出登录</Button>
        </View> */}
      </View>
    )
  }
}

export default MyInfo;