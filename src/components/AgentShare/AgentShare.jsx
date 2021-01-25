import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button, Input} from '@tarojs/components';
import "../../common/globalstyle.less";
import "./AgentShare.less";

export default class AgentShare extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userType: 1, // 用户类型 6：代理人；
    }
  }


  // 获取代理码
  checkAgent = () => {
    const userinfo = JSON.parse(window.sessionStorage.getItem('userinfo')) || {}
    this.setState({
      userType: userinfo.userType
    })
  }

  // 代理分享事件
  handleAgentShare = () => {
    const href = window.location.href
    const shareRecommend = window.sessionStorage.getItem('shareRecommend')
    let shareUrl = ''
    if (href.indexOf('page') > 0) {
      if (href.indexOf('?') > 0) {
        shareUrl = `${href}&shareRecommend=${shareRecommend}`
      } else {
        shareUrl = `${href}?shareRecommend=${shareRecommend}`
      }
    } else { // 不带page的首页时
      if (href.indexOf('?') > 0) {
        shareUrl = `${href}#/pages/index/index&shareRecommend=${shareRecommend}`
      } else {
        shareUrl = `${href}#/pages/index/index?shareRecommend=${shareRecommend}`
      }
    }
    Taro.setClipboardData({
      data: shareUrl,
      success: () => {
        Taro.showToast({
          title: '链接已成功复制到剪贴板'
        })
      }
    })
  }


  componentDidMount() {
    this.checkAgent()
  }

  componentDidShow() {
  }

  componentDidHide() {}


  render() {
    const { userType } = this.state

    return(
      <View className="agentShare" style={{display: userType===6?'':'none'}}>
        <Button className="agentShare_btn" onClick={this.handleAgentShare}>
          代理<br />分享
        </Button>
      </View>
    )
  }
}
