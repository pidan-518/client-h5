import Taro, { Component } from '@tarojs/taro'
import { View, Text, Swiper, SwiperItem } from '@tarojs/components'
import './Popularity.less';
import '../../../../common/globalstyle.less'
import Navigation from '../../../../components/Navigation/Navigation'

class Popularity extends Component {

  constructor(props) {
    super(props) 
    this.state = { }
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

  componentDidShow () { }

  componentDidHide () { }

  config = {
  }

  render () {
    return (
      <View className='popularity-goods' style={{backgroundImage: `url(${this.props.bgimg})`}}>
        <View className="goods-item-wrap">
          {
            this.props.goodsList.map(item => 
              <View className="goods-item" key={item.itemId}>
                <View onClick={this.handleClickGood.bind(this, item)}>
                  <img className="goods-img" src={item.image} />
                </View>
              </View>
            )
          }
        </View>
      </View>
    )
  }
}

Popularity.defaultProps = {
  goodsList: []
}

export default Popularity;