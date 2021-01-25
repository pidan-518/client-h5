import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './drpjoin.less'
// import banner from '../../static/scattered/banner.png'


export default class DrpJoin extends Component {

  componentWillMount () {
    console.log(this.$router.params)
   }

  componentDidMount () { }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }


  //点击加入事件
  handleJoin = () => {
    Taro.navigateTo({
      url: `../drpgoods/drpgoods?shareRecommend=${this.$router.params.shareRecommend}`
    })
  }


  config = {
    navigationBarTitleText: '电商达人'
  }

  render () {
    return (
      //团队详情 页面
      <View className='h5-electricity'>
        {/* 顶部banner开始 */}
        <view className='h5-electricity-banner'>
          <view className='electricity-banner-img'>
            <img src={'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/drpbanner.png'} alt=""/>
          </view>
        </view>
        {/* 顶部banner结束 */}
        {/* 底部内容开始 */}
        <view className='h5-electricity-content'>
          <view className='electricity-content-pay'>
            <view className='electricity-pay-text'>
              <text className='pay-text-content1'>资格：</text>
              <text className='pay-text-content2'>缴纳</text>
              <text className='pay-text-content3'>&nbsp;486</text>
              <text className='pay-text-content4'>元</text>
            </view>
          </view>
          <view className='electricity-content-textcontent'>
            <view className='content-textcontent-title'>
              <text>收益</text>
            </view>
            <view className='content-textcontent-title1'>
              <text className='title1-content'>自购/分享5%-50%收益</text>
              <text className='title1-content'>介绍费100元/人</text>
            </view>
          </view>
          <view className='electricity-content-btn'>
            <view className='content-btn' onClick={this.handleJoin}>
              <text className='btn'>点击加入</text>
            </view>
          </view>
        </view>
        {/* 底部内容结束 */}
      </View>
    )
  }
}
