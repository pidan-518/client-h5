import Taro, { Component } from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "./GoodsName.less";

class GoodsName extends Component {
  state = {};

  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  config = {
    navigationBarTitleText: "首页",
    usingComponents: {},
  };

  render() {
    const {
      discountPrice,
      price,
      goodsName,
      signName,
      sign,
      expressFree,
      taxFree,
    } = this.props;
    return (
      <View className="goods-info-wrap">
        <View className="goods-detail-price">
          {discountPrice === price ? (
            <Text>
              <Text className="price-symbol">￥</Text>
              <Text className="price-text">{price}</Text>
            </Text>
          ) : discountPrice === null ? (
            <Text>
              <Text className="price-symbol">￥</Text>
              <Text className="price-text">{price}</Text>
            </Text>
          ) : price === "" ? (
            <Text>
              <Text className="price-symbol">￥</Text>
              <Text className="price-text">{discountPrice}</Text>
            </Text>
          ) : (
            <View>
              <Text>
                <Text className="price-symbol">￥</Text>
                <Text className="price-text">{discountPrice}</Text>
              </Text>
              <Text className="original-price">原价:￥ {price}</Text>
            </View>
          )}
        </View>
        <View className="goods-name-box">
          {signName ? (
            <Text className="goods-sign">
              <Text
                className="sign-icon"
                style={{ backgroundImage: `url(${sign})` }}
              ></Text>
              <Text>{signName}</Text>
            </Text>
          ) : null}
          {expressFree === 0 && taxFree === 0 ? null : (
            <Text className="goods-status">
              {expressFree === 1 && taxFree === 1
                ? "包邮包税"
                : taxFree === 1
                ? "包税"
                : expressFree === 1
                ? "包邮"
                : null}
            </Text>
          )}

          <Text className="goods-name">{goodsName}</Text>
        </View>
        <View className="promise-title">
          <img
            className="promise-image"
            src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/goodsdetails/promise-image.png"
          />
        </View>
      </View>
    );
  }
}

GoodsName.defaultProps = {
  discountPrice: "",
  price: "",
  goodsName: "",
  signName: "",
  sign: "",
  expressFree: "",
  taxFree: "",
};

export default GoodsName;
