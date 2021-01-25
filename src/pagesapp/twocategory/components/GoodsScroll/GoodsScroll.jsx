import Taro, { Component } from '@tarojs/taro';
import { View, ScrollView, Text } from '@tarojs/components';
import './GoodsScroll.less';
import '../../../../common/globalstyle.less';
import utils from '../../../../common/util/utils';

// 品牌代购
class GoodsScroll extends Component {
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
    const { goodsData, titleImg, title } = this.props;
    return (
      <View className="goods-swiper-wrap">
        <View className="goods-swiper-box">
          <View
            className="goods-title"
            style={{ backgroundImage: `url(${titleImg})` }}
          >
            {title}
          </View>
          <View className="goods-list">
            <ScrollView className="goods-scrollView" scrollX>
              {goodsData.map((item) => (
                <View
                  className="item-goods"
                  key={item.id}
                  onClick={this.handleGoodsClick.bind(this, item)}
                >
                  <View className="goods-img-wrap">
                    <img
                      className="goods-img"
                      src={utils.transWebp(item.image)}
                      alt=""
                    />
                  </View>
                  <Text
                    style={{ '-webkit-box-orient': 'vertical' }}
                    className="goods-name"
                  >
                    {item.itemName}
                  </Text>
                  <View className="goods-price">
                    <Text className="price-symbol">￥</Text>
                    <Text className="price-text">
                      {item.price === item.discountPrice
                        ? item.price
                        : item.discountPrice !== null
                        ? item.discountPrice
                        : item.price}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }
}

export default GoodsScroll;
