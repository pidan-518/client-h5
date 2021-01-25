import Taro, { Component } from "@tarojs/taro";
import { View, Text, Button, Input, Navigator } from "@tarojs/components";
import servicePath from "../../common/util/api/apiUrl";
import { postRequest, CarryTokenRequest } from "../../common/util/request";
import { AtFloatLayout } from "taro-ui";
import "taro-ui/dist/style/components/float-layout.scss";
import "taro-ui/dist/style/components/tabs.scss";
import "../../common/globalstyle.less";
import "./goodsdetails.less";
import utils from "../../common/util/utils";
import GoodsSwiper from "./components/GoodsSwiper/GoodsSwiper";
import GoodsName from "./components/GoodsName/GoodsName";
import GoodsComment from "./components/GoodsComment/GoodsComment";
import GoodsInfo from "./components/GoodsInfo/GoodsInfo";
import Platform from "./components/Platform/Platfrom";

// 商品详情
class GoodsDetails extends Component {
  state = {
    cartTotal: "", // 购物车数量
    goodsSwiper: [],
    goodsImgUrl: "", // 商品图片
    swiperCurrent: 0, // 轮播图当前索引
    goodsNum: "", // 商品数量
    visible: false, // 隐藏加入购物车弹出层
    shopInfo: {}, // 店铺信息
    goodsInfo: {}, // 商品信息
    specreList: [], // 商品的类型规格数组
    specRelId: "", // 商品规格id
    specTagArr: [], // 商品规格数组
    specTagName: "", // 商品规格名
    specTagTitle: "", // 商品规格字段
    specTagIndex: 0, // 商品规格下标
    classTagArr: [], // 商品类数组
    classTagName: "", // 商品类名
    classTagTitle: "", // 商品类字段
    classTagIndex: 0, // 商品类别下标
    price: "", // 商品原价
    discountPrice: "", // 商品折扣价
    classPrice: "", // 规格商品原价价格
    classDiscountPrice: "", // 规格商品折扣价
    stockNum: "", // 商品库存
    isDismount: false, // 商品是否下架
    shopAccid: "", // 店铺IM号
    collectImg:
      "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/goodsdetails/favorites.png", // 收藏图标
    hasCollect: "", // 商品是否收藏
    goodsOrigin: "", // 商品产地图标
    expressFree: "", // 商品包邮状态
    taxFree: "", // 商品包税状态
    itemId: "", // 商品id
    purchaseQuantity: null, // 起购数量
  };

  // 左上角返回按钮
  handleNavigateBack = () => {
    Taro.navigateBack({
      delta: 1,
    });
  };

  // 点击加号事件
  handleAdd = () => {
    if (this.state.stockNum === 0) {
      Taro.showToast({
        title: "商品数量不足",
        icon: "none",
        duration: 1500,
      });
      return false;
    } else if (this.state.stockNum <= this.state.goodsNum) {
      Taro.showToast({
        title: "不能再多了哦！",
        icon: "none",
        duration: 1500,
      });
      return false;
    } else {
      this.setState({
        goodsNum: this.state.goodsNum + 1,
      });
    }
  };

  // 商品数量输入框事件
  handleStockInput = (e) => {
    this.setState({
      goodsNum: Number(e.detail.value),
    });
  };

  // 商品数量输入框失去焦点事件
  handleStockInputBlur = (e) => {
    const { purchaseQuantity } = this.state;
    const reg = /\b(0+)/gi;
    if (reg.test(e.detail.value)) {
      e.detail.value = e.detail.value.replace(/\b(0+)/gi, 1);
      this.setState({
        goodsNum: Number(e.detail.value),
      });
      return;
    } else if (e.detail.value === "") {
      e.detail.value = e.detail.value.replace("", 1);
      this.setState({
        goodsNum: Number(e.detail.value),
      });
    } else if (purchaseQuantity !== null && e.detail.value < purchaseQuantity) {
      e.detail.value = purchaseQuantity;
      this.setState({
        goodsNum: Number(e.detail.value),
      });
    }
  };

