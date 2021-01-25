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
                <Navigation url={`/pages/goodsdetails/goodsdetails?itemId=${item.itemId}`} >
                  <img className="goods-img" src={item.image} />
                </Navigation>
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