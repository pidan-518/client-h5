import Taro, { Component } from '@tarojs/taro'
import { View, Text, ScrollView, img, Swiper, SwiperItem } from '@tarojs/components'
import './TimeLimit.less';
import '../../../../common/globalstyle.less';
import Navigation from '../../../../components/Navigation/Navigation';
/* import servicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request'; */

class TimeLimit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    }
  }

  // 点击商品事件
  handleClickGood = (item) => {
    if (item.itemId) {
      if (window.sessionStorage.getItem('system') === 'android') {
        click.toGoodsDetail(item.itemId)
      } else {
        window.webkit.messageHandlers.toGoodsDetail.postMessage(item.itemId)
      }
    } else {
      Taro.showToast({
        title: '参数出现null',
        icon: 'none'
      })
    }
  }


  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { 
  }

  config = {
    navigationBarTitleText: '',
    usingComponents: {}
  }

  render () {
    
    return (
      <View className="time-limit-goods-wrap" style={{backgroundColor: this.props.backgroundColor}}>
        <View className="wrap-left">
          <img src={this.props.LeftImage} />
        </View>
        <View className="wrap-right">
          <Swiper className="right-swiper-wrap" autoplay circular interval={2000} displayMultipleItems={3}>
            {
              this.props.goodsList.map(item => 
                <SwiperItem className="swiper-goods-item" key={item.itemId}>
                  <View key={item.itemId}>
                    <View onClick={this.handleClickGood.bind(this, item)}>
                      <img src={item.image} />
                    </View>
                  </View>
                </SwiperItem>
              )
            }
          </Swiper>
        </View>
      </View>
    )
  }
}

export default TimeLimit;