  // 点击减号事件
  handleReduce = () => {
    const { goodsNum, purchaseQuantity } = this.state;
    if (
      (goodsNum !== 1 && purchaseQuantity === null) ||
      (goodsNum > purchaseQuantity && goodsNum > 1)
    ) {
      let num = this.state.goodsNum - 1;
      this.setState({
        goodsNum: num,
      });
    } else {
      if (purchaseQuantity !== null) {
        Taro.showToast({
          title: `最少购买${purchaseQuantity}件哦！`,
          icon: "none",
          duration: 1500,
        });
      }
    }
  };

  // 加入购物车按钮点击事件
  handleCartClick = () => {
    const { purchaseQuantity } = this.state;
    this.setState({
      visible: true,
      goodsNum: purchaseQuantity ? purchaseQuantity : 1,
    });
  };

  // 加入购物车弹框交叉点击事件
  handleForkClick = () => {
    this.setState({
      visible: false,
    });
  };

  // 加入购物车弹出层Close事件
  AtFloatLayouyClose = () => {
    this.setState({
      visible: false,
    });
  };

  // 选择款式点击事件
  handleGoodStyleClick = () => {
    const { purchaseQuantity } = this.state;
    this.setState({
      visible: true,
      goodsNum: purchaseQuantity ? purchaseQuantity : 1,
    });
  };

  // 商品规格点击事件
  changeSpecTagIndex(index, item) {
    const { specreList } = this.state;
    let classTagArr = [];
    for (let idx of specreList) {
      if (idx.specName === item) {
        classTagArr.push(idx.className);
      }
      this.setState(
        {
          specTagIndex: index,
          classTagArr,
          classTagIndex: 0,
          classTagName: classTagArr[0],
          specTagName: item,
        },
        () => {
          if (
            idx.specName === this.state.specTagName &&
            idx.className === this.state.classTagName
          ) {
            this.setState(
              {
                specRelId: idx.id,
                classPrice: idx.classPrice,
                stockNum: idx.stockNum,
                classDiscountPrice:
                  idx.discountPrice !== null
                    ? idx.discountPrice
                    : idx.classPrice,
                purchaseQuantity:
                  idx.purchaseQuantity !== null ? idx.purchaseQuantity : 1,
                goodsNum:
                  idx.purchaseQuantity !== null ? idx.purchaseQuantity : 1,
              },
              () => {
                console.log(idx.purchaseQuantity, this.state.goodsNum);
              }
            );
          }
        }
      );
    }
  }

  // 商品类别点击事件
  changeClassTagIndex(index, item) {
    const { specreList } = this.state;
    for (let idx of specreList) {
      this.setState(
        {
          classTagIndex: index,
          classTagName: item,
        },
        () => {
          if (
            idx.className === this.state.classTagName &&
            idx.specName === this.state.specTagName
          ) {
            this.setState({
              specRelId: idx.id,
              classPrice: idx.classPrice,
              stockNum: idx.stockNum,
              classDiscountPrice:
                idx.discountPrice !== null ? idx.discountPrice : idx.classPrice,
              purchaseQuantity:
                idx.purchaseQuantity !== null ? idx.purchaseQuantity : 1,
            });
          }
        }
      );
    }
  }

  // 弹出层加入购物车按钮点击事件
  handleAddCart() {
    if (this.state.stockNum === 0) {
      Taro.showToast({
        title: "商品无库存，无法添加",
        icon: "none",
        duration: 1000,
      });
    } else {
      this.getShoppingCart();
    }
  }

  // 加入购物车左边图标点击事件
  handleRedirectTo(url, txt) {
    if (txt === "店铺") {
      Taro.redirectTo({
        url: `${url}?businessId=${this.state.goodsInfo.businessId}`,
      });
    } else if (txt === "联系卖家") {
      if (this.state.shopAccid) {
        CarryTokenRequest(servicePath.getUserInfo)
          .then((res) => {
            if (res.data.code === 0) {
              Taro.navigateTo({
                url: `${url}?chatTo=${this.state.shopAccid}`,
              });
            }
          })
          .catch((err) => {
            if (err.statusCode === 403) {
              Taro.showToast({
                title: "暂未登录",
                duration: 1000,
                icon: "none",
                success: () => {
                  setTimeout(() => {
                    Taro.navigateTo({
                      url: "/pages/login/login",
                    });
                  }, 1000);
                },
              });
            } else {
              Taro.showToast({
                title: err.data.msg,
                duration: 1000,
                icon: "none",
              });
            }
          });
      } else {
        Taro.showModal({
          title: "提示",
          content: "抱歉，该店铺暂不支持在线咨询",
          showCancel: false,
        });
      }
    } else {
      Taro.redirectTo({
        url: `${url}?businessId=${this.state.goodsInfo.businessId}`,
      });
      return;
    }
  }

