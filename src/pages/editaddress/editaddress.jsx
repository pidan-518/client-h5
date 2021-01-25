import Taro, { Component } from '@tarojs/taro';
import {
  View,
  Text,
  Button,
  Form,
  Input,
  Textarea,
  Switch,
  Picker,
} from '@tarojs/components';
import './editaddress.less';
import '../../common/globalstyle.less';
import servicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request';
import TaroRegionPicker from '../../components/taro-region-picker';

// 编辑地址
class EditAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      switchChecked: false, // 默认地址值
      region: '广东省-深圳市-南山区', // 所在地区选择器数据
      status: '', // 页面状态 如果是0表示修改地址
      addressInfo: '', // 修改地址的数据
      addresser: '', // 收货人姓名 从本地缓存里面获取
      telephone: '', // 收件人号码
    };
  }

  // 所在区选择器事件
  handleEegionChange = (region) => {
    this.setState({ region });
  };

  // 保存地址表单提交事件
  handleSubmitAddress = (e) => {
    e.preventDefault();
    let { consignee, phone, AddressDetails, checkAddress } = e.detail.value;
    const phoneReg = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
    if (consignee === '') {
      Taro.showModal({
        title: '提示',
        content: '您还没进行实名，请实名认证后再进行添加收货地址',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#ff5d8c',
      });
    } else if (phone === '') {
      Taro.showToast({
        title: '请输入手机号码',
        duration: 1500,
        icon: 'none',
      });
    } else if (!phoneReg.test(phone)) {
      Taro.showToast({
        title: '请输入正确手机号码',
        duration: 1500,
        icon: 'none',
      });
    } else if (AddressDetails === '') {
      Taro.showToast({
        title: '请选择填写详细地址',
        duration: 1500,
        icon: 'none',
      });
    } else {
      Taro.showLoading({
        title: '加载中...',
        success: () => {
          this.logisticsAddressUpdate(e.detail.value);
        },
      });
    }
  };

  // 删除地址按钮点击事件
  handleRemoveAddress = (e) => {
    e.preventDefault();
    if (this.state.addressInfo.inCommonUse === 1) {
      Taro.showModal({
        title: '提示',
        cancelColor: '#ff5d8c',
        confirmColor: '#ff5d8c',
        content: '该地址为默认地址，请先修改其他地址为默认地址后进行删除操作',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确认');
          } else {
            console.log('用户点击取消');
          }
        },
      });
    } else {
      Taro.showModal({
        cancelColor: '#ff5d8c',
        confirmColor: '#ff5d8c',
        title: '提示',
        content: '确认删除该地址？',
        success: (res) => {
          if (res.confirm) {
            this.logisticsAddressremove();
          } else {
            console.log('用户点击取消');
          }
        },
      });
    }
  };

  // 保存地址
  logisticsAddressUpdate(params) {
    const { addressId } = this.state;
    CarryTokenRequest(servicePath.saveOrUpdate, {
      regionPath: `${this.state.region.replace(/[-]/g, ':')}`,
      addresser: `${params.consignee}`,
      telephone: `${params.phone}`,
      inCommonUse: params.checkAddress === true ? 1 : 0,
      direction: 1,
      addressInfo: `${params.AddressDetails}`,
      userId: JSON.parse(window.sessionStorage.getItem('userinfo')).userId,
      addressId: `${addressId !== undefined ? addressId : ''}`,
    })
      .then((res) => {
        Taro.hideLoading();
        console.log('保存或修改地址成功', res.data);
        if (res.data.code === 0) {
          Taro.showToast({
            title: '保存地址成功',
            duration: 1000,
            icon: 'none',
            success: () => {
              setTimeout(() => {
                Taro.navigateBack({
                  delta: 1,
                });
              }, 1000);
            },
          });
        } else {
          Taro.showToast({
            title: '保存地址失败',
            duration: 1000,
            icon: 'none',
          });
        }
      })
      .catch((err) => {
        console.log('保存或修改地址失败', err);
      });
  }

  // 删除地址接口
  logisticsAddressremove() {
    CarryTokenRequest(servicePath.logisticsAddressRemove, {
      addressId: `${this.$router.params.addressId}`,
    })
      .then((res) => {
        console.log('删除地址成功', res.data);
        if (res.data.code === 0) {
          Taro.showToast({
            title: '删除地址成功',
            icon: 'none',
            duration: 1500,
            success: (res) => {
              setTimeout(() => {
                Taro.navigateBack({
                  delta: 1,
                });
              }, 1500);
            },
          });
        }
      })
      .catch((err) => {
        console.log('删除地址失败', err);
      });
  }

  componentWillMount() {}

  componentDidMount() {
    let getUser = window.sessionStorage.getItem('userinfo');
    if (getUser !== '') {
      this.setState({
        addresser: JSON.parse(getUser).realName,
      });
    }
    if (this.$router.params.hasOwnProperty('status')) {
      const params = this.$router.params;
      const regionSplit = decodeURI(params.region);
      this.setState({
        status: Number(params.status),
        switchChecked: Number(params.inCommonUse) === 1 ? true : false,
        region: regionSplit.replace(/[:]/g, '-'),
        telephone: params.telephone,
        addressId: params.addressId,
        addressInfo: decodeURI(params.addressInfo),
        addresser: decodeURI(params.addresser),
      });
    }
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  config = {
    navigationBarTitleText: '填写地址',
    usingComponents: {},
  };

  render() {
    const {
      switchChecked,
      region,
      addressInfo,
      addresser,
      telephone,
    } = this.state;

    return (
      <View id="editAddress">
        <Form onSubmit={this.handleSubmitAddress}>
          <View className="form-item">
            <View className="form-item-label">收货人</View>
            <Input
              className="form-item-value"
              value={addresser}
              placeholder="收货人"
              name="consignee"
            />
          </View>
          <View className="form-item">
            <View className="form-item-label">手机号码</View>
            <Input
              className="form-item-value"
              value={telephone}
              placeholder="手机号码"
              name="phone"
            />
          </View>
          {/* <View className="form-item">
            <View className="form-item-label">邮政编码</View>
            <Input className="form-item-value" value={addressInfo.postalCode}  placeholder="邮政编码" name="postalCode" />
          </View> */}
          <View className="form-item">
            <View className="form-item-label">所在地区</View>
            <TaroRegionPicker
              value={region}
              name="location"
              onGetRegion={this.handleEegionChange}
            />
          </View>
          <View className="form-item-textarea">
            <Textarea
              className="form-item-value"
              placeholder="详细地址：如道路、门牌号、小区、楼栋号、单元 室等"
              name="AddressDetails"
              value={addressInfo}
            />
          </View>
          <View className="form-switch">
            <View className="form-item-label">设置默认地址</View>
            <Switch
              style={{ zoom: '.6' }}
              color="#ff5d8c"
              checked={switchChecked}
              name="checkAddress"
            />
          </View>
          <View className="form-submit-btn">
            {this.state.status !== '' ? (
              <Button className="remove" onClick={this.handleRemoveAddress}>
                删除地址
              </Button>
            ) : null}
            <Button formType="submit">保存地址</Button>
          </View>
        </Form>
      </View>
    );
  }
}

export default EditAddress;
