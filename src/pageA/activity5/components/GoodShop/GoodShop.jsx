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
            <Navigation url={`/pages/shophome/shophome?businessId=${this.props.shopData.businessId}`}>
              <img src={this.props.shopData.logoPath} />
            </Navigation>
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
                    <Navigation url={`/pages/goodsdetails/goodsdetails?itemId=${item.itemId}`}>
                      <img className="swiper-goods-img" src={item.image} />
                    </Navigation>
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