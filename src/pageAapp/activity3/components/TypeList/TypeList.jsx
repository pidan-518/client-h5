import Taro, { Component } from '@tarojs/taro'
import { View,Image,Text } from '@tarojs/components'
import './TypeList.less';
import '../../../../common/globalstyle.less'
import Navigation from '../../../../components/Navigation/Navigation'
/* import servicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request'; */
import btnImg from '../../../../static/activity/ic_btn.png'
import noneImg from '../../../../static/activity/ic_end.png'
class TypeList extends Component {
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

  render () {
    
    return (
      <View className='type-list'>
        <View className="type-list-title">
          <img src={this.props.titleImage} />
        </View>
        <View className="type-good-list">
          {
            this.props.goodsList.map(item =>
              <View className="list-item" key={item.itemId}>
                <View onClick={this.handleClickGood.bind(this, item)}>
                  <img className="item-good-img" src={item.image} />
                  {item.stockNum==0?<Image className="none-img" src={noneImg}></Image>:""}
                  <View 
                    className="item-good-name"
                    style={{
                      display: '-webkit-box', 
                      '-webkit-box-orient': 'vertical',
                      '-webkit-line-clamp': 2,
                      overflow: 'hidden'
                    }}
                  >
                    {item.itemName}
                  </View>
                  {                                
                    item.discountPrice !== null ?
                    <View className="border">
                      <View className="box">秒杀价</View>
                      <View className="item-good-price">
                        <View className="good-discountPrice">￥<Text>{item.discountPrice}</Text></View>
                        <View className="good-price-txt">原价￥{item.price}</View>
                      </View>
                    </View>
                      : 
                      <View className="item-good-price">
                        <View className="good-discountPrice">￥ {item.price}</View>
                      </View>
                  }
                  <Image className="btn" src={btnImg}></Image>
                </View>
              </View>
            )
          }
        </View>
        
      </View>
    )
  }
}

TypeList.defaultProps = {
  goodsList: []
}

export default TypeList;