  // 收藏图标点击事件
  handleCollectClick = () => {
    if (this.state.goodsInfo.state === 20) {
      Taro.showToast({
        title: "商品已下架",
        icon: "none",
        duration: 1000,
      });
    } else {
      if (this.state.hasCollect) {
        // 取消关注
        this.setUserAtItemRemove();
      } else {
        // 添加关注
        this.setUserAtItemAdd();
      }
    }
  };

  // 获取商品详情基本信息
  getItemDetailList(itemId) {
    postRequest(servicePath.itemDetailList, { itemId: itemId })
      .then((res) => {
        console.log("详情信息返回数据成功", res.data);
        if (res.data.code === 0) {
          const {
            state,
            categoryComPath,
            categoryBusId,
            detailVO,
            image,
            itemSpecRelList,
            price,
            discountPrice,
            sign,
            expressFree,
            taxFree,
            businessId,
          } = res.data.data;
          Taro.setStorageSync("categoryComPath", categoryComPath);
          Taro.setStorageSync("categoryBusId", categoryBusId);
          const classTagArr = [];
          const specTagArr = [];
          itemSpecRelList.forEach((item) => {
            classTagArr.push(item.className);
            specTagArr.push(item.specName);
          });
          if (state === 20) {
            this.setState(
              {
                isDismount: true,
              },
              () => {
                Taro.showModal({
                  title: "提示",
                  content: "商品已下架",
                  cancelColor: "#ff5d8c",
                  confirmText: "确认",
                  showCancel: false,
                });
              }
            );
          }
          this.setState(
            {
              goodsInfo: res.data.data,
              goodsSwiper:
                detailVO === null ? [image] : detailVO.images.split(","),
              goodsImgUrl: image,
              specreList: itemSpecRelList,
              classTagArr: this.unique(classTagArr),
              specTagArr: this.unique(specTagArr),
              specRelId: itemSpecRelList[0].id,
              specTagName: itemSpecRelList[0].specName,
              specTagTitle: itemSpecRelList[0].specTagName,
              classTagName: itemSpecRelList[0].className,
              classTagTitle: itemSpecRelList[0].classTagName,
              classPrice: itemSpecRelList[0].classPrice,
              classDiscountPrice: itemSpecRelList[0].discountPrice,
              price: price,
              discountPrice: discountPrice,
              stockNum: itemSpecRelList[0].stockNum,
              goodsOrigin: sign,
              expressFree: expressFree,
              taxFree: taxFree,
              itemId: Number(itemId),
              purchaseQuantity: itemSpecRelList[0].purchaseQuantity,
              goodsNum:
                itemSpecRelList[0].purchaseQuantity === null
                  ? 1
                  : itemSpecRelList[0].purchaseQuantity,
              isDismount:
                itemSpecRelList[0].purchaseQuantity >
                itemSpecRelList[0].stockNum
                  ? true
                  : false,
            },
            () => {
              // 查询店铺信息
              this.getShopInfoByBusinessId(businessId);
              this.getUserAtItemisFavorite(itemId);
            }
          );
        }
      })
      .catch((err) => {
        console.log("详情信息返回数据失败", err);
      });
  }

