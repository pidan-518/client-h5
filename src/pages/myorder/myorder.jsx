import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button, Input } from '@tarojs/components'
import "./myorder.less";
import "../../common/globalstyle.less";
import { CarryTokenRequest } from '../../common/util/request';
import servicePath from '../../common/util/api/apiUrl';
import Navigation from '../../components/Navigation/Navigation';
import CommonEmpty from '../../components/CommonEmpty/CommonEmpty';

// 我的订单
class MyOrder extends Component {
  constructor(props) {
    super(props);

    this.handlePagination = this.handlePagination.bind(this);
    this.handleConfirmReceiving = this.handleConfirmReceiving.bind(this);
    this.handleModalOkClick = this.handleModalOkClick.bind(this);
    this.handleModalCancelClick = this.handleModalCancelClick.bind(this);
    this.handleModalInput = this.handleModalInput.bind(this);

    this.state = {
      newItems: [], // 精品推荐
      orderCurrent: 1, // 订单当前页数
      orderTotal: 1, // 订单总数
      pageTotal: 1, // 订单总数
      orderList: [], // 订单列表
      mycollList: [], // 获取我的收藏
      LikeItems: [], // 猜你喜欢
      isVisible: false, // 确认收货弹框
      orderNo: "", // 确认收货传给后台的订单号（已弃用）
      packagingNo: 0, //确认收货传给后台的包裹号
      confirmPassword: "", // 确认收货密码
      visiOrderStatus: false, // 查看物流弹框
      currentItemParket: {},  // 物流弹框对应包裹项
      isEmpty: true, // 订单列表是否为空
      visiMask: false, // 是否显示遮罩
      visiReceiveConfirm: false, // 是否显示确认收货弹框
    }
  } 

  // 点击分页事件
  handlePagination(page, size) {
    document.documentElement.scrollTop = document.body.scrollTop = 0;
    this.setState({
      orderCurrent: page
    })
    this.getItemOrderlList(page);
  }

  // 获取订单列表
  getItemOrderlList(current) {
    CarryTokenRequest(servicePath.getItemOrderlList, {
      current: current,
      len: 10
    })
    .then(res => {
      console.log("订单分页查询成功", res.data);
      if (res.data.code === 0) {
        this.setState({
          orderList: [...this.state.orderList, ...res.data.data.records],
          orderTotal: res.data.data.total,
          pageTotal: res.data.data.pages
        }, () => {
          if (this.state.orderList.length === 0) {
            this.setState({
              isEmpty: true
            })
          } else {
            this.setState({
              isEmpty: false
            })
          }
        })
      }
    })
    .catch(err => {
      console.log("订单分页查询失败", err);
    })
  }

  //定位item
  findTarget = (item) => {
    let targetItem = {};

    if (item.parkets) { //订单item
      this.state.orderList.forEach(itemOrder => {
        if (itemOrder.orderNo === item.orderNo) {
          targetItem = itemOrder;
        }
      })  
    } else if (item.shops) { //包裹item
      this.state.orderList.forEach(itemOrder => {
        itemOrder.parkets.forEach(itemParket => {
          if (itemParket.packagingNo === item.packagingNo) {
            targetItem = itemParket;
          }
        })
      })
    } else if (item.orderDetails) { //店铺item
      this.state.orderList.forEach(itemOrder => {
        itemOrder.parkets.forEach(itemParket => {
          itemParket.shops.forEach(itemShop => {
            if (itemShop.businessId === item.businessId) {
              targetItem = itemShop;
            }
          })
        })
      })
    } else { //商品item
      this.state.orderList.forEach(itemOrder => {
        itemOrder.parkets.forEach(itemParket => {
          itemParket.shops.forEach(itemShop => {
            itemShop.orderDetails.forEach(itemPro => {
              if (itemPro.orderDetailId === item.orderDetailId) {
              // if (itemPro.itemId === item.itemId) {
                targetItem = itemPro;
              }
            })
          })
        })
      })
    }

    return targetItem;
  }

