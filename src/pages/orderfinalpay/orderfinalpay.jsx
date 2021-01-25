import Taro, { Component } from '@tarojs/taro';
import { CarryTokenRequest } from '../../common/util/request';
import ServicePath from "../../common/util/api/apiUrl";
import "../../common/globalstyle.less";
import "./orderfinalpay.less";
import Navigation from '../../components/Navigation/Navigation';

export default class OrderFinalPay extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      "payType": "",     // ALIPAYCN：支付宝；    WECHAT：微信；
      "urlCode": "",      //支付url  暂移
      "orderNo": 0,
      "storeName": "",
      "codeImgUrl": ""     //二维码url
    }
  }

  //接收订单支付页信息
  getPageOrderPay = () => {
    const info = JSON.parse(window.sessionStorage.getItem('pageFinalPayData'))
    this.setState({
      "payType": info.payType,
      "urlCode": info.codeUrl,
      "orderNo": info.orderNo,
      "storeName": info.storeName,
      "codeImgUrl": info.codeImgUrl || ""
    }, () => {
      this.checkResult();     //支付结果轮询
    })
  }

  //支付结果轮询
  checkResult = () => {
    //跳转支付成功页
    const gotoPagePaySuccess = () => {
      Taro.navigateTo({
        url: '../orderpaysuccess/orderpaysuccess'
      })
    }
    //查询
    const postData = {
      "payOrder": {
        "orderNo": this.state.orderNo,
        "couponRecordIds": this.props.location.state.couponRecordIds
      }
    }
    const query = () => {
      CarryTokenRequest(ServicePath.getPayOrder, postData)
      .then(res => {
        if (res.data.code === 0) {
          if (res.data.data.status === 0) {
            gotoPagePaySuccess();
          }
        }
      })
      .catch(err => {
        console.log("接口异常 - 支付结果查询：", err);
      })
    } 
    //轮询
    this.queryInterval = setInterval(query, 4000);
  }


  componentDidMount() {
    this.getPageOrderPay();
  }

  componentDidHide() {
    clearInterval(this.queryInterval);
  }

  render() {
    const stp = this.state.payType;

    return(
      <div id="orderFinalPay">
        <div id="ct-orderFinalPay">
          <div className="remind">
            <span className="para">订单已生成，请尽快支付。订单编号：</span>
            <span className="orderID">{this.state.orderNo}</span>
          </div>
          <div className="payWrap">
            <div className="pay">
              <div className="img_wrap">
                <img 
                  src={this.state.codeImgUrl} 
                  alt="" 
                  className="codeImg"
                  style={{display: stp==="ALIPAYCN"?"none":"block"}}
                />
              </div>
            </div>
          </div>
          <div className="introduction item_module">
            <p className="title">支付说明：</p>
            <p className="text">请使用另一台手机打开微信扫描此二维码，或将二维码发送到另一台手机，用本手机扫描二维码支付。</p>
          </div>
          <div className="more item_module">
            <p className="title">您还可以：</p>
            <div className="navi_list">
              <Navigation url="../cart/cart">返回购物车</Navigation>
              <Navigation url="../index/index">前往首页</Navigation>
            </div>
          </div>
        </div>
      </div>
    )
  }
}