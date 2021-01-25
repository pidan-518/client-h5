import Taro, { Component } from '@tarojs/taro';
import { View, ScrollView, Text } from '@tarojs/components';
import './GuessGoods.less';
import '../../../../common/globalstyle.less';
import utils from '../../../../common/util/utils';

// 品牌代购
class GuessGoods extends Component {
  state = {};

  // 商品点击事件
  handleGoodsClick = (item) => {
    if (item.itemId) {
      if (window.sessionStorage.getItem('system') === 'android') {
        click.toAppPage(`iconmall://goodsdetail?id=${item.itemId}`);
      } else {
        window.webkit.messageHandlers.toAppPage.postMessage(
          `iconmall://goodsdetail?id=${item.itemId}`
        );
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

  componentWillUnmount() {}

  componentDidShow() {}

  config = {};

  render() {
    const { goodsData, titleImg } = this.props;
    return (
      <View className="parity-goods">
        <View
          className="parity-goods-title"
          style={{ backgroundImage: `url(${titleImg})` }}
        >
          猜你喜欢
        </View>
        <View className="parity-goods-list">
          {goodsData.map((item) => (
            <View
              className="goods-item"
              key={item.categoryComId}
              onClick={this.handleGoodsClick.bind(this, item)}
            >
              {item.taxFree === 0 && item.expressFree === 0 ? null : (
                <View className="goods-status">
                  <img
                    className="status-img"
                    src={
                      item.taxFree === 1 && item.expressFree === 1
                        ? 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/goodsStatus/goods-status1.png'
                        : item.taxFree === 1
                        ? 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/goodsStatus/goods-status2.png'
                        : item.expressFree === 1
                        ? 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/goodsStatus/goods-status3.png'
                        : null
                    }
                  />
                </View>
              )}

              <View className="goods-img-wrap">
                <img
                  className="goods-img"
                  src={utils.transWebp(item.image)}
                  alt=""
                />
              </View>
              <Text
                className="goods-name"
                style={{ '-webkit-box-orient': 'vertical' }}
              >
                {item.itemName}
              </Text>
              <View className="goods-price">
                {item.price === item.discountPrice ? (
                  <View className="price-box">
                    <View className="origin-price">
                      <Text className="price-symbol">￥</Text>
                      <Text className="price-text">{item.price}</Text>
                    </View>
                  </View>
                ) : item.discountPrice !== null ? (
                  <View className="price-box">
                    <View className="origin-price">
                      <Text className="price-symbol">￥</Text>
                      <Text className="price-text">{item.discountPrice}</Text>
                    </View>
                    <View className="discount-price">￥{item.price}</View>
                  </View>
                ) : (
                  <View className="price-box">
                    <View className="origin-price">
                      <Text className="price-symbol">￥</Text>
                      <Text className="price-text">{item.price}</Text>
                    </View>
                  </View>
                )}
                {item.sign ? (
                  <View className="sign-img-wrap">
                    <img className="sign-img" src={item.sign} alt="" />
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }
}

export default GuessGoods;
