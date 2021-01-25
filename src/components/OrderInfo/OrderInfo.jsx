import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button, CheckboxGroup, Input } from '@tarojs/components'
import { CarryTokenRequest } from '../../common/util/request';
import "../../common/globalstyle.less";
import "./OrderInfo.less";

export default class OrderInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "orderDetail": {
        "imgUrl": '',
        // "imgUrl": require("../../static/common/production.png"),
        "proName": "",
        "sellerName": "",
        "phone": 0,
        "orderID": 0,
        "type": "",
        "amount": 0,
        "price": 0,
        "result": 1,      //1：成功  4：失败 
      },
      "businessUser": {},
      "returnOfGoods": {}
    }
  }

  //获取售后申请详情
  getAfterSaleDetail = () => {
    const postData = {
      "orderDetailId": this.state.orderDetail.orderDetailId
    };
    CarryTokenRequest(ServicePath.afterSaleDetail, postData)
      .then(res => {
        if (res.data.code === 0) {
          const rdd = res.data.data;
          const orderDetail = this.state.orderDetail;
          orderDetail.phone = rdd.businessUser.mobile;
          orderDetail.sellerName = rdd.shopName;
          this.setState({
            "businessUser": rdd.businessUser,
            "returnOfGoods": rdd.returnOfGoods
          });
        }
      })
      .catch(err => {
        console.log("接口异常 - 查看售后申请详情：", err);
      })
  }

  //查看订单事件：跳转订单详情
  handleSeeOrder = () => {
    const state = {
      "orderNo": this.props.orderDetail.orderID
    }
    window.sessionStorage.setItem('pageOrderDetailsData', JSON.stringify({
      state: {
        orderNo: this.props.orderDetail.orderID
      }
    }))
    Taro.navigateTo({
      url: `../orderdetails/orderdetails?`
    })
  }

  componentDidShow() {
    // this.getPage();
  }

  componentDidUpdate() {
    if (this.state.orderDetail !== this.props.orderDetail) {
      this.setState({
        orderDetail: this.props.orderDetail
      })
    }
  }

  render() {

    return(
      <View className="orderInfo">
        <View className="proInfo">
            <img src={this.props.orderDetail.imgUrl}  className="star" />
            <View className="orderInfo_right">
              <View className="line proName">
                <Text className="value">{this.props.orderDetail.proName}</Text>
              </View>
              <View className="line type">
                <Text className="value">{this.props.orderDetail.type}</Text>
              </View>
              <View className="line type">
                <Text className="value">{this.props.orderDetail.className}</Text>
              </View>
              <View className="line amount">
                <Text className="prop" decode="true">数量：&nbsp;</Text>
                <Text className="value">x{this.props.orderDetail.amount}</Text>
              </View>
              <View className="line price">
                <Text className="value currency">{this.props.orderDetail.price}</Text>
              </View>
            </View>
        </View>

        <View className="order">
            <View className="line sellerName">
              <Text className="prop">卖家名称：</Text>
              <Text className="value">{this.props.orderDetail.sellerName}</Text>
            </View>
            <View className="line phone">
              <Text className="prop">联系电话：</Text>
              <Text className="value">{this.props.orderDetail.phone}</Text>
            </View>
            <View className="line orderID">
              <Text className="prop">订单编号：</Text>
              <Text className="value">{this.props.orderDetail.orderID}</Text>
            </View>
            <Button className="check" onClick={this.handleSeeOrder}>查看订单</Button>
        </View>
      </View>
    )
  }
}
