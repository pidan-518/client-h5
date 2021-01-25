import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './Loading.less'

class Loading extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return (
      <View className="section">
          <View className="loader-3">
            <View className="dot dot1" style={{background: this.props.color}}></View>
            <View className="dot dot2" style={{background: this.props.color}}></View>
            <View className="dot dot3" style={{background: this.props.color}}></View>
          </View>
      </View>
    )
  }
}

export default Loading