  // 加入购物车接口
  getShoppingCart() {
    CarryTokenRequest(servicePath.shoppingCart, {
      shopId: this.state.shopInfo.shopId,
      itemId: this.$router.params.itemId,
      itemNum: this.state.goodsNum === 0 ? 1 : this.state.goodsNum,
      price: this.state.discountPrice,
      itemSpecClassId: this.state.specRelId,
    })
      .then((res) => {
        console.log("加入购物车成功", res.data);
        if (res.data.code === 0) {
          Taro.showModal({
            title: "操作成功",
            content: "加入购物车成功，是否前往购物车？",
            confirmText: "去看看",
            cancelText: "继续逛逛",
            success: (res) => {
              this.setState({
                visible: false,
              });
              if (res.confirm) {
                Taro.switchTab({
                  url: "../cart/cart",
                });
              }
            },
          });
        } else {
          Taro.showToast({
            title: res.data.msg,
            duration: 1000,
            icon: "none",
          });
        }
      })
      .catch((err) => {
        if (err.statusCode === 403) {
          Taro.showToast({
            title: "请先注册/登陆后再加入购物车",
            duration: 1000,
            icon: "none",
            success: () => {
              setTimeout(() => {
                Taro.navigateTo({
                  url: "/pages/login/login",
                });
              }, 1000);
            },
          });
        } else {
          Taro.showToast({
            title: err.data.msg,
            duration: 1000,
            icon: "none",
          });
        }
        console.log("加入购物车失败", err);
      });
  }

  // 获取店铺信息
  getShopInfoByBusinessId(businessId) {
    postRequest(servicePath.getShopInfoByBusinessId, {
      businessId: businessId,
    })
      .then((res) => {
        console.log("获取店铺信息成功", res.data);
        if (res.data.code === 0) {
          this.setState({
            shopInfo: res.data.data.shopVO,
            shopAccid: res.data.data.shopVO.accid, // 店铺IM号
          });
        }
      })
      .catch((err) => {
        console.log("获取店铺信息失败", err);
      });
  }

  // 查询商品是否收藏
  getUserAtItemisFavorite(itemId) {
    Taro.request({
      url: servicePath.userAtItemisFavorite,
      method: "POST",
      data: {
        itemId: itemId,
      },
      header: {
        "Content-Type": "application/json; charset=utf-8",
        "JWT-Token": Taro.getStorageSync("JWT-Token"),
      },
      success: (res) => {
        console.log("查询收藏商品成功", res.data);
        if (res.statusCode === 200) {
          if (res.data.data === 1) {
            this.setState({
              collectImg:
                "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/goodsdetails/favorites-ac.png",
              hasCollect: true,
            });
          } else {
            this.setState({
              hasCollect: false,
            });
          }
        }
      },
    });
  }

  // 添加收藏商品
  setUserAtItemAdd() {
    CarryTokenRequest(servicePath.userAtItemAdd, {
      itemId: this.$router.params.itemId,
    })
      .then((res) => {
        console.log("添加收藏商品成功", res.data);
        if (res.data.code === 0) {
          this.setState(
            {
              collectImg:
                "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/goodsdetails/favorites-ac.png",
              hasCollect: true,
            },
            () => {
              Taro.showToast({
                title: "收藏商品成功",
                icon: "success",
                duration: 1000,
              });
            }
          );
        } else {
          Taro.showToast({
            title: "收藏商品失败",
            icon: "none",
            duration: 1000,
          });
        }
      })
      .catch((err) => {
        if (err.statusCode === 403) {
          Taro.showToast({
            title: "暂未登录",
            duration: 1000,
            icon: "none",
            success: () => {
              setTimeout(() => {
                Taro.navigateTo({
                  url: "/pages/login/login",
                });
              }, 1000);
            },
          });
        } else {
          Taro.showToast({
            title: err.data.msg,
            duration: 1000,
            icon: "none",
          });
        }
        console.log("添加收藏商品失败", err);
      });
  }

  // 取消收藏商品
  setUserAtItemRemove() {
    CarryTokenRequest(servicePath.userAtItemRemove, {
      itemId: this.$router.params.itemId,
    })
      .then((res) => {
        console.log("取消收藏商品成功", res.data);
        if (res.data.code === 0) {
          this.setState(
            {
              collectImg:
                "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/goodsdetails/favorites.png",
              hasCollect: false,
            },
            () => {
              Taro.showToast({
                title: "取消收藏成功",
                icon: "success",
                duration: 1000,
              });
            }
          );
        } else {
          Taro.showToast({
            title: "取消收藏商品失败",
            icon: "none",
            duration: 1000,
          });
        }
      })
      .catch((err) => {
        if (err.statusCode === 403) {
          Taro.showToast({
            title: "暂未登录",
            duration: 1000,
            icon: "none",
            success: () => {
              setTimeout(() => {
                Taro.navigateTo({
                  url: "/pages/login/login",
                });
              }, 1000);
            },
          });
        } else {
          Taro.showToast({
            title: err.data.msg,
            duration: 1000,
            icon: "none",
          });
        }
        console.log("取消收藏商品失败", err);
      });
  }