  // 确认收货
  doReceived() {
    CarryTokenRequest(servicePath.doReceived, {
      packagingNo: this.state.packagingNo,
      password: this.state.confirmPassword
    })
      .then(res => {
        console.log("确认收货成功", res.data);
        if (res.data.code === 0) {
          
          //本地状态更新
          Taro.showToast({
            title: '确认收货成功'
          })
          let item = {};
          this.state.orderList.forEach(itemOrder => {
            itemOrder.parkets.forEach(itemParket => {
              if (itemParket.packagingNo === this.state.packagingNo) {
                item = itemParket;
              }
            })
          })
          item.logisticsState = 25;
          item.textParketButtonOne = "";
          item.textParketButtonTwo = "";

          this.setState({
            visiReceiveConfirm: false,
            visiMask: false
          });
        } else {
          this.setState({
            visiReceiveConfirm: false,
            visiMask: false
          });
          Taro.showToast({
            title: res.data.msg,
            icon: 'none'
          });
        }
      })
  }

  // 获取我的收藏
  userAtItemList() {
    CarryTokenRequest(servicePath.userAtItemList, {
      current: 1,
      len: 4
    })
      .then(res => {
        console.log("查询我的收藏成功", res.data);
        if (res.data.code === 0) {
          this.setState({
            mycollList: res.data.data.records
          });
        }
      })
      .catch(err => {
        console.log("查询我的收藏失败", err);
      })
  }

  // 获取精品推荐
  getRecommendNewItems() {
    CarryTokenRequest(servicePath.recommendNewItems, {
      current: 1,
      total: 1,
      size: 3,
      source: 10,
    })
      .then(res => {
        console.log("精品推荐返回数据成功", res.data);
        if (res.data.code === 0) {
          this.setState({
            newItems: res.data.data.records,
          });
        }
      })
      .catch(err => {
        console.log("精品推荐返回数据失败", err);
      })
  }

  // 查询推荐商品列表 实际上是猜你喜欢
  getRecommendLikeItems() {
    CarryTokenRequest(servicePath.recommendLikeItems, {
      current: "1",
      total: "1",
      size: "6",
      source: 10
    })
      .then((res) => {
        console.log("猜你喜欢返回数据成功", res.data);
        if (res.data.code === 0) {
          this.setState({
            LikeItems: res.data.data.records,
          }, () => {
            console.log(this.state.LikeItems);
          });
        }
      })
      .catch((err) => {
        console.log("返回数据失败", err);
      });
  }

  //-------------------------------订单、包裹、商品状态/操作控制---------------------------//

  //----------------------------------------订单

