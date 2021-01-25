import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Image } from '@tarojs/components'
import './DetaiLed.less';
import '../../../../common/globalstyle.less'
import Navigation from '../../../../components/Navigation/Navigation'
/* import servicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request'; */

class DetaiLed extends Component {
  state = {
    
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
        <Navigation url={`/pages/goodsdetails/goodsdetails?itemId=${this.props.goodsInfo.itemId}`}>
          <Image className="detailed-main-img" src={this.props.MainImg} />
        </Navigation>
        <View className="detailed-img-list">
          {
            this.props.goodsInfo.images.slice(0, 3).map((item, index) => {
              return (
                <Navigation url={`/pages/goodsdetails/goodsdetails?itemId=${this.props.goodsInfo.itemId}`} key={index+1}>
                  <Image src={item} key={index} />
                </Navigation>
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