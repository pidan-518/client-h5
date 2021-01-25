import Taro, { Component } from '@tarojs/taro';
import { View, Text, Checkbox, CheckboxGroup, Input } from '@tarojs/components'
import "../../common/globalstyle.less";
import "./Failure.less";
 
export default class Failure extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "remarks": "",  //拒绝原因备注
      "createTime": "", //时间
    }
  }

  componentDidShow() {
  }

  render() {

    return(
      <View className="failure" style={{display: this.props.result===6?"block":"none"}}>
        
        <View className="top">
          <View className="top_left" >
            <Text>退货申请已拒绝</Text>
          </View>
          <img src={require('../../static/orderpart/truck.png')} className="top_right" />
        </View>

        <View className="failureInfo">
          <View className="line reason">
            <Text className="prop">卖家原因描述：</Text>
            <Text className="value">{this.props.returnOfGoods[0].busDesc}</Text>
          </View>
          <View className="line time">
            <Text className="prop">时间：</Text>
            <Text className="value">{this.props.returnOfGoods[0].createTime}</Text>
          </View>
        </View>
      </View>
    )
  }
}
