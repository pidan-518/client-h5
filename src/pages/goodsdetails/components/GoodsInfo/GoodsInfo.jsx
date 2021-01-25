import Taro, { Component } from '@tarojs/taro'
import { View, Text, RichText } from '@tarojs/components'
import './GoodsInfo.less';
import { postRequest } from '../../../../common/util/request';
import servicePath from '../../../../common/util/api/apiUrl';

class GoodsInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shopDescription: '<View></View>',
      itemId: '',
      businessId: 0,
    }
  }

  componentDidUpdate() {
    if (this.state.itemId !== this.props.itemId) {
      this.setState({
        itemId: this.props.itemId
      }, () => {
        postRequest(servicePath.itemIntroduction, {
          itemId: this.props.itemId
        })
          .then(res => {
            console.log("获取商品介绍成功", res.data);
            if (res.data.code === 0) {
              res.data.data.description = res.data.data.description.replace(/\<img/gi, '<img style="max-width:100%;height:auto"');
              res.data.data.description = res.data.data.description.replace(/\<p/gi, '<p style="overflow: hidden"');
              this.setState({
                shopDescription: res.data.data.description
              });
            }
          })
          .catch(err => {
            console.log("获取商品介绍失败", err);
          })
      })
    }
  }

  componentWillUnmount () { }

  componentDidShow () { 
  }

  componentDidHide () { }

  render () {

    const { shopDescription } = this.state

    return (
      <View className='goods-info'>
        <View className="goods-info-title">商品介绍</View>
        <RichText className="rich-text" nodes={shopDescription}></RichText>
      </View>
    )
  }
}

export default GoodsInfo;