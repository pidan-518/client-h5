import Taro, { Component } from '@tarojs/taro';
import { View, Text, Input, Button } from '@tarojs/components';
import { postRequest } from '../../common/util/request';
import servicePath from '../../common/util/api/apiUrl';
import './categoryGoods.less';
import '../../common/globalstyle.less';
import GoodsList from '../../components/GoodsList/GoodsList';
import CommonEmpty from '../../components/CommonEmpty/CommonEmpty';

// 三级分类商品
class categoryGoods extends Component {
  constructor(props) {
    super(props);
    this.state = {
      topFliter: '', // 筛选框和顶部的距离
      bannerImage: '', //
      riseIcon: require('../../static/category/filter-top.png'), // 销量正序图标
      dropIcon: require('../../static/category/filter-bottom.png'), // 销量倒序图标
      isSales: false, // 显示销量排序
      isPrice: false, // 显示价格排序
      maskHeight: '', // 蒙版高度 销量和价格的蒙版
      isSalesDrop: false, // 销量降序
      isSalesRise: false, // 销量升序
      isPriceDrop: false, // 价格降序
      isPriceRise: false, // 价格升序
      isNewest: false, // 最近上新
      saleOrder: '', // 传给后台的销量排序值
      priceOrder: '', // 传给后台的价格排序值
      updateOrder: '', // 传给后台的最近上新排序值
      goodsList: [], // 商品列表
      goodsCurrent: '', // 商品列表当前页
      goodsPages: '', // 商品列表总页数
      hotText: '', // 输入框默认值
    };
  }

  //
  handleCloseMask = () => {
    if (this.state.isSales || this.state.isPrice) {
      this.setState({
        isSales: false,
        isPrice: false,
      });
    }
  };

  // 搜索框点击事件
  handleNavigateTo = () => {
    Taro.navigateTo({
      url: `/pages/searchpage/searchpage?hotText=${this.state.hotText}`,
    });
  };

  /* ------------------------------销量排序-------------------------- */

  // 销量排序点击事件
  handleSalesSortClick = () => {
    if (this.state.isSales) {
      this.setState({
        isSales: false,
      });
    } else {
      this.setState({
        isSales: true,
        isPrice: false,
      });
    }
  };

  // 销量降序点击事件
  handleSalesDropClick = () => {
    this.setState(
      {
        isSalesDrop: true,
        isSalesRise: false,
        isPriceDrop: false,
        isPriceRise: false,
        saleOrder: 'desc',
        priceOrder: '',
        isNewest: false,
        updateOrder: '',
      },
      () => {
        this.getItemListByComIds();
      }
    );
  };

  // 销量升序点击事件
  handleSalesRiseClick = () => {
    this.setState(
      {
        isSalesDrop: false,
        isSalesRise: true,
        isPriceDrop: false,
        isPriceRise: false,
        saleOrder: 'asc',
        priceOrder: '',
        isNewest: false,
        updateOrder: '',
      },
      () => {
        this.getItemListByComIds();
      }
    );
  };

  /* ------------------------------价格排序-------------------------- */

  // 价格排序点击事件
  handlePriceSortClick = () => {
    if (this.state.isPrice) {
      this.setState({
        isPrice: false,
      });
    } else {
      this.setState({
        isPrice: true,
        isSales: false,
      });
    }
  };

  // 价格降序点击事件
  handlePriceDropClick = () => {
    this.setState(
      {
        isPriceDrop: true,
        isPriceRise: false,
        isSalesDrop: false,
        isSalesRise: false,
        saleOrder: '',
        priceOrder: 'desc',
        isNewest: false,
        updateOrder: '',
      },
      () => {
        this.getItemListByComIds();
      }
    );
  };

  // 价格升序点击事件
  handlePriceRiseClick = () => {
    this.setState(
      {
        isPriceDrop: false,
        isPriceRise: true,
        isSalesDrop: false,
        isSalesRise: false,
        saleOrder: '',
        priceOrder: 'asc',
        isNewest: false,
        updateOrder: '',
      },
      () => {
        this.getItemListByComIds();
      }
    );
  };

  /* ------------------------------最近上新-------------------------- */

  // 最近上新点击事件
  handleRecentlyAddedClick = () => {
    this.setState({
      isSalesDrop: false,
      isSalesRise: false,
      isPriceDrop: false,
      isPriceRise: false,
      isSales: false,
      isPrice: false,
      priceOrder: '',
      saleOrder: '',
    });

    if (this.state.isNewest) {
      this.setState(
        {
          isNewest: false,
          updateOrder: '',
        },
        () => {
          this.getItemListByComIds();
        }
      );
    } else {
      this.setState(
        {
          isNewest: true,
          updateOrder: 'DESC',
        },
        () => {
          this.getItemListByComIds();
        }
      );
    }
  };

  // 上拉事件
  onReachBottom() {
    if (this.state.goodsCurrent !== this.state.goodsPages) {
      postRequest(servicePath.getItemListByComIds, {
        comIds: [this.$router.params.id],
        current: this.state.goodsCurrent + 1,
        len: 10,
        source: 40,
        saleOrder: this.state.saleOrder,
        priceOrder: this.state.priceOrder,
        updatePrder: '',
      })
        .then((res) => {
          console.log('获取商品成功', res.data);
          if (res.data.code === 0) {
            this.setState({
              goodsCurrent: res.data.data.current,
              goodsPages: res.data.data.pages,
              goodsList: [...this.state.goodsList, ...res.data.data.records],
            });
          }
        })
        .catch((err) => {
          console.log('获取商品失败', err);
        });
    }
  }

