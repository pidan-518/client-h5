import Taro, { Component } from '@tarojs/taro';
import { View, Text, Checkbox, CheckboxGroup, Input, Button, Label } from '@tarojs/components'
import ServicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request';
import "../../common/globalstyle.less";
import "./drpgoods.less";
import Navigation from '../../components/Navigation/Navigation';
import CommonEmpty from '../../components/CommonEmpty/CommonEmpty';
// import { QRCode } from 'taro-code';
// import _style from '@/utils/style';

export default class DrpGoods extends Component {
  constructor(props) {
    super(props);
    this.state = {
      goodsList: [], //商品列表
      currentPage: 1, //当前页
      pageTotal: 1, //总页数
      isEmpty: false, //是否空列表
    }
  }


  //获取营销商品列表
  getMarketingItemList = (current) => {
    const postData = {
      current: current,
      len: 10
    }
    CarryTokenRequest(ServicePath.getMarketingItemList, postData)
      .then(res => {
        if (res.data.code === 0) {
          this.setState({
            goodsList: [...this.state.goodsList, ...res.data.data.records],
            pageTotal: res.data.data.pages
          }, () => {
            if (this.state.goodsList.length === 0) {
              this.setState({
                isEmpty: true
              })
            }
          })
        } else {
          Taro.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          })
        }
      })
  }

  //点击商品事件，跳转详情页
  handleGoodsItem = (id, itemId) => {
    Taro.navigateTo({
      url: `../drpgoodsdetails/drpgoodsdetails?id=${id}&itemId=${itemId}`
    })
  }


  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: "商品列表"
    })
  }

  componentDidShow() {
    const drpRecommend = this.$router.params.shareRecommend // 代理码，注册、购物分佣两用
    window.sessionStorage.setItem('drpRecommend', drpRecommend)

    this.getMarketingItemList(this.state.currentPage)
  }

  componentDidHide() {
    this.setState({
      goodsList: [],
      currentPage: 1,
      pageTotal: 1
    })
  }

  onReachBottom() {
    if (this.state.currentPage < this.state.pageTotal) {
      this.setState({
        currentPage: this.state.currentPage + 1
      }, () => {
        this.getMarketingItemList(this.state.currentPage)
      })
    }
  }


  render() {
    const { goodsList, isEmpty } = this.state

    return(
      <View className="drpGoods">
        <View className="goods_list">
          {/* 空列表状态 */}
          <CommonEmpty content="暂无代理商品" visible={isEmpty} />
          {/* 非空状态 */}
          {
            goodsList.map(itemGoods => {
              return (
                <View 
                  key={itemGoods.id}
                  className="goods_item" 
                  key={itemGoods.itemId} 
                  onClick={this.handleGoodsItem.bind(this, itemGoods.id, itemGoods.itemId)}
                >
                  <img className="img" src={itemGoods.image} alt=""/>
                  <Text className="name">{itemGoods.itemName}</Text>
                </View>
              )
            })
          }
        </View>
      </View>
    )
  }
}
