import Taro, { Component } from "@tarojs/taro";
import { View, Text, Button, Input } from "@tarojs/components";
import { AtFloatLayout } from "taro-ui";
import "taro-ui/dist/style/components/float-layout.scss";
import ServicePath from "../../common/util/api/apiUrl";
import { CarryTokenRequest } from "../../common/util/request";
import "../../common/globalstyle.less";
import "./drpgoodsdetails.less";
import Swiper from "swiper";
import "swiper/css/swiper.css";
import GoodsName from "../../pages/goodsdetails/components/GoodsName/GoodsName";
import GoodsSwiper from "../../pages/goodsdetails/components/GoodsSwiper/GoodsSwiper";
import Platform from "../../pages/goodsdetails/components/Platform/Platfrom";
import GoodsInfo from "../../pages/goodsdetails/components/GoodsInfo/GoodsInfo";

export default class DrpGoodsDetails extends Component {
  state = {
    imgUrl: "", //商品图片
    name: "", //商品名
    introduction: "", //商品介绍
    detail: {
      imageList: [],
    }, //商品详情
    specTagName: "", //主规格名
    selectSpecName: "", //选中主规格
    classTagName: "", //子规格名
    selectClassName: "", //选中子规格
    visiSpec: false, //显示规格框
    itemSpecClassId: 0, //选中规格id
    drpRecommend: "", //代理邀请码
    swiperCurrent: 1, // swiper当前索引
    discountPrice: "", // 商品打折价格
    stockNum: "", // 商品库存
    specreList: [], // 规格列表
    classTagArr: [], // 子规格列表
    specTagArr: [], // 主规格列表
  };

  //获取商品详情
  agentGoodDetail = () => {
    const drpRecommend = window.sessionStorage.getItem("drpRecommend");
    const itemId = JSON.parse(this.$router.params.itemId);
    const postData = {
      itemId: itemId,
    };
    CarryTokenRequest(ServicePath.agentGoodDetail, postData).then((res) => {
      if (res.data.code === 0) {
        const data = res.data.data;
        let itemSpecList = data.itemSpecList;
        /* 规格列表重组 */
        let classTagArr = [];
        let specTagArr = [];
        itemSpecList.forEach((itemSpec) => {
          classTagArr.push(itemSpec.className);
          specTagArr.push(itemSpec.specName);
        });
        this.setState(
          {
            detail: data,
            classTagArr: Array.from(new Set(classTagArr)),
            specTagArr: Array.from(new Set(specTagArr)),
            specreList: itemSpecList,
            specTagName: itemSpecList[0].specTagName, //主规格名
            classTagName: itemSpecList[0].classTagName, //子规格名
            selectSpecName: itemSpecList[0].specName, //选中的规格名
            selectClassName: itemSpecList[0].className, //选中的子规格名
            itemSpecClassId: itemSpecList[0].id, //选中的子规格名
            discountPrice: itemSpecList[0].discountPrice,
            stockNum: itemSpecList[0].stockNum,
            drpRecommend: drpRecommend !== "undefined" ? drpRecommend : "", //代理人邀请码
          },
          () => {
            this.initSwiper();
          }
        );
      } else {
        Taro.showModal({
          title: "提示",
          content: res.data.msg,
          showCancel: false,
        });
      }
    });
  };

  // 选择款式点击事件
  handleGoodStyleClick = () => {
    this.setState({
      visiSpec: true,
    });
  };

  // 关闭规格弹框
  handleForkClick = () => {
    this.setState({
      visiSpec: false,
    });
  };

  // 规格弹框关闭事件
  AtFloatLayoutOnClose = () => {
    this.setState({
      visiSpec: false,
    });
  };

  //点击选择规格事件
  handleChooseSpec = () => {
    this.setState({
      visiSpec: true,
    });
  };

  //点击选择规格事件
  handleChooseSpec = () => {
    this.setState({
      visiSpec: true,
    });
  };

  //选择主规格事件
  handleChangeSpec = (specName) => {
    const { specreList, selectClassName } = this.state;
    for (let idx of specreList) {
      if (idx.specName === specName && idx.className === selectClassName) {
        this.setState({
          selectSpecName: specName,
          itemSpecClassId: idx.id,
          stockNum: idx.stockNum,
          discountPrice:
            idx.discountPrice !== null ? idx.discountPrice : idx.classPrice,
        });
      }
    }
  };

  //选择子规格事件
  handleChangeClass = (itemClass) => {
    const { specreList, selectSpecName } = this.state;
    for (let idx of specreList) {
      if (idx.className === itemClass && idx.specName === selectSpecName) {
        this.setState({
          selectClassName: itemClass,
          itemSpecClassId: idx.id,
          stockNum: idx.stockNum,
          discountPrice:
            idx.discountPrice !== null ? idx.discountPrice : idx.classPrice,
        });
      }
    }
  };

  //点击购买事件
  handleBuy = () => {
    const { stockNum } = this.state;
    if (stockNum === 0) {
      Taro.showToast({
        title: "库存不足",
        icon: "none",
        duration: 1500,
      });
      return;
    }

    if (window.sessionStorage.getItem("system") === "android") {
      click.toCommitOrder(
        this.$router.params.itemId,
        this.state.itemSpecClassId,
        1,
        this.state.drpRecommend
      );
    } else {
      const params = {
        itemId: this.$router.params.itemId,
        itemSpecClassId: this.state.itemSpecClassId,
        num: 1,
        recommendCode: this.state.drpRecommend,
      };
      window.webkit.messageHandlers.toCommitOrder.postMessage(params);
    }
  };

