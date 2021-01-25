import Taro, { Component } from "@tarojs/taro";
import { View } from "@tarojs/components";
import "./activity3.less";
import "../../common/globalstyle.less";
import TypeList from "./components/TypeList/TypeList";
import { postRequest } from "../../common/util/request";
import servicePath from "../../common/util/api/apiUrl";
import Navigation from "../../components/Navigation/Navigation";
import dayjs from "dayjs";

/* import servicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request'; */

class Activity3 extends Component {
  state = {
    typeGoodsHeight: '', // 商品大容器高度
    goodsList: [], // 商品列表
    fistTypeList: [],
    secondTypeList: [],
    time: '',
    differArr:[],
  }

  // 根据传入的商品号列表查询商品信息集合
  getItemInfoList() {
    const arr = [
      {
        itemNo: "sp20200814108529",
      },
      {
        itemNo: "sp20200814108530",
      },
      {
        itemNo: "sp20200814108520",
      },
      {
        itemNo: "sp20200603102859",
      },
      {
        itemNo: "sp20200616103792",
      },
      {
        itemNo: "sp20200603102858",
      },
      {
        itemNo: "sp20200603102857",
      },
      {
        itemNo: "sp20200814108523",
      },
      {
        itemNo: "sp20200814108524",
      },
      {
        itemNo: "sp20200814108521",
      },
      {
        itemNo: "sp20200814108527",
      },
      {
        itemNo: "sp20200814108525",
      },
      {
        itemNo: "sp20200814108526",
      },
      {
        itemNo: "sp20200814108528",
      },
      {
        itemNo: "sp20200814108522",
      },
      {
        itemNo: "sp20200814108535",
      },
      {
        itemNo: "sp20200514100651",
      },
      {
        itemNo: "sp20200514100652",
      },
      {
        itemNo: "sp20200806107454",
      },
      {
        itemNo: "sp20200814108547",
      },
    ];
    postRequest(servicePath.itemInfoList, arr)
      .then((res) => {
        console.log("获取规定商品列表成功", res.data);
        if (res.data.code === 0) {
          this.setState(
            {
              goodsList: res.data.data,
            },
            () => {
              Taro.createSelectorQuery()
                .select(".type-goods-wrap")
                .boundingClientRect((rect) => {
                  this.setState({
                    typeGoodsHeight: rect.height - 700,
                  });
                })
                .exec();
            }
          );
        }
      })
      .catch((err) => {
        console.log("获取规定商品列表失敗", err);
      });
  }
  getFestiveItemList() {
    postRequest(servicePath.getFestiveItemList, { source: 40 })
      .then((res) => {
        console.log("获取规定商品列表成功", res.data);
        if (res.data.code === 0) {
          this.setState({
            fistTypeList: res.data.data.fistTypeList,
            secondTypeList: res.data.data.secondTypeList,
          });
        }
      })
      .catch((err) => {
        console.log("获取规定商品列表失敗", err);
      });
  }
  getCountDown() {
    postRequest(servicePath.getCountDown)
      .then((res) => {
        console.log("获取时间差成功", res.data);
        if (res.data.code === 0) {
          this.setState({
            time: res.data.data.diffTime,
            one: 22,
          });
          this.splitTime(res.data.data.diffTime);
          setInterval(() => {
            this.splitTime(this.state.time);
          }, 1000);
        }
      })
      .catch((err) => {
        console.log("获取时间差失敗", err);
      });
  }
  // 时间戳转换
  splitTime = (time) => {
    // console.log(111);
    const differ = time;
    const differArr = [];
    differArr[0] = Math.floor(differ / (1000 * 60 * 60 * 24)); // 天
    differArr[1] = Math.floor(
      (differ % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ); // 时
    differArr[2] = Math.floor((differ % (1000 * 60 * 60)) / (1000 * 60)); // 分
    differArr[3] = Math.floor((differ % (1000 * 60)) / 1000); // 秒

    differArr.forEach((item, index) => {
      if (item < 10) {
        differArr[index] = `0${item}`;
      } else {
        differArr[index] = `${item}`;
      }
    });
    const newList = [
      differArr[0].substr(0, 1),
      differArr[0].substr(-1),
      differArr[1].substr(0, 1),
      differArr[1].substr(-1),
      differArr[2].substr(0, 1),
      differArr[2].substr(-1),
      differArr[3].substr(0, 1),
      differArr[3].substr(-1),
    ];
    this.setState({
      time: differ - 1000,
      differArr: newList, // newList
    });
  };
  componentWillMount() {}

  componentDidMount() {
    this.getFestiveItemList();
    this.getCountDown();
  }

  componentWillUnmount() {}

  componentDidShow() {}

  config = {
    navigationBarTitleText: "月饼限时购",
    usingComponents: {},
  };

  render() {
    const {
      fistTypeList,
      secondTypeList,
      typeGoodsHeight,
      differArr,
      one,
    } = this.state;
    return (
      <View>
        <View id="activity3">
          <View className="activity3-banner">
            <img
              src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/activity3/banner-zhongqiu.jpg?111"
              className="banner-img"
            />
            <View className="timer">
              <div>{differArr[0]}</div>
              <div>{differArr[1]}</div>
              <div>{differArr[2]}</div>
              <div>{differArr[3]}</div>
              <div>{differArr[4]}</div>
              <div>{differArr[5]}</div>
              <div>{differArr[6]}</div>
              <div>{differArr[7]}</div>
            </View>
          </View>
          <View className="goods-content">
            {/* <View className="limit-wrap">
              <View className="limit-title">
                <img className="limit-title-img" src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/activity3/type-list1.png" />
              </View>
              <Navigation url={`/pages/goodsdetails/goodsdetails?itemId=${goodsList[19] ? goodsList[19].itemId : ""}`}>
                <View className="limit-goods">
                  <img className="limit-goods-img" src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/activity3/one-yuan-goods.jpg" />
                </View>
              </Navigation>
              <Navigation url={`/pages/goodsdetails/goodsdetails?itemId=${goodsList[0] ? goodsList[0].itemId : ""}`}>
                <View className="limit-goods">
                  <img className="limit-goods-img" src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/activity3/limit-goods1.jpg" />
                </View>
              </Navigation>
              <Navigation url={`/pages/goodsdetails/goodsdetails?itemId=${goodsList[1] ? goodsList[1].itemId : ""}`}>
                <View className="limit-goods">
                  <img className="limit-goods-img" src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/activity3/limit-goods2.jpg" />
                </View>
              </Navigation>
              <Navigation url={`/pages/goodsdetails/goodsdetails?itemId=${goodsList[2] ? goodsList[2].itemId : ""}`}>
                <View className="limit-goods">
                  <img className="limit-goods-img" src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/activity3/limit-goods3.jpg" />
                </View>
              </Navigation>
            </View> */}
            <View className="type-goods-wrap">
              <TypeList
                goodsList={fistTypeList}
                titleImage={
                  "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/activity3/type-list1-zhongqiu.png"
                }
              />
              <TypeList
                goodsList={secondTypeList}
                titleImage={
                  "https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/activity3/type-list2-zhongqiu.png"
                }
              />
              {/* <TypeList 
                goodsList={goodsList.slice(9, 15)}
                titleImage={'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/activity3/type-list3.png'} 
              />
              <TypeList 
                goodsList={goodsList.slice(15, 19)}
                titleImage={'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/activity3/type-list4.png'} 
              /> */}
            </View>
            <View className="activity-rule">
              <View className="activity-rule-title"></View>
              <View className="activity-rule-img"></View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default Activity3;
