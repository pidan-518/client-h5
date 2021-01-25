import Taro, { Component } from "@tarojs/taro";
import { View, ScrollView } from "@tarojs/components";
import "./twocategory.less";
import "../../common/globalstyle.less";
import { postRequest } from "../../common/util/request";
import servicePath from "../../common/util/api/apiUrl";
import Banner from "./components/Banner/Banner";
import GoodsScroll from "./components/GoodsScroll/GoodsScroll";
import GuessGoods from "./components/GuessGoods/GuessGoods";

// 品牌代购
class TwoCategory extends Component {
  state = {
    tabsList: [], // 分类tab数据
    goodsScrollTitles: [
      "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/twocategory/goods-scroll-title1.png",
      "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/twocategory/goods-scroll-title2.png",
      "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/twocategory/goods-scroll-title3.png",
      "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/twocategory/goods-scroll-title4.png",
      "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/twocategory/goods-scroll-title5.png",
      "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/twocategory/goods-scroll-title6.png",
      "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/twocategory/goods-scroll-title7.png",
      "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/twocategory/goods-scroll-title8.png",
      "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/twocategory/goods-scroll-title9.png",
      "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/twocategory/goods-scroll-title10.png",
    ],
    goodsScrollTitle: "",
    bannerImg: "", // 二级分类banner
    tabsIndex: 0,
    tabScroll: "",
    twoCategoryImage: [], // 三级分类
    newItemList: [], // 新品首发商品
    hotItemList: [], // 爆款商品
    parItemList: [], // 天天平价
    guessGoodsList: [], //
    guessGoodsPages: 1, // 推荐商品总页数
    guessGoodsCurrent: 1, // 推荐商品当前页
    categoryId: sessionStorage.getItem("categoryId")
      ? sessionStorage.getItem("categoryId")
      : this.$router.params.id, // 分类Id
  };

  // tabs点击事件
  handleTabsClick = (index, categoryId, e) => {
    let tabWidth = this.state.windowWidth;
    sessionStorage.setItem("categoryId", categoryId);
    const query = Taro.createSelectorQuery();
    query.select(".tabs-item").boundingClientRect();
    query.exec((res) => {
      this.setState(
        {
          tabScroll:
            e.currentTarget.offsetLeft - tabWidth / 2 + res[0].width / 2,
          tabsIndex: index,
          guessGoodsList: [],
          guessGoodsPages: 1,
          guessGoodsCurrent: 1,
          categoryId: categoryId,
          goodsScrollTitle: this.state.goodsScrollTitles[index],
        },
        () => {
          this.getSencondCategory(categoryId);
          this.getThirdCategory(categoryId);
        }
      );
    });
  };

  // banner点击事件
  handleBnnaerClick = () => {};

  // 获取tabs二级分类
  getIndexCategoryImg() {
    const categoryId = sessionStorage.getItem("categoryId")
      ? sessionStorage.getItem("categoryId")
      : this.$router.params.id;
    postRequest(servicePath.getIndexCategoryImg, {
      source: 50,
    })
      .then((res) => {
        console.log("获取二级分类成功", res.data);
        if (res.data.code === 0) {
          const { configCategoryList } = res.data.data;
          configCategoryList.forEach((item, index) => {
            if (item.categoryId == categoryId) {
              console.log("进入");
              this.setState(
                {
                  tabsList: configCategoryList,
                  tabsIndex: index,
                  goodsScrollTitle: this.state.goodsScrollTitles[index],
                },
                () => {
                  let tabWidth = this.state.windowWidth;
                  const tabsItem = document.getElementsByClassName("tabs-item");
                  const query = Taro.createSelectorQuery();
                  query.select(".tabs-item").boundingClientRect();
                  query.exec((res) => {
                    console.log(res);
                    let offsetLeft = tabsItem[index].offsetLeft;
                    if (index !== 0) {
                      this.setState({
                        tabScroll: offsetLeft - tabWidth / 2 + res[0].width / 2,
                      });
                    }
                  });
                  this.getSencondCategory(categoryId);
                  this.getThirdCategory(categoryId);
                }
              );
            }
          });
        }
      })
      .catch((err) => {
        console.log("获取二级分类失败", err);
      });
  }