  //结束填写邀请码事件
  changeDrpRecommend = (e) => {
    this.setState({
      drpRecommend: e.target.value,
    });
  };

  initSwiper = () => {
    let that = this;
    this.swiper1 = new Swiper(".swiper-banner", {
      on: {
        click: (e) => {
          e.preventDefault();
          e.stopPropagation();
          let url = e.target.getAttribute("data-jumpurl");
          Taro.previewImage({
            current: url,
            urls: this.state.detail.imageList,
          });
        },
        slideChange: function() {
          that.setState({
            swiperCurrent: this.realIndex + 1,
          });
        },
      },
      loop: true,
      preventLinksPropagation: false,
      autoplay: {
        disableOnInteraction: false,
      },
      observer: true, //修改swiper自己或子元素时，自动初始化swiper    重要
      observeParents: true, //修改swiper的父元素时，自动初始化swiper  重要
    });
    this.swiper1.init();
  };

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: "商品详情",
    });
  }

  componentDidShow() {
    this.agentGoodDetail();
  }

  componentDidHide() {}

  render() {
    const {
      detail,
      specTagName,
      classTagName,
      visiSpec,
      /* price, */
      discountPrice,
      selectSpecName,
      selectClassName,
      drpRecommend,
      stockNum,
      specTagArr,
      classTagArr,
      swiperCurrent,
    } = this.state;

    return (
      <View className="drpGoodsDetails">
        {/* 商品信息 */}
        <View className="swiper-box">
          <View className="goods-swiper-pagenumber">
            <Text className="current-number">{swiperCurrent}</Text> /{" "}
            {detail.imageList.length}
          </View>
          <View className="swiper-banner">
            <View className="swiper-wrapper">
              {detail.imageList.map((item) => (
                <View className="swiper-slide" key={item}>
                  <img
                    className="swiper-item-img"
                    data-jumpUrl={item}
                    src={item}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
        <GoodsName
          discountPrice={detail.discountPrice}
          goodsName={detail.itemName}
          signName={detail.name}
          sign={detail.sign}
          expressFree={detail.expressFree}
          taxFree={detail.taxFree}
        />
        {/* 选择规格框 */}
        <View className="goods-style" onClick={this.handleGoodStyleClick}>
          <View className="good-style-label">选择规格</View>
          <View className="good-style-value">
            <Text className="value-txt">{`${selectSpecName}/${selectClassName}`}</Text>
            <img
              className="right-icon"
              src={require("../../static/goodsdetails/right.png")}
            />
          </View>
        </View>
        <GoodsInfo itemId={this.$router.params.itemId} />

        {/* 规格框入口 */}
        <View className="spec_ctl_wrap">
          <Button className="spec_ctl" onClick={this.handleChooseSpec}>
            选择规格
          </Button>
        </View>

        {/* 规格框 */}
        <AtFloatLayout
          isOpened={visiSpec}
          className="spec_wrap"
          onClose={this.AtFloatLayoutOnClose}
        >
          <View className="drp-goods-info">
            <img
              onClick={this.handleForkClick}
              className="fork"
              src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/common/fork.png"
            />
            <View className="goods-img-box">
              <img className="goods-img" src={detail.image} />
            </View>
            <View className="goods-name-box">
              <View
                style={{
                  display: "-webkit-box",
                  "-webkit-box-orient": "vertical",
                  "-webkit-line-clamp": 2,
                  overflow: "hidden",
                }}
                className="goods-name-text"
              >
                {detail.itemName}
              </View>
              <View className="goods-price">
                <Text className="price-symbol">￥</Text>
                <Text className="price-text">{discountPrice}</Text>
              </View>
              <View className="goods-stockNum">库存：{stockNum}</View>
            </View>
          </View>
          <View className="spec_module_list">
            {/* 主规格 */}
            <View className="spec_module spec">
              <Text className="title">{specTagName}</Text>
              <View className="spec_item_list">
                {specTagArr.map((itemRecomSpec) => {
                  return (
                    <Button
                      key={itemRecomSpec}
                      className={`spec_item ${
                        itemRecomSpec === selectSpecName ? "select" : ""
                      }`}
                      onClick={this.handleChangeSpec.bind(this, itemRecomSpec)}
                    >
                      {itemRecomSpec}
                    </Button>
                  );
                })}
              </View>
            </View>
            {/* 子规格 */}
            <View className="spec_module spec">
              <Text className="title">{classTagName}</Text>
              <View className="spec_item_list">
                {classTagArr.map((itemClass) => {
                  return (
                    <Button
                      className={`spec_item ${
                        itemClass === selectClassName ? "select" : ""
                      }`}
                      onClick={this.handleChangeClass.bind(this, itemClass)}
                    >
                      {itemClass}
                    </Button>
                  );
                })}
              </View>
            </View>
          </View>
          {/* 购买 */}
          <View className="buy_wrap">
            <View className="drpRecommend_warp">
              代理人邀请码：
              <Input
                className="drpRecommend"
                onInput={(e) => {
                  this.changeDrpRecommend(e);
                }}
                onBlur={(e) => {
                  this.changeDrpRecommend(e);
                }}
                value={drpRecommend}
                placeholder="请输入代理人邀请码"
                maxLength="10"
              />
            </View>
            <Button className="buy" onClick={this.handleBuy}>
              购买
            </Button>
          </View>
        </AtFloatLayout>
      </View>
    );
  }
}