  //订单状态数据设置
  orderActionSet = (item) => {
    //0已取消  10未付款 20 已付款 25交易成功 30申请退款  35平台仲裁 40 退款中 50 退款成功 60交易关闭 （此数据未必最新）

    //订单是否可取消
    const canCancelOrder = !(item.parkets.some(itemParket => {
      return itemParket.logisticsState >= 11 
    }) || (item.marketType === 1))

    //订单状态/操作
    switch (item.state) {

      case 10:
        item.textState = "未支付";
        item.textOrderButtonOne = "前往支付";
        item.handleOrderButtonOne = this.gotoPay.bind(this, item.orderNo);
        item.textOrderButtonTwo = "取消订单";
        item.handleOrderButtonTwo = this.handleCancelOrder.bind(this, item.orderNo, item);
        item.textOrderButtonThree = "查看订单";
        item.handleOrderButtonThree = this.checkOrder.bind(this, item);
        break;

      case 20:
      case 21:
      case 22:
      case 23:
      case 24:
        if (canCancelOrder === true) {
          item.textState = "已支付";
          item.textOrderButtonOne = "取消订单";
          item.handleOrderButtonOne = this.handleCancelOrderAfterPay.bind(this, item.orderNo, item);
          item.textOrderButtonTwo = "查看订单";
          item.handleOrderButtonTwo = this.checkOrder.bind(this, item);
        } else {
          item.textState = "已支付";
          item.textOrderButtonOne = "查看订单";
          item.handleOrderButtonOne = this.checkOrder.bind(this, item);
        }
        break;

      case 0: //可能未使用
        item.textState = "已取消";
        item.textOrderButtonOne = "查看订单";
        item.handleOrderButtonOne = this.checkOrder.bind(this, item);
        break;

      case 25:
        item.textState = "交易成功";
        item.textOrderButtonOne = "查看订单";
        item.handleOrderButtonOne = this.checkOrder.bind(this, item);
        break;

      case 40:
        item.textState = "退款中";
        item.textOrderButtonOne = "查看订单";
        item.handleOrderButtonOne = this.checkOrder.bind(this, item);
        break;

      case 50:
        item.textState = "退款成功";
        item.textOrderButtonOne = "查看订单";
        item.handleOrderButtonOne = this.checkOrder.bind(this, item);
        break;

      case 60:
        item.textState = "交易关闭";
        item.textOrderButtonOne = "查看订单";
        item.handleOrderButtonOne = this.checkOrder.bind(this, item);
        break;

      default:
        break;
    }

    //物流
    if (item.state === 20) {
      switch (item.logisticsState) {
        case 20:
          item.textLogisticsState = "待发货";
          break;
        case 21:
          item.textLogisticsState = "待揽件";
          break;
        case 22:
          item.textLogisticsState = "已发货";
          break;
        case 23:
          item.textLogisticsState = "报关中 ";
          break;
        case 24:
          item.textLogisticsState = "已收货";
          break;
      
        default:
          break;
      }
    }

  }

