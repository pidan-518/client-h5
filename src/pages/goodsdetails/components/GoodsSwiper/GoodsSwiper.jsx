import Taro, { Component } from '@tarojs/taro';
import { View, Text, Swiper, SwiperItem } from '@tarojs/components';
import './GoodsSwiper.less';

class GoodsSwiper extends Component {
  state = {
    swiperCurrent: 0,
  };

  // 轮播图change事件
  handleSwiperchange = (e) => {
    this.setState({
      swiperCurrent: e.detail.current,
    });
  };

  // 商品图片点击事件
  handleGoodsSwiperClick = (item) => {
    Taro.previewImage({
      current: item,
      urls: this.props.swiperData,
    });
  };

  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  config = {
    navigationBarTitleText: '首页',
    usingComponents: {},
  };

  render() {
    const { swiperData, swiperCurrent } = this.props;
    return (
      <View className="goods-swiper-wrap">
        <View className="goods-swiper-pagenumber">
          <Text className="current-number">{swiperCurrent}</Text> /{' '}
          {swiperData.length}
        </View>
        <Swiper
          className="goods-swiper"
          circular
          autoplay
          current={swiperCurrent}
          onChange={this.handleSwiperchange}
        >
          {swiperData.map((item, index) => (
            <SwiperItem key={index}>
              <img
                webp
                className="goods-img"
                src={item}
                onClick={this.handleGoodsSwiperClick.bind(this, item)}
              />
            </SwiperItem>
          ))}
        </Swiper>
      </View>
    );
  }
}

GoodsSwiper.defaultProps = {
  swiperData: [],
  swiperCurrent: 1,
};

export default GoodsSwiper;