  // 根据分类id获取商品
  getItemListByComIds(current = 1) {
    postRequest(servicePath.getItemListByComIds, {
      comIds: [this.$router.params.comIds],
      current: current,
      len: 10,
      source: 40,
      saleOrder: this.state.saleOrder,
      priceOrder: this.state.priceOrder,
      updateOrder: this.state.updateOrder,
    })
      .then((res) => {
        console.log('获取商品成功', res.data);
        if (res.data.code === 0) {
          this.setState({
            goodsCurrent: res.data.data.current,
            goodsPages: res.data.data.pages,
            goodsList: res.data.data.records,
          });
        }
      })
      .catch((err) => {
        console.log('获取商品失败', err);
      });
  }

  componentWillMount() {
    Taro.getSystemInfo({}).then((res) => {
      this.setState({
        maskHeight: res.windowHeight - 77,
      });
    });
  }

  componentDidMount() {
    this.getItemListByComIds();
  }

  componentWillUnmount() {}

  componentDidShow() {
    Taro.createSelectorQuery()
      .select('.category-goods-head')
      .boundingClientRect((rect) => {
        console.log(rect.height / 2);
        this.setState({
          topFliter: rect.height / 2,
        });
      })
      .exec();
    this.setState({
      bannerImage: this.$router.params.banner,
      hotText: decodeURI(this.$router.params.hotText),
    });
  }

  onPageScroll(e) {
    this.setState({
      isSales: false,
      isPrice: false,
    });
  }

  componentDidHide() {}

  config = {
    /* navigationBarTitleText: '搜索',
    usingComponents: {} */
    onReachBottomDistance: 50,
  };

  render() {
    const {
      topFliter,
      bannerImage,
      riseIcon,
      dropIcon,
      goodsList,
      maskHeight,
      isSales,
      isPrice,
      isSalesDrop,
      isSalesRise,
      isPriceDrop,
      isPriceRise,
      isNewest,
      hotText,
    } = this.state;

    return (
      <View id="category-goods" onClick={this.handleCloseMask}>
        <View className="category-goods-head" onClick={this.handleNavigateTo}>
          <Input
            className="search-input"
            disabled
            placeholder={hotText || ''}
          />
          <Button className="search-btn">搜索</Button>
        </View>
        {bannerImage ? (
          <View className="category-banner">
            <img className="banner-img" src={bannerImage} />
          </View>
        ) : null}
        <View className="filter-row">
          <View className="filter-item-box">
            <View className="filter-item" onClick={this.handleSalesSortClick}>
              <View>销量排序</View>
              <img src={isSales ? riseIcon : dropIcon} />
            </View>
            <View
              className="mask"
              style={{
                display: isSales ? 'block' : 'none',
                height: `${maskHeight}px`,
              }}
            >
              <View className="item-select">
                <View
                  className="select-text"
                  onClick={this.handleSalesDropClick}
                >
                  <View style={{ color: isSalesDrop ? '#ff5d8c' : null }}>
                    销量降序
                  </View>
                  <img
                    className="select-icon"
                    src={
                      isSalesDrop
                        ? require('../../static/category/hook.png')
                        : null
                    }
                  />
                </View>
                <View
                  className="select-text"
                  onClick={this.handleSalesRiseClick}
                >
                  <View style={{ color: isSalesRise ? '#ff5d8c' : null }}>
                    销量升序
                  </View>
                  <img
                    className="select-icon"
                    src={
                      isSalesRise
                        ? require('../../static/category/hook.png')
                        : null
                    }
                  />
                </View>
              </View>
            </View>
          </View>
          <View className="filter-item-box">
            <View className="filter-item" onClick={this.handlePriceSortClick}>
              <View>价格排序</View>
              <img src={isPrice ? riseIcon : dropIcon} />
            </View>
            <View
              className="mask"
              style={{
                display: isPrice ? 'block' : 'none',
                height: `${maskHeight}px`,
              }}
            >
              <View className="item-select">
                <View
                  className="select-text"
                  onClick={this.handlePriceDropClick}
                >
                  <View style={{ color: isPriceDrop ? '#ff5d8c' : null }}>
                    价格降序
                  </View>
                  <img
                    className="select-icon"
                    src={
                      isPriceDrop
                        ? require('../../static/category/hook.png')
                        : null
                    }
                  />
                </View>
                <View
                  className="select-text"
                  onClick={this.handlePriceRiseClick}
                >
                  <View style={{ color: isPriceRise ? '#ff5d8c' : null }}>
                    价格升序
                  </View>
                  <img
                    className="select-icon"
                    src={
                      isPriceRise
                        ? require('../../static/category/hook.png')
                        : null
                    }
                  />
                </View>
              </View>
            </View>
          </View>
          <View className="filter-item-box">
            <View
              className="filter-item"
              onClick={this.handleRecentlyAddedClick}
            >
              <View style={{ color: isNewest ? '#ff5d8c' : null }}>
                最近上新
              </View>
            </View>
          </View>
        </View>
        {goodsList.length === 0 ? (
          <CommonEmpty content="暂无商品" />
        ) : (
          <View className="goods-content">
            <GoodsList hasTitle goodsList={goodsList} />
          </View>
        )}
      </View>
    );
  }
}

export default categoryGoods;
