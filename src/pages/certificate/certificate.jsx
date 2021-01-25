import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button } from '@tarojs/components'
import './certificate.less';
import '../../common/globalstyle.less'
import { CarryTokenRequest } from '../../common/util/request';
import servicePath from '../../common/util/api/apiUrl';
import CommonEmpty from '../../components/CommonEmpty/CommonEmpty';
import Navigation from '../../components/Navigation/Navigation';

// 优惠券
class Certificate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      couponList: [], // 优惠券列表
      fullCoupon: 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/coupone3.png', // 满减券
      discountCoupon: 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/coupone1.png', // 折扣券
      deductionCoupon: 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/coupone2.png', // 抵扣券
    }
  }

  // 领取点击事件
  handleReceive = (couponId) => {
    CarryTokenRequest(servicePath.saveCouponRecord, {
      couponId: couponId,
      current: 1,
      len: 10,
      distributionMethod: 2
      // distributionMethod: 2
    })
      .then(res => {
        console.log("领取优惠券成功", res.data);
        if (res.data.code === 0) {
          Taro.showToast({
            title: '领取成功',
            icon: 'none',
            duration: 1000,
            success: (res) => {
              this.getMyCouponList();
            }
          })
        } else {
          Taro.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000
          })
        }
      })
      .catch(err => {
        console.log("领取优惠券失败", err);
      })
  }

  // 获取优惠券
  getMyCouponList() {
    CarryTokenRequest(servicePath.getmyCouponList, {
      current: 1,
      len: 10,
      distributionMethod: 2
    })
      .then(res => {
        console.log("获取优惠券成功", res.data);
        if (res.data.code === 0) {
          this.setState({
            couponList: res.data.data
          });
        } else {
          this.setState({
            couponList: []
          })
        }
      })
      .catch(err => {
        console.log("获取优惠券失败", err);
      })
  }

  componentWillMount () { }

  componentDidMount () {  
    this.getMyCouponList();
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  config = {
    navigationBarTitleText: '卡券中心',
    usingComponents: {}
  }

  render () {
    const { couponList, fullCoupon, discountCoupon, deductionCoupon } = this.state
    return (
      <View id='certificate'>
        {/* <View className="certificate-title">
          <Navigator url="">
            <Text></Text>
          </Navigator>
          <Navigator url="/pages/historycertificate/historycertificate">
            <Text>历史记录</Text>
          </Navigator>
        </View> */}
        <View className="certificate-list">
          {
            couponList.length === 0 ? <CommonEmpty content="暂无优惠券" /> :
            couponList.map(item =>
              <View 
                className="certificate-item" 
                style={{
                  backgroundImage: `url(${
                    item.couponType === 1 ? fullCoupon : item.couponType === 2 ? discountCoupon : deductionCoupon
                  })`
                }}
                key={item.couponId}
              >
                <View className="item-top">
                  <View className="item-content">
                    <View className="item-top-left">
                      {
                        item.couponType !== 3 ?
                          <View className="price-text">
                            <Text className="price-symbol">HK$ </Text>
                            {item.couponAmount}
                          </View>
                        :
                          <View className="price-text">
                            <Text className="price-symbol">全场
                              <Text className="price-text"> {item.couponAmount * 10} </Text>折
                            </Text>
                          </View>
                      }
                    </View>
                    <View className="item-top-right">
                      <View className="certificate-text">
                        {
                          item.couponType === 1 ? '满减' : item.couponType === 2 ? '抵扣' : '折扣'
                        }券
                      </View>
                      <View className="satisfied-amount">
                        {
                          item.couponType !== 1 ? '无门槛' 
                          : 
                          <View>
                            <View>满HK$ {item.satisfiedAmount}</View>
                            <View>减HK$ {item.couponAmount}</View>
                          </View>
                        }
                      </View>
                    </View>
                  </View>
                  <View className="item-bottom">
                    <View className="term-text">有效期至 {item.expirationEndTime.slice(0, 10)}</View>
                    <Button
                      disabled={item.collectionStatus}
                      className="receive-btn" 
                      onClick={this.handleReceive.bind(this, item.couponId)}
                    >
                      {item.collectionStatus ? '已领取' : '领取'}
                    </Button>
                  </View>
                </View>
                <View className="item-rule">
                  {item.couponRule}
                </View>
              </View>
            )
          }
        </View>
        <Navigation url='/pages/mycertificate/mycertificate'>
          <View className="certificate-footer">
            查看我的卡券 {">"}
          </View>
        </Navigation>
      </View>
    )
  }
}

export default Certificate;