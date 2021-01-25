import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

class Navigation extends Component {

  handleNavigateTo = () => {
    Taro.navigateTo({
      url: this.props.url
    })
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
      <View className='navigator' onClick={this.handleNavigateTo}>
        {this.props.children}
      </View>
    )
  }
}

export default Navigation;