  // 获取配置二级页面详情（banner+二级分类图标+新品模块+爆品模块+天天平价）
  getSencondCategory(categoryId = this.$router.params.id) {
    postRequest(servicePath.getSencondCategory, {
      categoryId: categoryId,
      source: 50,
    })
      .then((res) => {
        console.log("获取二级页面数据成功", res.data);
        if (res.data.code === 0) {
          const {
            configCategoryList,
            newItemList,
            hotItemList,
            parItemList,
          } = res.data.data;
          this.setState({
            twoCategoryImage: configCategoryList,
            newItemList: newItemList,
            hotItemList: hotItemList,
            parItemList: parItemList,
          });
        }
      })
      .catch((err) => {
        console.log("获取二级页面数据异常", err);
      });
  }

  // 获取推荐模块商品
  getThirdCategory(categoryId, current = 1) {
    postRequest(servicePath.getThirdCategory, {
      categoryId: categoryId,
      len: 10,
      current: current,
      type: 1,
      source: 50,
    })
      .then((res) => {
        console.log("获取推荐模块商品成功", res.data);
        if (res.data.code === 0) {
          this.setState({
            guessGoodsList: [
              ...this.state.guessGoodsList,
              ...res.data.data.records,
            ],
            guessGoodsPages: res.data.data.pages,
            guessGoodsCurrent: res.data.data.current,
          });
        }
      })
      .catch((err) => {
        console.log("获取推荐模块商品失败", err);
      });
  }

  // 上拉事件
  onReachBottom() {
    const {
      guessGoodsPages,
      guessGoodsCurrent,
      tabsList,
      tabsIndex,
    } = this.state;
    if (guessGoodsPages > guessGoodsCurrent) {
      this.getThirdCategory(
        tabsList[tabsIndex].categoryId,
        guessGoodsCurrent + 1
      );
    }
  }

  componentWillMount() {}

  componentDidMount() {
    Taro.getSystemInfo({
      success: (res) => {
        this.setState({
          windowWidth: res.windowWidth,
        });
      },
    });
    this.getIndexCategoryImg();
  }

  componentDidUpdate() {}

  componentWillUnmount() {}

  componentDidShow() {}

  config = {
    navigationBarTitleText: "",
    usingComponents: {},
    navigationStyle: "custom",
  };

  render() {
    const {
      tabsList,
      tabsIndex,
      tabScroll,
      twoCategoryImage,
      newItemList,
      hotItemList,
      parItemList,
      guessGoodsList,
      categoryId,
      goodsScrollTitle,
    } = this.state;
    return (
      <View>
        <View id="two-category">
          <View id="category-tabs">
            <ScrollView
              scrollX="true"
              className="category-tabs"
              scrollLeft={tabScroll}
            >
              {tabsList.map((item, index) => (
                <View
                  style={{ color: index === tabsIndex ? "#ff5d8c" : null }}
                  className="tabs-item"
                  key={item.id}
                  onClick={this.handleTabsClick.bind(
                    this,
                    index,
                    item.categoryId
                  )}
                >
                  <View className="item-txt">{item.categoryName}</View>
                  <View
                    className={
                      index === tabsIndex ? "item-active" : "item-line"
                    }
                    style={{ display: index === tabsIndex ? "block" : "none" }}
                  ></View>
                </View>
              ))}
            </ScrollView>
          </View>
          <Banner
            twoCategoryImage={twoCategoryImage}
            categoryId={categoryId}
            bannerImg={tabsList[tabsIndex] ? tabsList[tabsIndex].banner : ""}
          />
          <GoodsScroll
            titleImg={goodsScrollTitle}
            goodsData={newItemList}
            title="新品首发"
          />
          <GoodsScroll
            titleImg={goodsScrollTitle}
            goodsData={hotItemList}
            title="人气推荐"
          />
          <GoodsScroll
            titleImg={goodsScrollTitle}
            goodsData={parItemList}
            title="平价好物"
          />
          <GuessGoods titleImg={goodsScrollTitle} goodsData={guessGoodsList} />
        </View>
      </View>
    );
  }
}

export default TwoCategory;
