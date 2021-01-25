import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button, Input } from '@tarojs/components'
import "../../common/globalstyle.less";
import "./orderpaysuccess.less";

export default class OrderPaySuccess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backTiming: 5
    }
  }

  //计时
  timing = () => {
    this.time = setInterval(() => {
      this.setState({
        backTiming: this.state.backTiming - 1
      });
      if (this.state.backTiming === 1) {
        clearInterval(this.time);
        setTimeout(() => {
          Taro.navigateTo({
            url: '../cart/cart'
          })
        }, 1000);
      };
    }, 1000);
  }

  //返回购物车
  handleCart = () => {
    Taro.navigateTo({
      url: '../cart/cart'
    })
  }

  //继续购物
  handleHome = () => {
    Taro.navigateTo({
      url: '../index/index'
    })
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '支付成功'
    })
    this.timing();
  }

  componentDidHide() {
    clearInterval(this.time);
  }

  render() {
    return(
      <View className="orderPaySuccess">
        <View className="ct-orderPaySuccess">
          <View className="success">
            <View className="main">
              <img src={require("../../static/orderpart/pay_success.png")} alt=""/>
              <View className="right">
                <Text className="title">支付成功</Text>
                <View className="back">
                  <Text className="time">{this.state.backTiming}</Text>
                  <Text className="back" decode="ture">&nbsp;秒后返回购物车</Text>
                </View>
              </View>
            </View>
            <View className="action">
                <Button className="item_cart" onClick={this.handleCart}>立即返回购物车</Button>
                <Button className="item_home" onClick={this.handleHome}>继续购物</Button>
            </View>
          </View>
        </View>
      </View>
    )
  }
}