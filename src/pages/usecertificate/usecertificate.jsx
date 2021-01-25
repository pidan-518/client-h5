import Taro, { Component, getCurrentPages } from '@tarojs/taro';
import {
  View,
  Text,
  Button,
  Label,
  CheckboxGroup,
  Checkbox,
} from '@tarojs/components';
import './usecertificate.less';
import '../../common/globalstyle.less';
import { CarryTokenRequest } from '../../common/util/request';
import servicePath from '../../common/util/api/apiUrl';
import Navigation from '../../components/Navigation/Navigation';

// 使用优惠券
class UseCertificate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      couponList: [], // 优惠券列表
      fullCoupon:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/coupone3.png', // 满减券
      discountCoupon:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/coupone2.png', // 折扣券
      deductionCoupon:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/coupone1.png', // 抵扣券
      couponRecordIds: [], // 传给后台的优惠券id
      orderData: '', // 订单数据
      fdId: '', // 满减券或折扣券id
      deductId: '', // 抵扣券id
      sureUse: '',
    };
  }

  // 优惠券checkbox事件
  checkboxChange = (e) => {
    e.checked = !e.checked;
    const { couponList } = this.state;
    if (e.checked === true) {
      couponList.map((item) => {
        if (e.couponType === item.couponType) {
          if (e.couponRecordId === item.couponRecordId) {
            item.disabled = false;
          } else {
            item.disabled = true;
          }
        } else {
          if (item.couponType === 1 && item.canUse === 0) {
            item.disabled = true;
          }

          if (e.couponType === 3 && item.couponType === 1) {
            item.disabled = true;
          } else if (e.couponType === 1 && item.couponType === 3) {
            item.disabled = true;
          }
        }
        return item;
      });
    } else {
      couponList.map((item) => {
        if (e.couponType === item.couponType) {
          item.disabled = false;
        }

        if (e.couponType === 3 && item.couponType === 1) {
          item.disabled = false;
        } else if (e.couponType === 1 && item.couponType === 3) {
          item.disabled = false;
        }

        if (item.couponType === 1 && item.canUse === 0) {
          item.disabled = true;
        }

        return item;
      });
    }

    this.setState({
      couponList,
    });
  };

  // 取消按钮点击事件
  handleCancel = () => {
    Taro.removeStorage({
      key: 'couponRecordIds',
      success: (res) => {
        this.cancelUseConpon();
      },
    });
  };

  // 完成按钮点击事件
  handleComplete = () => {
    const couponList = this.state.couponList;
    let couponRecordIds = [];
    couponList.map((item) => {
      if (item.checked === true) {
        couponRecordIds.push(item.couponRecordId);
      }
    });
    this.setState(
      {
        couponRecordIds,
      },
      () => {
        this.reCalculateFee();
      }
    );
  };

  // 获取可使用优惠券
  getUseCouponList() {
    CarryTokenRequest(servicePath.getUserCouponList, {
      orderNo: this.$router.params.orderId,
      len: 10,
      source: 10,
    })
      .then((res) => {
        console.log('获取优惠券成功', res.data);
        if (res.data.code === 0) {
          let couponRecordIds = [];
          let couponTypes = [];
          res.data.data.forEach((item) => {
            if (item.used === 1) {
              couponRecordIds.push(item.couponRecordId);
              couponTypes.push(item.couponType);
            }
          });
          let data = res.data.data.map((item) => {
            item.checked = false;
            if (item.used === 1) {
              item.checked = true;
              item.disabled = false;
            } else {
              item.disabled = true;
              if (couponRecordIds.includes(item.couponRecordId)) {
                item.disabled = false;
              } else {
                if (couponRecordIds.length !== 0) {
                  item.disabled = true;
                } else {
                  item.disabled = false;
                }
              }

              if (couponTypes.includes(item.couponType)) {
                item.disabled = true;
              } else {
                item.disabled = false;

                if (couponTypes.includes(1) && item.couponType === 3) {
                  item.disabled = true;
                } else if (couponTypes.includes(3) && item.couponType === 1) {
                  item.disabled = true;
                }

                if (item.canUse === 0) {
                  item.disabled = true;
                }
              }
            }
            return item;
          });
          this.setState({
            couponList: data,
            couponRecordIds,
          });
        }
      })
      .catch((err) => {
        console.log('获取优惠券失败', err);
      });
  }

  // 重新计算使用优惠券的费用
  reCalculateFee() {
    CarryTokenRequest(servicePath.reCalculateFee, {
      couponRecordIds: this.state.couponRecordIds,
      orderNo: this.$router.params.orderId,
      source: 10,
    })
      .then((res) => {
        console.log('使用优惠卷成功', res.data);
        if (res.data.code === 0) {
          this.setState(
            {
              orderData: res.data.data,
            },
            () => {
              Taro.navigateBack({
                delta: 1,
              });
            }
          );
        } else {
          Taro.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000,
          });
        }
      })
      .catch((err) => {
        console.log('使用优惠卷失败', err);
      });
  }

  // 取消使用优惠券
  cancelUseConpon() {
    CarryTokenRequest(servicePath.reCalculateFee, {
      couponRecordIds: [],
      orderNo: this.$router.params.orderId,
      source: 10,
    })
      .then((res) => {
        console.log('取消使用优惠卷成功', res.data);
        if (res.data.code === 0) {
          this.setState(
            {
              orderData: res.data.data,
            },
            () => {
              Taro.navigateBack({
                delta: 1,
              });
            }
          );
        }
      })
      .catch((err) => {
        console.log('使用优惠卷失败', err);
      });
  }

  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {
    this.getUseCouponList();
  }

  componentDidHide() {}

  config = {
    navigationBarTitleText: '使用卡券',
    usingComponents: {},
  };

  render() {
    const {
      couponList,
      fullCoupon,
      discountCoupon,
      deductionCoupon,
      couponRecordIds,
    } = this.state;
    return (
      <View id="use-certificate">
        <View className="certificate-title">
          <Text>可使用卡券</Text>
        </View>
        <View className="certificate-list">
          {/* 满减、折扣券 */}
          {couponList.map((item) => (
            <Label className="coupon-item-wrap" key={item.couponId}>
              <View className="checkbox">
                <Checkbox
                  onChange={this.checkboxChange.bind(this, item)}
                  value={JSON.stringify(item)}
                  checked={item.checked}
                  color="#ff5d8c"
                  disabled={item.disabled}
                ></Checkbox>
              </View>
              <View
                className="certificate-item"
                style={{
                  backgroundImage: `url(${
                    item.couponType === 1
                      ? fullCoupon
                      : item.couponType === 2
                      ? deductionCoupon
                      : discountCoupon
                  })`,
                }}
              >
                <View className="item-top">
                  <View className="item-content">
                    <View className="item-top-left">
                      {item.couponType !== 3 ? (
                        <View className="price-text">
                          <Text className="price-symbol">HK$ </Text>
                          {item.couponAmount}
                        </View>
                      ) : (
                        <View className="price-text">
                          <Text className="price-symbol">
                            全场
                            <Text className="price-text">
                              {' '}
                              {item.couponAmount * 10}{' '}
                            </Text>
                            折
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="item-top-right">
                      <View className="certificate-text">
                        {item.couponType === 1
                          ? '满减'
                          : item.couponType === 2
                          ? '抵扣'
                          : '折扣'}
                        券
                      </View>
                      <View className="satisfied-amount">
                        {item.couponType !== 1 ? (
                          '无门槛'
                        ) : (
                          <View>
                            <View>满HK$ {item.satisfiedAmount}</View>
                            <View>减HK$ {item.couponAmount}</View>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <View className="item-term">
                    <View className="term-text">
                      有效期至{item.expirationEndTime}
                    </View>
                  </View>
                </View>
                <View className="item-rule">{item.couponRule}</View>
              </View>
              <View style={{ display: item.disabled ? 'block' : 'none' }}>
                <View className="coupon-mask">
                  <View>不可使用</View>
                </View>
              </View>
            </Label>
          ))}
        </View>
        <Navigation url="/pages/certificate/certificate">
          <View className="certificate-footer">
            更多优惠，前往领券中心 {'>'}
          </View>
        </Navigation>
        <View className="certificate-btn">
          <Button onClick={this.handleCancel}>不使用优惠券</Button>
          <Button onClick={this.handleComplete}>完成</Button>
        </View>
      </View>
    );
  }
}

export default UseCertificate;
