import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import './coupons.less'

import { postRequest } from '../../../common/util/request'
import servicePath from '../../../common/util/api/apiUrl'
import utils from '../../../common/util/utils'
import CommonEmpty from '../../../components/CommonEmpty/CommonEmpty'

export default class index extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentWillMount() {}

  componentDidMount() {
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  // 领取优惠券
  handleGetCoupon = () => {
    // let userId = Taro.getStorageSync('userId')

    // if (userId === '') {
    //   if (window.sessionStorage.getItem('system') === 'android') {
    //     click.toAppPage(`iconmall://login?userId=123`)
    //   } else {
    //     window.webkit.messageHandlers.toAppPage.postMessage({
    //       path: `iconmall://login?userId=123`,
    //     })
    //   }
    // }
    if (window.sessionStorage.getItem('system') === 'android') {
      click.toAppPage(`iconmall://coupon?tab=2`)
    } else {
      window.webkit.messageHandlers.toAppPage.postMessage({
        path: `iconmall://coupon?tab=2`,
      })
    }
  }

  config = {
    navigationBarTitleText: '领取优惠券',
  }

  render() {
    return (
      <View className="coupons">
        <View className="posters">
          <Image
            className="posterImg"
            src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/activity7/poster.png"
          ></Image>
        </View>
        <View className="button">
          <Image
            className="buttonImg"
            src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/activity7/button.gif"
            onClick={this.handleGetCoupon}
          ></Image>
        </View>
      </View>
    )
  }
}
