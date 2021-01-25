import Taro, { Component } from '@tarojs/taro';
import { View, Swiper, SwiperItem, ScrollView } from '@tarojs/components';
import './index.less';
import '../../common/globalstyle.less';
import { postRequest, CarryTokenRequest } from '../../common/util/request';
import servicePath from '../../common/util/api/apiUrl';
import GoodsList from '../../componentsapp/GoodsList/GoodsList';
import Navigation from '../../components/Navigation/Navigation';
import TabBar from '../../components/TabBar/TabBar';
import utils from '../../common/util/utils';
import AgentShare from '../../components/AgentShare/AgentShare';

// 首页
class Index extends Component {
  state = {
    roaChartImg: [
      {
        id: 103,
        imageUrl:
          'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/jpg/2020/062d90e601094eac8c0f7d85c0608273.jpg',
      },
      {
        id: 104,
        imageUrl:
          'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/jpg/2020/c764ca7119ff4959985f4b0a85770a2b.jpg',
      },
      {
        id: 105,
        imageUrl:
          'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/jpg/2020/2b1d8ecf0fae437eb4655fef816fdbac.jpg',
      },
    ], // 轮播图
    categoryList: [], // 分类数据
    IconList: [], // 分类icon
    tabsList: [], // 分类tab数据
    tabsIndex: 0, // tabsid
    tabScroll: '', // tabs自动偏移
    windowWidth: '', // 窗口总大小
    hotGoodsList: [], // 人气爆款数据
    goodsPages: '', // 分类商品总页数
    goodsCurrent: 1, // 分类商品当前页
    goodsList: [], // 分类商品
    namePath: '', // 分类名
    spceialImg:
      'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/home-activity-zhongqiu.png',
    couponList: [], // 优惠券列表
    navInputColor: '', // 搜索框背景颜色
    activityObj: {
      openingImage:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/home-activity-bg3-2.gif',
      specialImage:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/goods-special-bg2-1.jpg',
      goodsActivity1:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/home-activity1-1.jpg',
      goodsActivity2:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/home-activity2-1.jpg',
      couponImage:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/home-coupon1-2.png',
      to: '/pageAapp/activity3/activity3source=app',
    },
  };

  // banner点击事件
  handleBnnaerClick = (url, index) => {
    if (utils.getDate() >= '2020-09-26 00:00') {
      Taro.navigateTo({
        url: '/pageAapp/activity6/activity6source=app',
      });
    } else {
      Taro.navigateTo({
        url: '/pageAapp/activity3/activity3source=app',
      });
    }
  };

  // 分类点击事件
  handleCategoryClick = (item) => {
    if (window.sessionStorage.getItem('system') === 'android') {
      click.toClassify();
    } else {
      window.webkit.messageHandlers.toClassify.postMessage(null);
    }
  };

  // 优惠券点击事件
  handleCouponClick = () => {
    if (this.state.couponList.length === 0) {
      Taro.showToast({
        icon: 'none',
        title: '已领取优惠券',
        duration: 1500,
      });
      return;
    }
    this.receiveCoupon(this.state.couponList[0].couponId);
  };

