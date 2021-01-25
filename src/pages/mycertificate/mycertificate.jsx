import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './mycertificate.less';
import '../../common/globalstyle.less'
import { CarryTokenRequest } from '../../common/util/request';
import servicePath from '../../common/util/api/apiUrl';
import CommonEmpty from '../../components/CommonEmpty/CommonEmpty';
import Navigation from '../../components/Navigation/Navigation';

class Mycertificate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      couponList: [], // 优惠券列表
      fullCoupon: 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/coupone3.png', // 满减券
      discountCoupon: 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/coupone1.png', // 折扣券
      deductionCoupon: 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/coupone2.png', // 抵扣券
    }
  }

  // 获取我的优惠券（可用）
  getMyCoupon() {
    CarryTokenRequest(servicePath.getmyCoupon, {
      current: 1,
      len: 10,
      useStatus: 0,
    })
      .then(res => {
        console.log("获取我的优惠券成功", res.data);
        if (res.data.code === 0) {
          this.setState({
            couponList: res.data.data
          });
        }
      })
      .catch(err => {
        console.log("获取优惠券失败", err);
      })
  }

  componentWillMount () { }

  componentDidMount () {  }

  componentDidShow () { 
    this.getMyCoupon();
  }

  config = {
    navigationBarTitleText: '我的卡券',
    usingComponents: {}
  }

  render () {
    const { couponList, fullCoupon, discountCoupon, deductionCoupon } = this.state
    return (
      <View id='my-certificate'>
        <View className="certificate-title">
          <Navigation url="">
            <Text>可使用卡券</Text>
          </Navigation>
          <Navigation url="/pages/historycertificate/historycertificate">
            <Text>历史记录</Text>
          </Navigation>
        </View>
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
                    <View className="item-term">
                      <View className="term-text">有效期至{item.expirationEndTime}</View>
                    </View>
                  </View>
                  <View className="item-rule">
                    {item.couponRule}
                  </View>
                </View>
              )
          }
        </View>
      </View>
    )
  }
}

export default Mycertificate;