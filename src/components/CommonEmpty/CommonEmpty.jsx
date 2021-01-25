import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './CommonEmpty.less';

class CommonEmpty extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount () { }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { 
  }

  componentDidHide () { }

  config = {
    navigationBarTitleText: '首页',
    usingComponents: {}
  }

  render () {
    return (
      <View className="empty-box" style={{display: this.props.visible!==false?'':'none'}}>
        <img src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/empty-icon.png" />
        <View>{this.props.content}</View>
      </View>
    )
  }
}

export default CommonEmpty;