  //更新绑定推荐码
  updateRecommendCode = (registerRecommend) => {
    const postData = {
      // recommend: '8MO5C2'
      recommend: registerRecommend,
    };
    CarryTokenRequest(servicePath.updateRecommendCode, postData);
  };

  // 数组去重
  unique(arr) {
    return Array.from(new Set(arr));
  }

  componentWillMount() {
    this.getItemDetailList(this.$router.params.itemId);
  }

  componentDidMount() {
    const registerRecommend = this.$router.params.shareRecommend; //代理码，注册、购物分佣两用
    // this.updateRecommendCode(registerRecommend)
    Taro.setStorage({
      key: "registerRecommend",
      data: registerRecommend,
    });

    utils.updateRecommendCode(this.$router.params.shareRecommend); //绑定、存储代理码
  }

  onShareAppMessage() {
    const shareRecommend = Taro.getStorageSync("shareRecommend");
    return {
      title: "极品秒杀~快来看看吧!",
      path: `pages/goodsdetails/goodsdetails?itemId=${this.$router.params.itemId}&shareRecommend=${shareRecommend}`,
    };
  }

  config = {
    navigationStyle: "custom",
  };

  render() {
    // 加入购物车模块图标
    const cartIcon = [
      {
        iconImg: require("../../static/goodsdetails/shop-icon.png"),
        iconTxt: "店铺",
        url: "/pages/shophome/shophome",
      },
      {
        iconImg: require("../../static/goodsdetails/service-icon.png"),
        iconTxt: "联系卖家",
        url: "/IM/partials/chating/chating",
      },
    ];

    const {
      goodsSwiper,
      goodsImgUrl,
      goodsNum,
      visible,
      goodsInfo,
      specTagArr,
      classTagArr,
      specTagTitle,
      classTagTitle,
      specTagIndex,
      classTagIndex,
      specTagName,
      classTagName,
      discountPrice,
      price,
      isDismount,
      stockNum,
      classPrice,
      classDiscountPrice,
      collectImg,
      goodsOrigin,
      expressFree,
      taxFree,
      purchaseQuantity,
    } = this.state;

    return (
      <View id="goods-details">
        <View
          className="goods-details-head"
          style={{ paddingTop: `${Taro.$navBarMarginTop}px` }}
        >
          <View className="head-nav">
            <View className="return">
              <img
                onClick={this.handleNavigateBack}
                className="left-icon"
                src={require("../../static/searchpage/left.png")}
              />
            </View>
            <View className="favorites" onClick={this.handleCollectClick}>
              <img className="favorites-icon" src={collectImg} />
            </View>
          </View>
        </View>
        {/* 临时按钮 */}
        {/* <Button className="gotoHome" onClick={this.handleGotoHome}>
          前往首页
        </Button> */}
        <GoodsSwiper swiperData={goodsSwiper} />
        {/* 商品名模块 */}
        <GoodsName
          discountPrice={discountPrice}
          price={price}
          goodsName={goodsInfo.itemName}
          sign={goodsOrigin}
          signName={goodsInfo.signName}
          expressFree={expressFree}
          taxFree={taxFree}
        />
        {/* 商品规格模块 */}
        <View id="goods-style" onClick={this.handleGoodStyleClick}>
          <View className="good-style-label">选择规格</View>
          <View className="good-style-value">
            <Text className="value-txt">{`${specTagName}/${classTagName}`}</Text>
            <img src={require("../../static/goodsdetails/right.png")} />
          </View>
        </View>
        {/* 商品信息图 */}
        <GoodsInfo itemId={this.$router.params.itemId} />
        {/* 平台承诺 */}
        <Platform />
        <GoodsComment
          itemId={this.$router.params.itemId}
          businessId={goodsInfo.businessId}
        />
        {/* 加入购物车模块 */}
        <View id="cart-wrap">
          <View className="cart-icon">
            {cartIcon.map((item) => (
              <View
                className="cart-icon-item"
                key={item.iconTxt}
                onClick={this.handleRedirectTo.bind(
                  this,
                  item.url,
                  item.iconTxt
                )}
              >
                <img src={item.iconImg} />
                <Text>{item.iconTxt}</Text>
              </View>
            ))}
            <Navigator
              url="/pages/anothercart/anothercart"
              className="cart-icon-item"
            >
              <View className="cart-icon-item">
                <img src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/goodsdetails/cart-icon.png" />
                <Text>购物车</Text>
              </View>
            </Navigator>
          </View>
          <View className="cart-btn">
            <Button disabled={isDismount} onClick={this.handleCartClick}>
              加入购物车
            </Button>
          </View>
        </View>
        {/* 商品规格模块 */}
        <AtFloatLayout isOpened={visible} onClose={this.AtFloatLayouyClose}>
          <View className="goods-specrel-box">
            <img
              onClick={this.handleForkClick}
              className="fork"
              src={require("../../static/goodsdetails/fork.png")}
            />
            <View className="good-img">
              <img src={goodsImgUrl} />
              <View className="good-price">
                <Text className="price-text">
                  <Text style={{ fontWeight: "300" }}>￥ </Text>
                  <Text className="text-num">
                    {classDiscountPrice === null
                      ? classPrice
                      : classDiscountPrice}
                  </Text>
                </Text>
                <Text decode className="stock-num">
                  库存&nbsp;{stockNum}
                </Text>
                <Text className="specrel-txt" decode>
                  请选择&nbsp;&nbsp;&nbsp;款式
                </Text>
              </View>
            </View>
            {/* 规格 */}
            <View className="good-spec-wrap">
              <View className="spec-title">{specTagTitle}</View>
              <View className="spec-list">
                {specTagArr.map((item, index) => (
                  <Text
                    className={`${
                      specTagIndex === index ? "spec-item-ac" : "spec-item"
                    }`}
                    key={index}
                    onClick={this.changeSpecTagIndex.bind(this, index, item)}
                  >
                    {item}
                  </Text>
                ))}
              </View>
            </View>
            {/* 类别 */}
            <View className="good-classTag-wrap">
              <View className="classTag-title">{classTagTitle}</View>
              <View className="classTag-list">
                {classTagArr.map((item, index) => (
                  <Text
                    key={index}
                    className={`${
                      classTagIndex === index
                        ? "classTag-item-ac"
                        : "classTag-item"
                    }`}
                    onClick={this.changeClassTagIndex.bind(this, index, item)}
                  >
                    {item}
                  </Text>
                ))}
              </View>
            </View>
            {/* 添加商品数量模块 */}
            <View className="goods-stock">
              <Text className="stock-label">数量：</Text>
              <View className="right-box">
                {purchaseQuantity === null ? (
                  ""
                ) : (
                  <Text className="purchase-quantity">
                    （{purchaseQuantity}件起购）
                  </Text>
                )}

                <View className="stock-box">
                  <View
                    style={{
                      color:
                        purchaseQuantity === null
                          ? "#ff5d8c"
                          : goodsNum > purchaseQuantity
                          ? "#ff5d8c"
                          : "#ccc",
                    }}
                    className="decrease"
                    onClick={this.handleReduce}
                  >
                    -
                  </View>
                  <Input
                    className="stock-input"
                    type="number"
                    maxLength="2"
                    onInput={this.handleStockInput.bind(this)}
                    onBlur={this.handleStockInputBlur.bind(this)}
                    value={goodsNum}
                  />
                  <View className="increase" onClick={this.handleAdd}>
                    +
                  </View>
                </View>
              </View>
            </View>
            <View className="Add-cart-btn">
              <Button disabled={isDismount} onClick={this.handleAddCart}>
                加入购物车
              </Button>
            </View>
          </View>
        </AtFloatLayout>
      </View>
    );
  }
}

export default GoodsDetails;
