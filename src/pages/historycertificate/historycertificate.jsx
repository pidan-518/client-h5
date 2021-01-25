import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './historycertificate.less';
import '../../common/globalstyle.less'
import { CarryTokenRequest } from '../../common/util/request';
import servicePath from '../../common/util/api/apiUrl';
import CommonEmpty from '../../components/CommonEmpty/CommonEmpty';

class HistoryCertificate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      couponList: [], // 优惠券列表
      fullCoupon: 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/coupone3.png', // 满减券
      discountCoupon: 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/coupone1.png', // 折扣券
      deductionCoupon: 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/coupone2.png', // 抵扣券
    }
  }

  // 获取历史优惠券
  getMyCoupon() {
    CarryTokenRequest(servicePath.getmyCoupon, {
      current: 1,
      len: 10,
      useStatus: 1
    })
      .then(res => {
        console.log("获取优惠券成功", res.data);
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

  componentWillUnmount () { }

  componentDidShow () { 
    this.getMyCoupon();
  }

  componentDidHide () { }

  config = {
    navigationBarTitleText: '历史卡券',
    usingComponents: {}
  }

  render () {
    const { couponList, fullCoupon, discountCoupon, deductionCoupon } = this.state
    return (
      <View id='history-certificate'>
        <View className="certificate-title">
          <Text>历史卡券</Text>
        </View>
        {
            couponList.length === 0 ? <CommonEmpty content="暂无优惠券" />
              :
                <View className="certificate-list">
                  {
                    couponList.map(item =>
                      <View
                        key={item.couponId}
                        className="certificate-item" 
                        style={{
                          backgroundImage: `url(${
                            item.couponType === 1 ? fullCoupon : item.couponType === 2 ? discountCoupon : deductionCoupon
                          })`,
                        }}
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
                        <View className="use-icon">
                          <img src={require("../../static/certificate/use-icon.png")} />
                        </View>
                      </View>
                    )
                  }
                </View>
          }
      </View>
    )
  }
}

export default HistoryCertificate;