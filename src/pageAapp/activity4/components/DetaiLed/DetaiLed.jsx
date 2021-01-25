import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Image } from '@tarojs/components'
import './DetaiLed.less';
import '../../../../common/globalstyle.less'
import Navigation from '../../../../components/Navigation/Navigation'
/* import servicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request'; */

class DetaiLed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      
    }
  }

  // 点击商品事件
  handleClickGood = (itemId) => {
    if (itemId) {
      if (window.sessionStorage.getItem('system') === 'android') {
        click.toGoodsDetail(itemId)
      } else {
        window.webkit.messageHandlers.toGoodsDetail.postMessage(itemId)
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
      <View className="detailed-item">
        <View onClick={this.handleClickGood.bind(this, this.props.goodsInfo.itemId)}>
          <Image className="detailed-main-img" src={this.props.MainImg} />
        </View>
        <View className="detailed-img-list">
          {
            this.props.goodsInfo.images.slice(0, 3).map((item, index) => {
              return (
                <View onClick={this.handleClickGood.bind(this, this.props.goodsInfo.itemId)} key={index+1}>
                  <Image src={item} key={index} />
                </View>
              )}
            )
          }
        </View>
      </View>
    )
  }
}

DetaiLed.defaultProps = {
  goodsInfo: {
    images: ["", "", ""]
  }
}

export default DetaiLed;