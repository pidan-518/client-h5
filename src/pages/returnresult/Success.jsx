import Taro, { Component } from '@tarojs/taro';
import { View, Text, Checkbox, CheckboxGroup, Input } from '@tarojs/components'
import "../../common/globalstyle.less";
import "./Success.less";
 
export default class Success extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // "businessUser": {}        //商家信息7
    }
  }

  //接收退换列表页信息
  getPageProReturn = () => {
    const businessUser =  this.props.businessUser;
    console.log(businessUser)
    this.setState({
      "businessUser": businessUser
    })
  }

  componentDidMount() {}

  componentDidUpdate() {}

  render() {

    return(
      <View className="Success" style={{display: this.props.result===1?"block":"none"}}>
        <View className="top">
          <View className="top_left" >
            <img src={require("../../static/common/tick-green.png")} />
            <Text>已同意退货</Text>
          </View>
          <img src={require('../../static/orderpart/truck.png')} className="top_right" />
        </View>
        <View className="returnInfo">
          <View className="returnInfo_left">
            <img src={require("../../static/common/location_blue.png")} />
          </View>
          <View className="returnInfo_right">
            <View className="reciverAddress line">
              <Text className="line_prop">经营地址：</Text>
              <Text className="value">{this.props.businessUser.businessAddress}</Text>
            </View>
            <View className="reciver line">
              <Text className="line_prop">负责人：</Text>
              <Text className="value">{this.props.businessUser.owner}</Text>
            </View>
            <View className="phone line">
              <Text className="line_prop">联系方式：</Text>
              <Text className="value">{this.props.businessUser.mobile}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
