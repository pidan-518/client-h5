import Taro, { Component } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './threecategory.less';
import '../../common/globalstyle.less';
import { postRequest } from '../../common/util/request';
import servicePath from '../../common/util/api/apiUrl';
import utils from '../../common/util/utils';

// 品牌代购
class ThreeCategory extends Component {
  state = {
    goodsList: [], // 商品列表
    goodsPages: 1, // 列表总页数
    goodsCurrent: 1, // 列表当前页
  };

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

  // 获取二级下所有分类商品
  getThirdCategory(current = 1) {
    postRequest(servicePath.getThirdCategory, {
      categoryId: this.$router.params.categoryId,
      current: current,
      len: 10,
      type: 2,
      source: 50,
    })
      .then((res) => {
        console.log('获取二级分类商品成功', res.data);
        if (res.data.code === 0) {
          this.setState({
            goodsList: [...this.state.goodsList, ...res.data.data.records],
            goodsPages: res.data.data.pages,
            goodsCurrent: res.data.data.current,
          });
        }
      })
      .catch((err) => {
        console.log('获取二级分类商品失败', err);
      });
  }

  componentWillMount() {}

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: decodeURI(this.$router.params.title),
    });
    this.getThirdCategory();
  }

  componentWillUnmount() {}

  componentDidShow() {}

  // 上拉事件
  onReachBottom() {
    if (this.state.goodsPages > this.state.goodsCurrent) {
      this.getThirdCategory(this.state.goodsCurrent + 1);
    }
  }

  config = {
    onReachBottomDistance: 50,
  };

  render() {
    const { goodsList } = this.state;
    return (
      <View id="three-category-goods">
        {goodsList.map((item) => (
          <View
            className="goods-item"
            onClick={this.handleGoodsClick.bind(this, item)}
          >
            <View className="goods-status">
              {item.taxFree === 0 && item.expressFree === 0 ? null : (
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
              )}
            </View>
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
    );
  }
}

export default ThreeCategory;