  //前往支付
  gotoPay = (orderNo) => {
    const postData = {
      "orderNo": orderNo
    }
    CarryTokenRequest(servicePath.gotoPayOrder, postData)
      .then(res => {
        if (res.data.code === 0) {
          const rdd = res.data.data;
          const pageOrderPayInfo = {
            "orderNo": rdd.orderNo,
            "remarks": rdd.remarks,
            "address": {
              "addressId": rdd.addressInfo.addressId
            },
            "itemOrder": rdd.itemOrder
          };
          window.sessionStorage.setItem('pageOrderPayData', JSON.stringify({
            state: {
              "pageOrderPayInfo": pageOrderPayInfo 
            }
          }))
          Taro.navigateTo({
            url: `../orderpay/orderpay`
          })
        } else {
          Taro.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          })
        }
      })
  }

  //取消订单事件
  handleCancelOrder = (orderNo, item) => {
    Taro.showModal({
      title: '取消订单',
      content: '是否确定取消订单？',
      success: res => {
        if (res.confirm) {
          this.cancelOrder(orderNo, item)
        }
      }
    })
  }

  //取消订单
  cancelOrder = (orderNo, item) => {
    const postData = {
      "orderNo": orderNo
    }
    CarryTokenRequest(servicePath.cancelOrder, postData)
      .then(res => {
        if (res.data.code === 0) {
          Taro.showToast({
            title: "取消订单成功",
            icon: "success",
            duration: 2000
          });
          let targetItem = this.findTarget(item);
          targetItem.state = 0;
          targetItem.textOrderButtonTwo = "";
          targetItem.textOrderButtonThree = "";
          this.setState({});
        }
      })
  }

  //支付后取消订单事件
  handleCancelOrderAfterPay = (orderNo, item) => {
    Taro.showModal({
      title: '取消订单',
      content: '是否确定取消订单？',
      success: res => {
        if (res.confirm) {
          this.cancelOrderAfterPay(orderNo, item)
        }
      }
    })
  }
  
  //支付后取消订单
  cancelOrderAfterPay = (orderNo, item) => {
    const postData = {
      "orderNo": orderNo
    }
    CarryTokenRequest(servicePath.cancelOrder, postData)
      .then(res => {
        if (res.data.code === 0) {
          Taro.showToast({
            title: "取消订单成功",
            icon: "success",
            duration: 2000
          });
          let targetItem = this.findTarget(item);
          targetItem.state = 40
          targetItem.textOrderButtonTwo = ""
          targetItem.textOrderButtonThree = ""
          this.setState({})
        }
      })
  }



  //查看订单
  checkOrder = (item) => {
    window.sessionStorage.setItem('pageOrderDetailsData', JSON.stringify({
      state: {
        "logisticsNo": item.logisticsNo,
        "orderNo": item.orderNo
      }
    }))
    Taro.navigateTo({
      url: `../orderdetails/orderdetails`
    })
  }

  //------------------------------------------包裹（包裹）

  //包裹状态数据设置
  packetActionSet = (itemParket) => {
    //物流状态 0待通知仓库 11仓库待揽件 12仓库确认收件 15仓库已打包(预报递四方) 20四方待发货 22已发货 23報關中 24已签收 25确认收货

    let allReturn = true
    itemParket.shops.forEach(itemShop => {
      itemShop.orderDetails.forEach(itemPro => {
        if (![2,3,8].includes(itemPro.state)) {
          allReturn = false
        }
      })
    })

    switch (itemParket.logisticsState) {
      case 0:
        itemParket.textState = "备货中";
        itemParket.textParketButtonOne = "查看物流";
        itemParket.handleParketButtonOne = this.checkOrderStatus.bind(this, itemParket);
        break;

      case 11:
        itemParket.textState = "待揽件";
        itemParket.textParketButtonOne = "查看物流";
        itemParket.handleParketButtonOne = this.checkOrderStatus.bind(this, itemParket);
        break;

      case 12:
      case 15:
      case 20:
        itemParket.textState = "已入库";
        itemParket.textParketButtonOne = "查看物流";
        itemParket.handleParketButtonOne = this.checkOrderStatus.bind(this, itemParket);
        break;

      case 22:
      case 23:
        if (!allReturn) {
          itemParket.textState = "已发货";
          itemParket.textParketButtonOne = "确认收货";
          itemParket.handleParketButtonOne = this.handleConfirmReceiving.bind(this, itemParket.packagingNo);
          itemParket.textParketButtonTwo = "查看物流";
          itemParket.handleParketButtonTwo = this.checkOrderStatus.bind(this, itemParket);
          break;
        } else {
          itemParket.textState = "已全部退货";
          itemParket.textParketButtonOne = "";
          itemParket.textParketButtonTwo = "";
          break;
        }

      case 24:
        if (!allReturn) {
          itemParket.textState = "已签收";
          itemParket.textParketButtonOne = "确认收货";
          itemParket.handleParketButtonOne = this.handleConfirmReceiving.bind(this, itemParket.packagingNo);
          itemParket.textParketButtonTwo = "查看物流";
          itemParket.handleParketButtonTwo = this.checkOrderStatus.bind(this, itemParket);
          break; 
        } else {
          itemParket.textState = "已全部退货";
          itemParket.textParketButtonOne = "";
          itemParket.textParketButtonTwo = "";
          break;
        }

      case 25:
        itemParket.textState = "已确认收货";
        itemParket.textParketButtonOne = "查看物流";
        itemParket.handleParketButtonOne = this.checkOrderStatus.bind(this, itemParket);
        break; 

      default:
        break;
    }
  }

  // 确认收货点击事件
  handleConfirmReceiving(packagingNo) {
    this.setState({
      isVisible: true, 
      packagingNo: packagingNo,
      visiMask: true, 
      visiReceiveConfirm: true,
    })
  }

  // 确认收货弹框确认按钮点击事件
  handleModalOkClick() {
    if (this.state.confirmPassword === "") {
      Taro.showToast({
        title: "密码错误",
        icon: 'none',
        duration: 2000
      });
    } else {
      this.doReceived();
    }
  }

  // 确认收货弹框输入框事件
  handleModalInput(e) {
    this.setState({
      confirmPassword: e.target.value
    })
  }

  // 确认收货弹框取消按钮点击事件
  handleModalCancelClick() {
    this.setState({
      visiReceiveConfirm: false,
      visiMask: false,
    })
  }

  //查看物流
  checkOrderStatus = (itemParket) => {
    Taro.navigateTo({
      url: `../logistics/logistics?packagingNo=${itemParket.packagingNo}`
    })
  }

  //关闭物流
  closeOrderStatus = () => {
    MaskCreate.close();
    this.setState({
      visiOrderStatus: false
    })
  }

  //------------------------------------------商品

  //商品状态数据设置
  proActionSet = (item, itemOrder) => {
    // 0正常  1申请退货中 2退货中 3退款中 4仲裁中 5退货失败 7拒绝退货 8退款成功  --update 7.16

    switch (item.state) {
      case null:
      case 0:
        if ((item.returnApply === 1) &&(itemOrder.marketType !== 1)) {
          item.textState = "";
          item.textProButtonOne = "申请退货";
          item.handleProButtonOne = this.gotoReturnApply.bind(this, item, itemOrder);
          item.textProButtonTwo = "";
        } else {
          item.textState = "";
          item.textProButtonOne = "";
          item.textProButtonTwo = "";
        }
        break;
      case 1:
        item.textState = "申请退货中";
        item.textProButtonOne = "取消申请";
        item.handleProButtonOne = this.handleCancelApply.bind(this, item, itemOrder);
        item.textProButtonTwo = "查看详情";
        item.handleProButtonTwo = this.gotoRetrunProcessing.bind(this, item, itemOrder);
        break;
      case 2:
        item.textState = "退货中";
        item.textProButtonOne = "查看详情";
        item.handleProButtonOne = this.gotoRetrunResult.bind(this, item, itemOrder);
        break;
      case 3:
        item.textState = "退款中";
        item.textProButtonOne = "";
        item.textProButtonTwo = "";
        break;
      case 4:
        item.textState = "仲裁中";
        item.textProButtonOne = "";
        item.textProButtonTwo = "";
        break;
      case 5:
        item.textState = "退货失败";
        item.textProButtonOne = "";
        item.textProButtonTwo = "";
        break;
      case 7:
        item.textState = "拒绝退货";
        item.textProButtonOne = "申请仲裁";
        item.handleProButtonOne = this.handleArbitrateApply.bind(this, item);
        item.textProButtonTwo = "查看详情";
        item.handleProButtonTwo = this.gotoRetrunResult.bind(this, item, itemOrder);
        break;
      case 8:
        item.textState = "退款成功";
        item.textProButtonOne = "";
        item.textProButtonTwo = "";
        break;

      default:
        break;
    }
  }

  //申请退货
  gotoReturnApply = (item, itemOrder) => {
    item.sellerName = itemOrder.shopName;
    delete item["handleProButtonOne"];
    window.sessionStorage.setItem('pageReturnApplyData', JSON.stringify({
      state: item
    }))
    Taro.navigateTo({
      url: `../returnapply/returnapply`
    })
  }

  //查看详情 - 申请退换中
  gotoRetrunProcessing = (item, itemOrder) => {
    const pageInfo = {
      "imgUrl": item.itemImage,
      "proName": item.itemName,
      "storeName": itemOrder.shopName,
      "phone": null,
      "orderID": itemOrder.orderNo,
      "type": item.itemSpecClassRel.specName,
      "className": item.itemSpecClassRel.className,
      "amount": item.itemNum,
      "price": item.price,
      "proID": item.itemId,
      "orderDetailId": item.orderDetailId,
      "returnOrderNo": item.returnOrderNo,
    };

    delete item["handleProButtonOne"];
    window.sessionStorage.setItem('pageReturnProcessingData', JSON.stringify({
      orderDetail: pageInfo
    }))
    Taro.navigateTo({
      url: `../returnprocessing/returnprocessing`
    })
  }

  //取消申请事件
  handleCancelApply = (item, itemOrder) => {
    Taro.showModal({
      title: '取消申请',
      content: '是否取消退货申请？',
      success: res => {
        if (res.confirm) {
          this.handleCancelApplyConfirm(item, itemOrder)
        }
      }
    })
  }

  //确定取消申请事件
  handleCancelApplyConfirm = (item, itemOrder) => {

    const postData = {
      "state": 5,
      "returnOrderNo": item.returnOrderNo,
      "orderNo": itemOrder.orderNo
    };
    CarryTokenRequest(servicePath.afterSaleApply, postData)
      .then(res => {
        if (res.data.code === 0) {
          Taro.showToast({title: '取消成功'})
          const targetItem = this.findTarget(item)
          targetItem.state = 0
          targetItem.returnApply = 1
          this.setState({})
          cancelResult = true
        } else {
          Taro.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      })
  }

  //查看详情 - 退货中/拒绝退换
  gotoRetrunResult = (item, itemOrder) => {
    item.sellerName = itemOrder.shopName;
    delete item["handleProButtonOne"];
    window.sessionStorage.setItem('pageRetrunResultData', JSON.stringify({
      state: item
    }))
    Taro.navigateTo({
      url: `../returnresult/returnresult`
    })

  }

  //申请仲裁事件
  handleArbitrateApply = (item) => {
    console.log(item, 'item')
    Taro.showModal({
      title: '申请仲裁',
      content: '是否确定申请仲裁？',
      success: res => {
        if (res.confirm) {
          this.arbitrateApply(item)
        }
      }
    })
  }

  //申请仲裁
  arbitrateApply = (item) => {
    let targetItem = this.findTarget(item)
    const postData = {
      "returnOrderNo": item.returnOrderNo,
      "orderNo": item.orderNo,
      "state": 3
    }
    CarryTokenRequest(servicePath.afterSaleApply, postData)
      .then(res => {
        if (res.data.code === 0) {
          Taro.showToast({
            title: '申请仲裁成功'
          })
          targetItem.state = 4
          this.setState({})
        } else {
          Taro.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      })
  }

  //---------------------------------------------------------------------------------//

  //IM事件
  handleIm = (accid) => {

    //临时做法
    CarryTokenRequest(servicePath.getCustomerServiceAccid)
      .then(res => {
        if (res.data.code === 0) {
          const rdd = res.data.data;
          if (rdd) {
            Taro.navigateTo({
              url: `../../IM/partials/chating/chating?chatTo=${rdd}`
            })
          } else {
            Taro.showModal({
              title: '提示',
              content: '抱歉，当前暂无客服在线',
              showCancel: false
            })
          }
        }
      })

    /* 正式做法 7.3暂屏蔽 */
    // if (accid) {
    //   CarryTokenRequest(servicePath.getUserInfo)
    //     .then(res => {
    //       if (res.data.code === 0) {
    //         Taro.navigateTo({
    //           url: `../../IM/partials/chating/chating?chatTo=${accid}`
    //         })
    //       }
    //     })
    // } else {
    //   Taro.showModal({
    //     title: '提示',
    //     conten: '抱歉，该店铺该不支持在线咨询',
    //     showCancel: false
    //   })
    // }
  }


  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '我的订单'
    })
  }

  componentDidShow() {
    this.getItemOrderlList(this.state.orderCurrent);
  }

  componentDidHide() {
    this.setState({
      orderList: [],
      orderCurrent: 1,
      pageTotal: 1
    })
  }

  onReachBottom() {
    if (this.state.orderCurrent < this.state.pageTotal) {
      this.setState({
        orderCurrent: this.state.orderCurrent + 1
      }, () => {
        this.getItemOrderlList(this.state.orderCurrent)
      })
    }
  }

  config = {
    onReachBottomDistance: 50,
  }


  render() {

    const { 
      newItems, 
      orderList, 
      orderCurrent, 
      orderTotal, 
      mycollList, 
      LikeItems,
      isVisible,
      visiOrderStatus,
      currentItemParket,
      isEmpty,
      visiMask,
      visiReceiveConfirm,
    } = this.state

    return (
      <View> 
        <View className="myorder">
          <View className="order-wrap">
            <View className="order-info-cont">
              {
                orderList.length === 0 ? 
                <CommonEmpty content="您暂时还没有订单哦" /> :
                <ul className="order-list">
                  {
                    orderList.map((itemOrder) => {
                      this.orderActionSet(itemOrder); //订单状态/操作数据设置

                      let orderDetails = [];
                      for (let index in itemOrder) {
                        if (index === "orderDetails") {
                          orderDetails = itemOrder.orderDetails;
                        }
                      }
                      
                      return (
                        <li className="list-li" key={itemOrder.orderNo}>

                          {/* 订单项 */}
                          <View className="order-item">
                            <View className="order_line">
                              <Text>
                                <Text className="order_num_txt">订单号：</Text>
                                <Text className="order_num">{itemOrder.orderNo}</Text>
                              </Text>

                              {/* 订单状态/操作 */}
                              <View className="action_order">
                                <Text className="state">{itemOrder.textState}</Text> {/* 订单状态 */}
                                <View className="button_wrap">
                                  <Button className="buttonOne" onClick={itemOrder.handleOrderButtonOne}>{itemOrder.textOrderButtonOne}</Button>   {/* 第一个按钮 */}
                                  <Button 
                                    className="buttonTwo"
                                    onClick={itemOrder.handleOrderButtonTwo}
                                    style={{display: ["",undefined].includes(itemOrder.textOrderButtonTwo)?"none":"inline-block"}}
                                  >
                                    {itemOrder.textOrderButtonTwo}
                                  </Button> {/* 第二个按钮 */}
                                  <Button 
                                    className="buttonThree"
                                    onClick={itemOrder.handleOrderButtonThree}
                                    style={{display: ["",undefined].includes(itemOrder.textOrderButtonThree)?"none":"inline-block"}}
                                  >
                                    {itemOrder.textOrderButtonThree}
                                  </Button> {/* 第三个按钮 */}
                                </View>
                              </View>
                            </View>
                            
                            {/* 包裹项 */}
                            {
                              itemOrder.parkets.map(itemParket => {
                                if (itemOrder.state>=20&&itemOrder.state<=25) {
                                  this.packetActionSet(itemParket) //包裹状态操作设置
                                }

                                return (
                                  <View className="itemParket" key={itemParket.packagingNo}>

                                    {/* 包裹信息 */}
                                    <View className="parketInfo">
                                      <View className="top">
                                        <View className="left">
                                          <Text className="label">包裹号：</Text>
                                          <Text className="value">{itemParket.packagingNo}</Text>
                                        </View>
                                        <Text className="right state" style={{display: ["",undefined].includes(itemParket.textState)?"none":''}}>{itemParket.textState}</Text>   {/* 包裹状态 */}
                                      </View>

                                      <View className="parket_aciton">
                                        <Button 
                                          className="buttonOne" 
                                          onClick={itemParket.handleParketButtonOne}
                                          style={{display: ["",undefined].includes(itemParket.textParketButtonOne)?"none":"inline-block"}}
                                        >
                                          {itemParket.textParketButtonOne}
                                        </Button> {/* 第一个按钮 */}
                                        <Button 
                                          className="buttonTwo" 
                                          onClick={itemParket.handleParketButtonTwo}
                                          style={{display: ["",undefined].includes(itemParket.textParketButtonTwo)?"none":"inline-block"}}
                                        >
                                          {itemParket.textParketButtonTwo}
                                        </Button> {/* 第二个按钮 */}
                                      </View>
                                    </View>

                                    {/* 店铺项 */}
                                    {
                                      itemParket.shops.map(itemShop => {
                                        return (
                                          <View className="itemShop" key={itemShop.businessId}>

                                            {/* 店铺信息 */}
                                            <View className="shopInfo">
                                                <Text className="order-shop-name">
                                                {/*  店铺： */}{itemShop.name}
                                                </Text>
                                                <img src={require('../../static/common/contact.png')} onClick={this.handleIm.bind(this, itemShop.accid)} />
                                            </View>

                                            {/* 商品项 */}
                                            {
                                              itemShop.orderDetails.map((item) => {
                                                if ((itemOrder.state >= 20)&&(itemOrder.state <= 25)&&(itemParket.logisticsState >= 22)) {     //商品状态/操作数据设置
                                                  this.proActionSet(item, itemOrder)
                                                }

                                                return (
                                                  <View
                                                    className="order-item-info"
                                                    key={item.orderDetailId}
                                                  >
                                                    <View className="item-info">
                                                      <View className="order_shop left">
                                                        <Navigation url={`/pages${itemOrder.marketType!==1?'/goodsdetails/goodsdetails':'/drpgoodsdetails/drpgoodsdetails'}?itemId=${item.itemId}`} >
                                                          <img src={item.item.image} alt="" />
                                                        </Navigation>
                                                      </View>
                                                      <View className="right">
                                                        <Navigation url={`/pages${itemOrder.marketType!==1?'/goodsdetails/goodsdetails':'/drpgoodsdetails/drpgoodsdetails'}?itemId=${item.itemId}`} >
                                                          <View className="order_shop_name">
                                                            {item.itemName}
                                                            <Text 
                                                              className="isShelfUp" 
                                                              style={{display: item.item.state!==10?"":"none"}}
                                                            >
                                                              （已下架）
                                                            </Text>
                                                          </View>
                                                        </Navigation>
                                                        <View className="order_shop_sty">
                                                          <Text className="sty_color">
                                                            {item.itemSpecClassRel ? item.itemSpecClassRel.specName : ""}
                                                          </Text>
                                                          <Text className="shop_size_txt">
                                                            {item.itemSpecClassRel ? item.itemSpecClassRel.className : ""}
                                                          </Text>
                                                        </View>
                                                        <Text className="order_amount">x {item.itemNum}</Text>
                                                        <View className="order_shop_sty">
                                                          <Text className="order_quan">
                                                            HK$ {(item.price * item.itemNum).toFixed(2)}
                                                          </Text>
                                                        </View>
                                                      </View>
                                                    </View>
                                                  
                                                    {/* 商品状态/操作 */}
                                                    <View className="action_production">
                                                      <Text /* 商品状态 */
                                                        className="state"
                                                        style={{display: ["",undefined].includes(item.textState)?"none":"inline-block"}}
                                                      >
                                                        {item.textState}
                                                      </Text>
                                                      <Button /* 第一个按钮 */
                                                        className="buttonOne" 
                                                        onClick={item.handleProButtonOne}
                                                        style={{display: ["",undefined].includes(item.textProButtonOne)?"none":"inline-block"}}
                                                      >
                                                        {item.textProButtonOne}
                                                      </Button>
                                                      <Button /* 第二个按钮 */
                                                        className="buttonTwo" 
                                                        onClick={item.handleProButtonTwo}
                                                        style={{display: ["",undefined].includes(item.textProButtonTwo)?"none":"inline-block"}}
                                                      >
                                                        {item.textProButtonTwo}
                                                      </Button>
                                                    </View>
                                                  </View>
                                                )
                                              })
                                            }

                                          </View>
                                        )
                                      }) 
                                    }

                                  </View>
                                )
                              })
                            }

                          </View>
                        </li>
                      )
                    })
                  }
                </ul>
                
              }
            </View>
          </View>

          {/* 确认收货弹框 */}
          <View className="mask" style={{display: visiMask===true?'':'none'}}></View>
          <View
            className="receiveConfirm"
            style={{display: visiReceiveConfirm===true?'':'none'}}
          >
            <View className="modal-text">确认收货</View>
              <Input 
                type="password" 
                className="modal-input" 
                placeholder="请输入登录的密码" 
                onInput={this.handleModalInput}
              />
            <View className="receiveConfirm_action">
              <Button className="cancel" onClick={this.handleModalCancelClick}>取消</Button>
              <Button className="confirm" onClick={this.handleModalOkClick}>确认</Button>
            </View>
          </View>

        </View>
      </View>
    );
  }
}

export default MyOrder;
