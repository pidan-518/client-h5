import Taro, { Component, getCurrentPages } from '@tarojs/taro';
import { View, Text, Button, Radio, Label } from '@tarojs/components'
import { CarryTokenRequest } from '../../common/util/request';
import ServicePath from "../../common/util/api/apiUrl";
import Navigation from '../../components/Navigation/Navigation';
import "../../common/globalstyle.less";
import "./orderpay.less";

export default class OrderPay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalAmount: 0,
      "codeUrl": "https://www.baidu.com",
      "payType": "WECHAT", // ALIPAYCN：支付宝；WECHAT：微信；WECHAT_WAP：微信WAP；
      "orderID": "2823781347",
      "storeID": "123",
      "storeName": "爱港猫旗舰店",
      "remarks": "请尽快发货",
      "logisticsFee": 0,
      "taxFee": 0,
      "proList": [],
      couponRecordIds: [],
      couponType: [],
      marketType: 0, // 1：营销支付 
    }
  }

  //接收“订单提交”页信息
  getPageOrderSubmit = () => {
    let rs = JSON.parse(window.sessionStorage.getItem('pageOrderPayData')).state
    const r = rs.pageOrderPayInfo;
    this.setState({
      "marketType": r.itemOrder.marketType,
      "orderID": r.orderNo,
      "storeID": r.itemOrder.shopId,
      "storeName": r.itemOrder.shopName,
      "remarks": r.remarks,
      "addressId": r.address.addressId,
      "logisticsFee": r.itemOrder.logisticsFee,
      "taxFee": r.itemOrder.taxFee,
      "proList": r.itemOrder.orderDetails.map(p => {
        return (
          {
            "proID": p.itemId,
            "imgUrl": p.itemImage,
            "proInfo": p.itemName,
            "platformPrice": p.price,
            "amount_amount": p.itemNum,
            "sepecification": p.specName,
            "sepcClass": "规格",
            "preferentialAmount": 0,
            "subTotal": p.price * p.itemNum,
          }
        )
      })
    }, () => {
    this.getUseCouponList(r.orderNo);
    this.totalAmount();
    })
  }

  // 获取可使用优惠券
  getUseCouponList(orderNo) {
    if (this.state.marketType !== 1) {
      CarryTokenRequest(ServicePath.getUserCouponList, {
        orderNo: orderNo,
        len: 10,
        source: 10
      })
        .then(res => {
          console.log("获取优惠券成功", res.data);
          if (res.data.code === 0) {
            let data = res.data.data;
            let couponType = [];
            let couponRecordIds = [];
            data.forEach(item => {
              if (item.used === 1) {
                couponType.push(item);
                couponRecordIds.push(item.couponRecordId);
              }
            });
            this.setState({
              couponType,
              couponRecordIds
            }, () => {
              this.reCalculateFee(couponRecordIds, orderNo)
            });
          }
        })
        .catch(err => {
          console.log("获取优惠券失败", err);
        })
    }
  }

  //取消订单弹框
  handleCancelOrder = () => {

    //跳转购物车页面
    const gotoPageCart = () => {
      this.props.history.push({
        pathname: "/cart"
      })
    }

    //取消
    const cancel = () => {
      const postData = {
        "orderNo": this.state.orderID
      };
      CarryTokenRequest(ServicePath.cancelOrder, postData)
        .then(res => {
          if (res.data.code === 0) {
            DialogCreate.open({
              title: "订单取消成功",
              para: "订单已成功取消，点击确定返回购物车页面",
              hasCancel: false,
              confirmCallBack: gotoPageCart
            })
          } else(
            message.error("订单取消失败")
          )
        })
        .catch(err => {
          console.log("接口异常 - 取消订单：", err);
        })
    }

    //二次确认
    DialogCreate.open({
      title: "取消订单",
      para: "是否确订取消订单？",
      confirmCallBack: cancel
    })
  }

  // 重新计算金额
  reCalculateFee(couponRecordIds, orderId) {
    CarryTokenRequest(ServicePath.reCalculateFee, {
      couponRecordIds:  couponRecordIds,
      orderNo: orderId,
      source: 10
    })
      .then(res => {
        console.log('使用优惠卷成功', res.data);
        if (res.data.code === 0) {
          let orderData = res.data.data;
          this.setState({
            "orderID": orderData.orderNo,
            "storeID": orderData.itemOrder.shopId,
            "storeName": orderData.itemOrder.shopName,
            "remarks": orderData.remarks,
            "logisticsFee": orderData.itemOrder.logisticsFee,
            "taxFee": orderData.itemOrder.taxFee,
            "proList": orderData.itemOrder.orderDetails.map(p => {
              return (
                {
                  "proID": p.itemId,
                  "imgUrl": p.itemImage,
                  "proInfo": p.itemName,
                  "platformPrice": p.price,
                  "amount_amount": p.itemNum,
                  "sepecification": p.specName,
                  "sepcClass": "规格",
                  "preferentialAmount": 0,
                  "subTotal": p.price * p.itemNum,
                }
              )
            })
          }, () => {
            this.totalAmount();
          })
        } else {
          Taro.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000
          })
        }
      })
      .catch(err => {
        console.log('使用优惠卷失败', err);
      })
  }

  //计算总价
  totalAmount = () => {
    let a = 0;
    this.state.proList.forEach(p => {
      a += p.subTotal;
    })

    this.setState({
      totalAmount: parseFloat(a.toFixed(2))
    })
  }

  //选择支付方式
  handlePayType = (e) => {
    this.setState({
      "payType": document.getElementById("zfb").checked?"ALIPAYCN":"WECHAT"
    })
  }

  //支付事件，跳转最终支付页
  handleGotoPay = () => {
    const postData = {
      "orderNo": this.state.orderID,
      "payMethod": this.state.payType,
      "source": 0, //订单来源 0 WEB订单 10微信小程序 20Android APP 30IOS APP 40 手机H5
      "couponRecordIds": this.state.couponRecordIds,
    }
    CarryTokenRequest(this.state.marketType!==1?ServicePath.payOrder:ServicePath.msPayOrder, postData)
      .then(res => {
        if (res.data.code === 0) {
          const rr = res.data.data.result
          window.sessionStorage.setItem('pageFinalPayData', JSON.stringify({
            codeUrl: rr.codeUrl,
            orderNo: this.state.orderID,
            codeImgUrl: rr.codeImgUrl
          }))
          Taro.navigateTo({
            url: '../orderfinalpay/orderfinalpay'
          })
        } else {
          Taro.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      })
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '订单支付'
    })
  }

  componentDidShow() {
    let rs =  JSON.parse(window.sessionStorage.getItem('pageOrderPayData')).state
    let r = rs.pageOrderPayInfo;
    this.getPageOrderSubmit();
  }

  componentWillUnmount() { 
    window.sessionStorage.removeItem("orderData");
  }


  render() {
    const { orderID, couponRecordIds, couponType } = this.state
    return(
      <View className="orderPay">
        <View className="ct-orderPay">
          <View className="baseInfo item">
            <View className="left">
              <span className="remind">订单提交成功，支付单号：</span>
              <span className="payID">{this.state.orderID}</span>
            </View>
          </View> 
          <View className="payType item">
            <View className="type">
              <Label className="item wx_wrap">     {/* 微信 */}
                <View className="left">
                  <img src={require("../../static/orderpart/pay_wx.png")} alt=""/>
                  <Text>微信支付</Text>
                </View>
                <Radio 
                  type="radio" 
                  name="payType" 
                  defaultChecked
                  checked="true"
                  // className="wx" 
                  value="1"
                  onChange={this.handlePayType.bind(this)}
                >
                </Radio>
              </Label> 
            </View>
          </View>
          <Navigation url={`/pages/usecertificate/usecertificate?orderId=${orderID}&couponRecordIds=${couponRecordIds}`}>
            <View className="coupon" style={{display: this.state.marketType!==1?'':'none'}}>
              <View className="coupon-text">优惠券</View>
              <View className="coupon-type">
                {
                  couponType.map((item, index) => 
                    item.couponType === 1 ? 
                      <View className="type" key={index}> 
                        <Text className="type-text" decode>满减券&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Text>  
                        <Text className="coupon-num">优惠 {item.couponAmount.toFixed(2)}</Text>
                      </View> 
                    : item.couponType === 3 ? 
                      <View className="type" key={index}>
                        <Text className="type-text" decode>折扣券&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Text>
                        <Text className="coupon-num">优惠 {item.couponAmount * 10} 折</Text>
                      </View> 
                    : null
                  )
                }
                {
                  couponType.map((item, index) => 
                    item.couponType === 2 ? 
                      <View className="type" key={index}> 
                        <Text className="type-text" decode>抵扣券&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Text> 
                        <Text className="coupon-num">优惠 {item.couponAmount.toFixed(2)}</Text>
                      </View> : null
                  )
                }
              </View>
            </View>
          </Navigation>
          <View className="action">
            <View className="right">
              <View className="info">
                <View className="line total">
                  <span className="prop">总计：</span>
                  <span className="value">HK$ {this.state.totalAmount}</span>
                </View>
                <View className="line freightCharges">
                  <span className="prop">运费：</span>
                  <span className="value">{this.state.logisticsFee}</span>
                </View>
                <View className="line taxFee">
                  <span className="prop">税费：</span>
                  <span className="value">{this.state.taxFee}</span>
                </View>
              </View>
              <View className="amount">
                <span className="prop">应付金额：</span>
                <span className="amount-amount">HK$ {(this.state.totalAmount + this.state.logisticsFee + this.state.taxFee).toFixed(2)}</span>
              </View>
            </View>
          </View>
          <View className="action-action">
            <Button className="complete" type="button" onClick={this.handleGotoPay} >
              <Text decode="true`">微信支付&nbsp;&nbsp; </Text>
              HK$ {(this.state.totalAmount + this.state.logisticsFee + this.state.taxFee).toFixed(2)}
            </Button>
          </View>
        </View>
      </View>
    )
  }
}