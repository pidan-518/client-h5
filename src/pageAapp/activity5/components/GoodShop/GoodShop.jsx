import Taro, { Component } from '@tarojs/taro'
import { View, Text, Swiper, SwiperItem } from '@tarojs/components'
import './GoodShop.less';
import '../../../../common/globalstyle.less'
import Navigation from '../../../../components/Navigation/Navigation'

class GoodShop extends Component {

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


  componentWillMount () {  }

  componentDidMount () { }

  componentDidUpdate() {  }

  componentWillUnmount () { }

  componentDidShow () {  
    
  }

  componentDidHide () { }

  config = {
  }

  render () {
    return (
      <View className='good-shop-wrap'>
        <img className="good-shop-bg" src={this.props.shopimg} />
        <View className="goods-shop-box">
          <View className="shop-logo">
            <View>
              <img src={this.props.shopData.logoPath} />
            </View>
          </View>
          <View className="shop-goods-list">
            <Swiper 
              className="shop-goods-swiper" 
              autoplay 
              circular 
              interval={2000} 
              displayMultipleItems={3}
            >
              {
                this.props.shopGoodsList.map(item =>
                  <SwiperItem className="shop-goods-swiper-item" key={item.itemId}>
                    <View onClick={this.handleClickGood.bind(this, item)}>
                      <img className="swiper-goods-img" src={item.image} />
                    </View>
                  </SwiperItem>
                )
              }
            </Swiper>
          </View>
        </View>
      </View>
    )
  }
}

export default GoodShop;