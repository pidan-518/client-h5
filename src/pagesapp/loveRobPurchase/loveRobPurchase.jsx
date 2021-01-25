import Taro, { Component } from "@tarojs/taro";
import { View, Text, Image, Swiper, SwiperItem } from "@tarojs/components";
import servicePath from "../../common/util/api/apiUrl"; //接口
import { postRequest } from "../../common/util/request";
import utils from "../../common/util/utils";
import SwiperView from "swiper"; //seiper.js
import Loading from "../loveRobPurchase/components/Loading/Loading"; //加载中组件
import "./loveRobPurchase.less";
import "swiper/css/swiper.css";
import GoodsList from "@/components/GoodsList/GoodsList";

class loveRobPurchase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activityTag: "PANIC_BUYING", //活动标签-爱抢购
      source: 50,
      system: window.sessionStorage.getItem("system"),
      tabIn: 0, //tabs id
      goodsIn: 0, //商品列表 id
      currentPage: 1, //当前页
      pageTotal: 1, //总页数
      loading: false, //上拉加载动画
      line: true, //到底显示
      activityList: [{}], //活动列表数据
      goodsList: [], //商品列表数据
      tabTimeList: [], //时间tab数据
      activityId: [], //活动ID
      activeState: [], //活动状态
      tabIndex: 0, //商品列表id  试试
      current: 0, //分页切换
      sessionsId: [], //活动场次id
      // startTime: [], //开始时间
      // endTime: [], //结束时间
    };

    this.swiper1 = null;
  }
  componentWillMount() {
    // console.log(this.$router.params);
  }

  componentDidMount() {
    // console.log("一进来的时间下标", this.state.tabIn);
    let classCurrent = this.state.tabIn;
    // console.log("分页下标", classCurrent);

    // console.log(new Date().getHours() + ":00");

    // 假设app跳转传过来的参数为：0
    let actId = this.$router.params.activityId; //app首页传的对应场次的值
    let sessionsId = this.$router.params.sessionsId; //传的值
    // let startTime = decodeURI(this.$router.params.startTime);
    // let endTime = decodeURI(this.$router.params.endTime);
    let Swiperindex = null;

    // 获取活动接口
    postRequest(servicePath.getActivitiesList, {
      activityTag: this.state.activityTag,
      source: this.state.source,
    })
      .then((res) => {
        let timeList = res.data.data; //自定义获取到的数据

        //遍历数据
        timeList.forEach((e, index) => {
          timeList[index].startTimes = e.startTime.split(" ")[1].slice(0, 5); //截取  小时-分
          if (
            actId == e.activityId &&
            sessionsId == e.sessionsId
            // startTime == e.startTime &&
            // endTime == e.endTime
          ) {
            // console.log("当前下标", index);
            Swiperindex = index;
          }
        });

        if (window.sessionStorage.getItem("tabIn")) {
          //接口判断如果有
          Swiperindex = Number(window.sessionStorage.getItem("tabIn")); //使高亮下标相等
        }

        if (Swiperindex == null) {
          Swiperindex = 0;
          // console.log(Swiperindex);
        }

        // console.log("页面初始化获取时间列表：", res.data.data);

        // 根据活动id，发送请求获得商品列表
        this.getActivityItemId(
          1,
          {
            activityId: timeList[Swiperindex].activityId,
            sessionsId: timeList[Swiperindex].sessionsId,
            // startTime: timeList[Swiperindex].startTime,
            // endTime: timeList[Swiperindex].endTime,
          },
          () => {}
        );

        // 检测是否无数据
        this.onReachBottom();

        // // 判断进入活动页后的活动状态
        // if (timeList[Swiperindex].activeState === 2) {
        //   Taro.switchTab({
        //     url: `/pages/index/index`,
        //   });
        // }

        this.setState(
          {
            tabIn: Swiperindex, // 高亮下标
            activityList: timeList, // 将自定义的数据赋值给 state 中的activityList
            sessionsId: timeList[Swiperindex].sessionsId,
            // startTime: timeList[Swiperindex].startTime,
            // endTime: timeList[Swiperindex].endTime,
          },
          () => {
            this.initSwiper1();
            // // 判断传值的活动id是否相等或不存在
            // if (actId !== String(this.state.activityId) || actId == undefined) {
            //   Taro.switchTab({
            //     url: `/pages/index/index`,
            //   });
            // }
            // console.log("传过来的id", actId);
            // console.log("现在的id", String(this.state.activityId));
          }
        );
      })
      .catch((err) => {});
  }

  componentWillUnmount() {}

  componentDidShow() {
    utils.updateRecommendCode(this.$router.params.shareRecommend); //代理人
  }

  componentDidHide() {
    window.sessionStorage.setItem("tabIn", ""); //清空
  }

  // 据活动ID分页查询活动商品接口
  getActivityItemId(currentPage = 1, param = {}) {
    postRequest(servicePath.getActivityItemId, {
      source: 50,
      current: currentPage,
      len: 5,
      activityId: param.activityId, //this.state.activityId//68//, //
      sessionsId: param.sessionsId,
      // startTime: param.startTime,
      // endTime: param.endTime,
      // pages: pageTotal,
    })
      .then((res) => {
        // console.log("根据场次获取商品成功：", res.data.data);
        this.setState(
          {
            goodsList: [...this.state.goodsList, ...res.data.data.records], //商品列表
            currentPage: res.data.data.current, //当前页
            pageTotal: res.data.data.pages, //总页数
            // tabIndex: this.state.tabIn
          }
          // () => console.log("总页数", this.state.tabIndex)
        );
      })
      .catch((res) => {});
  }

  // 上拉加载
  onReachBottom() {
    this.setState({
      loading: false,
      line: false,
    });
    // console.log("上拉");

    // const requestCurrent = this.state.currentPage + 1
    if (this.state.currentPage < this.state.pageTotal) {
      const ind = this.state.tabIn;
      const actId = this.state.activityList[ind];
      this.getActivityItemId(this.state.currentPage + 1, actId);
      this.setState({
        loading: true,
        line: true,
        // currentPage: requestCurrent,  //当前页
      });
    } else {
      this.setState({ line: false, loading: false });
      // console.log("到底了");
    }
  }

  // 点击获取当前 抢购时间的滑块
  getSelect = (index) => {
    window.sessionStorage.setItem("tabIn", index); //存高亮(被点击)index
    if (this.state.tabIn != index) {
      const actId = this.state.activityList[index].activityId;
      const sessionsId = this.state.activityList[index].sessionsId;
      // const startime = this.state.activityList[index].startTime;
      // const endtime = this.state.activityList[index].endTime;
      this.setState(
        {
          currentPage: 1,
          goodsList: [], //每次点击清空
          line: false, // 切换场次的时候，底部提示应该重置
          activityId: this.state.tabIn, //活动 id = tabs id
          tabIn: index,
          classCurrent: index,
          activityId: actId,
          sessionsId: sessionsId,
          // startTime: startime,
          // endTime: endtime,
          // tabIndex: this.state.classCurrent,
        },
        () => {
          this.getActivityItemId(1, {
            activityId: actId,
            sessionsId: sessionsId,
            // startTime: startime,
            // endTime: endtime,
          });
          this.swiper1.slideTo(index, 600, false); //切换到对应的slide，速度为1秒
          Taro.pageScrollTo({ scrollTop: 0 });
        }
      );
    }
  };

  // 监听商品页面滑块
  changeContent = (e) => {
    const ind = e.detail.current;
    this.getSelect(ind);
    this.setState({
      tabIn: ind,
    });
  };

  //去抢购跳app商品详情页面
  handleClickGood = (item) => {
    if (item.itemId) {
      if (window.sessionStorage.getItem("system") === "android") {
        click.toGoodsDetail(item.itemId);
        console.log("android");
      } else {
        window.webkit.messageHandlers.toGoodsDetail.postMessage(item.itemId);
        console.log("ios");
      }
    } else {
      Taro.showToast({
        title: "参数出现null",
        icon: "none",
      });
    }
  };

  initSwiper1() {
    const _this = this;
    this.swiper1 = new SwiperView("#swiper1", {
      initialSlide: this.state.tabIn,
      observer: true, //修改swiper自己或子元素时，自动初始化swiper    重要
      observeParents: true, //修改swiper的父元素时，自动初始化swiper  重要
      // setWrapperSize: true,
      on: {
        slideChange: function() {
          _this.getSelect(this.activeIndex);
        },
      },
    });
    this.swiper1.init();
  }

  // 分享小程序
  // onShareAppMessage() {
  //   const shareRecommend = Taro.getStorageSync("shareRecommend");
  //   const activityId = this.state.activityId;
  //   return {
  //     title: "【爱抢购】百款商品超低价，每日定时开抢！",
  //     path: `pages/loveRobPurchase/loveRobPurchase?shareRecommend=${shareRecommend}&activityId=${activityId}`,
  //     imageUrl:
  //       "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/share/love-image.jpg",
  //   };
  // }

  config = {
    navigationBarTitleText: "爱抢购",
    onReachBottomDistance: 20, //设置距离底部距离(监听页面滑动)
  };

  render() {
    const {
      activityList,
      goodsList,
      timeList,
      contentList,
      contentPageList,
    } = this.state;

    return (
      //爱抢购 页面
      <View className="try">
        {/* 抢购时间开始 */}
        <Swiper
          className="robTimes"
          displayMultipleItems="5"
          current={this.state.tabIn} // - 2
        >
          {activityList.map((item, index) => {
            return (
              <SwiperItem className="timeItem">
                <View
                  className={
                    this.state.tabIn == index ? "active" : "robTimes-item"
                  }
                  onClick={this.getSelect.bind(this, index)}
                >
                  <Text
                    className="item-time"
                    // id={item}
                  >
                    {/* {item}  */}
                    {/* {item.activeState == 2 ? '' : item.startTime} */}
                    {item.startTimes}
                  </Text>
                  <Text className="item-text">
                    {/* 即将开始{" "} */}
                    {/* {item.activeState == 1 ? item.activitySession : item.activeState == 0 ? item.activitySession : null} */}
                    {item.activitySession}
                  </Text>
                </View>
              </SwiperItem>
            );
          })}
        </Swiper>
        {/* 抢购时间结束 */}
        {/* 商品页面开始 */}
        {this.state.activityList[this.state.tabIn].activeState == 0 ? (
          <Text className="mask-title1">即将开始</Text>
        ) : this.state.activityList[this.state.tabIn].activeState == 2 ? (
          <Text className="mask-title2">抢购已结束</Text>
        ) : null}
        <View className="bgColor">
          <View id="swiper1">
            <View className="swiper-wrapper">
              {activityList.map((item, index) => {
                return (
                  <View
                    className={
                      this.state.activityList[this.state.tabIn].activeState == 0
                        ? "swiper-slide robGoods-hide"
                        : "swiper-slide"
                    }
                  >
                    {(this.state.activityList[this.state.tabIn].activeState ==
                      0 &&
                      index === this.state.tabIn) ||
                    (this.state.activityList[this.state.tabIn].activeState ==
                      2 &&
                      index === this.state.tabIn) ? (
                      <View className="robGoods-mask"></View>
                    ) : null}
                    {index === this.state.tabIn ? (
                      <View className="robGoods-list">
                        {goodsList.map((item, ind) => {
                          return (
                            <View
                              className="list-item"
                              onClick={this.handleClickGood.bind(this, item)}
                            >
                              <View className="item-left">
                                <Image
                                  className="goodsImg"
                                  src={utils.transWebp(item.itemImage)}
                                />
                              </View>
                              <View className="item-right">
                                <View
                                  className="right-top"
                                  style={{ "-webkit-box-orient": "vertical" }}
                                >
                                  {/* 商品名称 */}
                                  {item.itemName}
                                </View>
                                <View
                                  className="right-middle"
                                  style={{ "-webkit-box-orient": "vertical" }}
                                >
                                  {item.itemIntro}
                                </View>
                                <View className="right-bottom">
                                  <View className="activity-price">
                                    ￥
                                    {item.promotionPrice == null
                                      ? item.discountPrice
                                      : item.promotionPrice}
                                  </View>
                                  <View
                                    className="price"
                                    style={{
                                      display:
                                        item.discountPrice === item.price
                                          ? "none"
                                          : null,
                                    }}
                                  >
                                    ￥{item.price}
                                  </View>
                                  <View className="redirect">去抢购</View>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    ) : null}
                    {this.state.goodsList.length != 0 ? (
                      <View>
                        <View className="no-more" hidden={this.state.line}>
                          -没有更多啦-
                        </View>
                        {this.state.line === true ? (
                          <Loading color={"#fff"}></Loading>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
        {/* 商品页面结束 */}
      </View>
    );
  }
}

export default loveRobPurchase;