  // 领取优惠券接口
  receiveCoupon = (couponId) => {
    CarryTokenRequest(servicePath.saveCouponRecord, {
      couponId: couponId,
      // distributionMethod: 2
    })
      .then((res) => {
        console.log('领取优惠券成功', res.data);
        if (res.data.code === 0) {
          Taro.showToast({
            title: '领取成功',
            icon: 'none',
            duration: 1000,
            success: (res) => {
              this.getCouponIndexList();
            },
          });
        } else {
          Taro.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000,
          });
        }
      })
      .catch((err) => {
        console.log('领取优惠券失败', err);
        if (err.status === 403) {
          Taro.showToast({
            title: '暂未登录',
            icon: 'none',
            duration: 1000,
            success: () => {
              Taro.removeStorageSync('JWT-Token');
              Taro.removeStorageSync('userinfo');
              setTimeout(() => {
                Taro.navigateTo({
                  url: '/pages/login/login',
                });
              }, 1000);
            },
          });
        }
      });
  };

  // 搜索框点击事件
  handleSearchInputClick = () => {
    Taro.navigateTo({
      url: '/pages/searchpage/searchpage',
    });
  };

  // tabs点击事件
  handleTabsClick = (index, namePath, e) => {
    let tabWidth = this.state.windowWidth;
    const query = Taro.createSelectorQuery();
    query.select('.tabs-item').boundingClientRect();
    query.exec((res) => {
      this.setState({
        tabScroll: e.currentTarget.offsetLeft - tabWidth / 2 + res[0].width / 2,
      });
    });
    this.setState(
      {
        tabsIndex: index,
        namePath: namePath,
        goodsList: [],
        goodsCurrent: 1,
      },
      () => {
        this.searchItemByCategoryCom(namePath);
      }
    );
  };

  // scroll滚动事件
  handleScrollEvent = () => {
    this.setState({
      tabScroll: '',
    });
  };

  // 人气爆款swiper事件
  handleSwiperEvent = (e) => {
    this.setState({
      hotCurrent: e.detail.current + 1,
    });
  };

  // 获取轮播图接口
  /* getHomePicture(confType) {
    postRequest(servicePath.homePicture, {
      confType: confType,
      current: 1,
      len: 5,
      source: 40
    })
      .then(res => {
        if (res.statusCode === 200) {
          switch(confType) {
            case 10:
              console.log("轮播图获取成功", res.data);
              this.setState({
                roaChartImg: res.data.records
              })
              break;
            default:
              break;
          }
        }
      })
      .catch(err => {
        console.log("返回数据失败", err);
      })
  } */

  // 获取商品分类接口
  getFirstList() {
    postRequest(servicePath.getFirstList)
      .then((res) => {
        console.log('获取商品父级分类成功', res.data);
        if (res.data.code === 0) {
          this.setState({
            IconList: res.data.data,
          });
        }
      })
      .catch((err) => {
        console.log('获取商品父级分类失败', err);
      });
  }

  // 获取二级分类
  getListByKey() {
    postRequest(servicePath.getListByKey, {
      key: 'WECHAT_APPLET',
      source: 40,
    })
      .then((res) => {
        console.log('获取二级分类成功', res.data);
        if (res.data.code === 0) {
          this.setState(
            {
              tabsList: res.data.data,
              namePath: res.data.data[0].namePath,
            },
            () => {
              this.searchItemByCategoryCom(res.data.data[0].namePath, 1);
            }
          );
        }
      })
      .catch((err) => {
        console.log('获取二级分类失败', err);
      });
  }

  // 获取tabs二级分类
  getIndexCategoryImg() {
    postRequest(servicePath.getIndexCategoryImg, {
      source: 40,
    })
      .then((res) => {
        console.log('获取二级分类成功', res.data);
        if (res.data.code === 0) {
          const { configCategoryList } = res.data.data;
          this.setState({
            IconList: configCategoryList,
            /* tabsIndex: index */
          });
        }
      })
      .catch((err) => {
        console.log('获取二级分类失败', err);
      });
  }

  // 获取二级分类下的商品
  searchItemByCategoryCom(name, current = 1) {
    postRequest(servicePath.searchItemByCategoryCom, {
      categoryComPath: `${name}`,
      source: 40,
      current: current,
      len: 10,
      brand: '',
      minPrice: '',
      maxPrice: '',
      sortSaleNum: -1,
      sortPrice: -1,
    })
      .then((res) => {
        console.log('获取二级分类商品成功', res.data);
        if (res.data.code === 0) {
          this.setState({
            goodsList: [...this.state.goodsList, ...res.data.data.records],
            goodsCurrent: res.data.data.current,
            goodsPages: res.data.data.pages,
          });
        }
      })
      .catch((err) => {
        console.log('获取二级分类的商品失败', err);
      });
  }

  // 获取优惠券
  getCouponIndexList() {
    CarryTokenRequest(servicePath.getCouponIndexList, ['DK0008'])
      .then((res) => {
        console.log('获取优惠券成功', res.data);
        if (res.data.code === 0) {
          this.setState({
            couponList: res.data.data,
          });
        }
      })
      .catch((err) => {
        console.log('获取优惠券失败', err);
      });
  }

  getImgLink = () => {
    this.setState({
      modalImg:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/modal-img1-zhongqiu.png',
    });
  };

  // 上拉事件
  onReachBottom() {
    if (
      this.state.goodsPages > this.state.goodsCurrent &&
      this.state.goodsList.length !== 0
    ) {
      this.searchItemByCategoryCom(
        this.state.namePath,
        this.state.goodsCurrent + 1
      );
    }
  }

  componentWillMount() {
    this.getCouponIndexList();
    const activityObj = {
      openingImage:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/home-activity-bg3-3.gif',
      specialImage:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/goods-special-bg2-2.png',
      goodsActivity1:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/home-activity1-2.png',
      goodsActivity2:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/home-activity2-2.png',
      couponImage:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/home-coupon1-3.png',
      to: '/pageAapp/activity6/activity6?source=app',
    };
    const roaChartImg = [
      {
        id: 102,
        imageUrl:
          'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/banner/banner.png',
      },
    ];
    if (utils.getDate() >= '2020-09-26 00:00') {
      this.setState({
        activityObj,
        roaChartImg,
      });
    }
  }

  componentDidMount() {
    this.getFirstList();
    this.getListByKey();
    /* this.getIndexCategoryImg(); */
    Taro.getSystemInfo({
      success: (res) => {
        this.setState({
          windowWidth: res.windowWidth,
        });
      },
    });
  }

  componentDidShow() {
    utils.updateRecommendCode(this.$router.params.shareRecommend); //绑定、存储代理码
    this.setState({
      modalImg:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/modal-img1-zhongqiu.png',
    });
  }

  config = {
    navigationBarTitleText: '爱港猫',
    usingComponents: {},
    onReachBottomDistance: 50,
  };

  render() {
    const {
      roaChartImg,
      IconList,
      tabsList,
      tabsIndex,
      tabScroll,
      goodsList,
      activityObj,
    } = this.state;
    return (
      <View>
        <View id="index">
          {/* 代理分享 */}
          <AgentShare />
          <View id="index-swiper">
            <Swiper
              className="swiper-wrap"
              autoplay={true}
              circular
              indicatorDots
              indicatorActiveColor="#ff5d8c"
              indicatorColor="#fff"
            >
              {roaChartImg.map((item, index) => (
                <SwiperItem
                  key={item.id}
                  onClick={this.handleBnnaerClick.bind(this, item.url, index)}
                >
                  <img className="swiper-item-img" src={item.imageUrl} />
                </SwiperItem>
              ))}
            </Swiper>
          </View>
          <View className="home-slogan">
            <img
              className="slogan-img"
              src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/home/banner-title.jpg"
            />
          </View>
          {/* 商品分类模块 */}
          <View id="good-category">
            <View className="category-wrap">
              {IconList.map((item) => (
                <View
                  className="category-item"
                  key={item.categoryId}
                  onClick={this.handleCategoryClick.bind(this, item)}
                >
                  <img src={item.appletIcon} />
                  <View className="item-txt">{item.name}</View>
                </View>
              ))}
            </View>
          </View>
          {/* 活动模块 */}
          <View id="good-special">
            <Navigation url={activityObj.to}>
              <img className="opening" src={activityObj.openingImage} />
            </Navigation>
            <View
              className="activity-coupon-wrap"
              style={{ backgroundImage: `url(${activityObj.specialImage})` }}
            >
              <View className="goods-activity">
                <Navigation url="/pageAapp/activity5/activity5?source=app">
                  <img src={activityObj.goodsActivity1} />
                </Navigation>
                <Navigation url="/pageAapp/activity4/activity4?source=app">
                  <img src={activityObj.goodsActivity2} />
                </Navigation>
              </View>
            </View>
          </View>
          {/* 分类 */}
          <View id="index-category">
            <ScrollView
              scrollX="true"
              className="category-tabs"
              scrollLeft={tabScroll}
              onScroll={this.handleScrollEvent}
              scrollWithAnimation
            >
              {tabsList.map((item, index) => (
                <View
                  style={{ color: index === tabsIndex ? '#ff5d8c' : null }}
                  className="tabs-item"
                  key={item.id}
                  onClick={this.handleTabsClick.bind(
                    this,
                    index,
                    item.namePath
                  )}
                >
                  <View className="item-txt">{item.name}</View>
                  <View
                    className={
                      index === tabsIndex ? 'item-active' : 'item-line'
                    }
                    style={{ display: index === tabsIndex ? 'block' : 'none' }}
                  ></View>
                </View>
              ))}
            </ScrollView>
            <View className="tabs-content">
              <GoodsList hasTitle goodsList={goodsList} />
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default Index;
