import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './TypeList.less';
import '../../../../common/globalstyle.less'
import Navigation from '../../../../components/Navigation/Navigation';
/* import servicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request'; */

class TypeList extends Component {

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
        <View className="type-goods-list">
          {
            this.props.goodsList.map(item =>
              <View className="list-item" key={item.itemId}>
                <Navigation url={`/pages/goodsdetails/goodsdetails?itemId=${item.itemId}`}>
                  <img className="item-goods-img" src={item.image} />
                  <View 
                    className="item-goods-name"
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
                    item.price === item.discountPrice ? 
                      <View className="item-goods-price">
                        <View className="goods-discountPrice">
                          <Text className="price-symbol">HK$</Text> 
                          {item.price}
                        </View>
                        <View className="go-text">GO {">"}</View>
                      </View>
                    :                                                                                                
                    item.discountPrice !== null ?
                      <View className="item-goods-price">
                        <View className="goods-discountPrice">
                          <Text className="price-symbol">HK$</Text>  
                          {item.discountPrice}
                        </View>
                        <View className="goods-price-txt">HK${item.price}</View>
                        <View className="go-text">GO {">"}</View>
                      </View>
                      : 
                      <View className="item-goods-price">
                        <View className="goods-discountPrice">
                          <Text className="price-symbol">HK$</Text>  
                          {item.price}
                          </View>
                        <View className="go-text">GO {">"}</View>
                      </View>
                  }
                </Navigation>
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