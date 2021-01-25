import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './GoodsList.less';
// 商品列表
class GoodsList extends Component {
  state = {
    system: window.sessionStorage.getItem('system'),
  };

  // 点击商品事件
  handleClickGood = (item) => {
    if (item.itemId) {
      if (window.sessionStorage.getItem('system') === 'android') {
        click.toGoodsDetail(item.itemId);
      } else {
        window.webkit.messageHandlers.toGoodsDetail.postMessage(item.itemId);
      }
    } else {
      Taro.showToast({
        title: '参数出现null',
        icon: 'none',
      });
    }
  };

  componentWillMount() {}

  componentDidMount() {}

  render() {
    const {} = this.state;
    return (
      <View className="goods-wrap">
        {this.props.hasOwnProperty('hasTitle') ? (
          ''
        ) : (
          <View className="goods-title">
            <img src={require('../../static/category/category-title.png')} />
          </View>
        )}
        <View className="goods-list">
          {this.props.goodsList.map((item) => (
            <View key={item.id} onClick={this.handleClickGood.bind(this, item)}>
              {/* <Navigation key={item.id} url={`/pages/goodsdetails/goodsdetails?itemId=${item.itemId}`}> */}
              <View className="list-item">
                {item.sign ? (
                  <img className="goods-origin" src={item.sign} />
                ) : null}
                {item.taxFree === 1 && item.expressFree === 1 ? (
                  <View className="goods-status">
                    <img src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/goodsStatus/goods-status1.png" />
                  </View>
                ) : item.taxFree === 1 ? (
                  <View className="goods-status">
                    <img src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/goodsStatus/goods-status2.png" />
                  </View>
                ) : item.expressFree === 1 ? (
                  <View className="goods-status">
                    <img src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/goodsStatus/goods-status3.png" />
                  </View>
                ) : null}
                <img className="goods-img" src={item.image} />
                <View className="good-detail">
                  <Text
                    className="good-name"
                    style={{ '-webkit-box-orient': 'vertical' }}
                  >
                    {item.itemName}
                  </Text>
                  {item.price === item.discountPrice ? (
                    <View className="good-price">
                      <View className="good-discountPrice">
                        ￥ {item.price}
                      </View>
                    </View>
                  ) : item.discountPrice !== null ? (
                    <View className="good-price">
                      <View className="good-discountPrice">
                        ￥ {item.discountPrice}
                      </View>
                      <View className="good-price-txt">￥ {item.price}</View>
                    </View>
                  ) : (
                    <View className="good-price">
                      <View className="good-discountPrice">
                        ￥ {item.price}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }
}

GoodsList.defaultProps = {
  goodsList: [],
};

export default GoodsList;
