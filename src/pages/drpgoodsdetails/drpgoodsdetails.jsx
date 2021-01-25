import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button, Input} from '@tarojs/components'
import { AtFloatLayout } from 'taro-ui';
import "taro-ui/dist/style/components/float-layout.scss";
import ServicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request';
import "../../common/globalstyle.less";
import "./drpgoodsdetails.less";

export default class DrpGoodsDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgUrl: '',  //商品图片
      name: '',  //商品名
      introduction: '',  //商品介绍
      detail: {},  //商品详情
      specTagName: '',  //主规格名
      selectSpecName: '',  //选中主规格
      classTagName: '',  //子规格名
      selectClassList: [],  //当前子规格列表
      selectClassName: '',  //选中子规格
      recomSpecList: [],  //重组规格列表
      visiSpec: false,  //显示规格框
      itemSpecClassId: 0,  //选中规格id
      drpRecommend: '',  //代理邀请码
    }
  }


  //获取商品详情
  agentGoodDetail = () => {
    const itemId = JSON.parse(this.$router.params.itemId)
    const drpRecommend = window.sessionStorage.getItem('drpRecommend')
    const postData = {
      itemId: itemId
    }
    CarryTokenRequest(ServicePath.agentGoodDetail, postData)
      .then(res => {
        if (res.data.code === 0) {
          const data = res.data.data
          let itemSpecList = data.itemSpecList
          /* 规格列表重组 */
          let recomSpecList = []  //重组结果
          itemSpecList.forEach(itemSpec => {
            let ifExistSpec = false
            recomSpecList.forEach(itemRecomSpec => {
              if (itemRecomSpec.specName === itemSpec.specName) {
                itemRecomSpec.classList.push(itemSpec)
                ifExistSpec = true
              }
            })
            if (!ifExistSpec) {
              const newItemRecomSpec = {
                specName: itemSpec.specName,
                classList: [itemSpec]
              }
              recomSpecList.push(newItemRecomSpec)
            }
            console.log(recomSpecList, 'recomSpecList')
          })
          this.setState({
            detail: data,
            specTagName: itemSpecList[0].specTagName,  //主规格名
            classTagName: itemSpecList[0].classTagName,  //子规格名
            recomSpecList,  //重组规格列表
            selectClassList: recomSpecList[0].classList,  //当前子规格列表
            selectSpecName: itemSpecList[0].specName, //选中的规格名
            selectClassName: itemSpecList[0].className, //选中的子规格名
            itemSpecClassId: itemSpecList[0].id, //选中的子规格名
            drpRecommend: drpRecommend!=='undefined'?drpRecommend:'' //代理邀请码
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

  //点击选择规格事件
  handleChooseSpec = () => {
    this.setState({
      visiSpec: true
    })
  }

  //选择主规格事件
  handleChangeSpec = (specName) => {
    let selectClassList = []
    //更新选中子规则
    this.state.recomSpecList.forEach(itemRecomSpec => {
      if (itemRecomSpec.specName === specName) {
        selectClassList = itemRecomSpec.classList
        let ifIncludeSelectClass = false  //是否包含当前选中的子规格
        selectClassList.forEach(itemClass => {
          if (itemClass.className === this.state.selectClassName) {
            ifIncludeSelectClass = true
            this.setState({
              itemSpecClassId: itemClass.id
            })
          }
        })
        if (!ifIncludeSelectClass) {  //不包含时
          this.setState({
            selectClassName: selectClassList[0].className, 
            itemSpecClassId: selectClassList[0].id 
          })
        }
      }
    })
    //更新主规则，子规格列表
    this.setState({
      selectSpecName: specName,
      selectClassList
    })
  }

  //选择子规格事件
  handleChangeClass = (itemClass) => {
    this.setState({
      selectClassName: itemClass.className,
      itemSpecClassId: itemClass.id
    })
  }

  //点击购买事件
  handleBuy = () => {
    const detailReqList = [
      {
        itemId: JSON.parse(this.$router.params.itemId),
        itemSpecClassId: this.state.itemSpecClassId, 
        number: 1
      }
    ]
    const postData = {
      recommend: this.state.drpRecommend,
      // recommend: '8MO5C2',  //  ---临时数据
      detailReqList: detailReqList
    }
    CarryTokenRequest(ServicePath.msGotoSettlement, postData)
      .then(res => {
        if (res.data.code === 0) {
          const shoppingDetailList = [{
            shoppingDetailId: this.state.itemSpecClassId,
            number: 1
          }]
          window.sessionStorage.setItem('pageSubmitData', JSON.stringify({
            goodsFrom: 'drp',
            recommend: this.state.drpRecommend,
            // recommend: '8MO5C2',  //  ---临时数据
            detailReqList: detailReqList,
            pageSubmitInfo: res.data.data,
            shoppingDetailList: shoppingDetailList
          }))
          Taro.navigateTo({
            url: `../ordersubmit/ordersubmit`,
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

  //结束填写邀请码事件
  changeDrpRecommend = (e) => {
    this.setState({
      drpRecommend: e.target.value
    })
  }


  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: "商品详情"
    })
  }

  componentDidShow() {
    this.agentGoodDetail()
  }

  componentDidHide() {}


  render() {
    const { 
      detail, 
      specTagName, 
      classTagName,
      selectClassList,
      recomSpecList,
      visiSpec,
      selectSpecName, 
      selectClassName,
      drpRecommend,
    } = this.state

    return(
      <View className="drpGoodsDetails">
        {/* 商品信息 */}
        <img src={detail.image} alt="" className="img"/>
        <View className="text_wrap">
          <Text className="name">{detail.itemName}</Text>
          <Text className="introduction">{detail.itemIntro}</Text>
        </View>

        {/* 规格框入口 */}
        <View className="spec_ctl_wrap">
          <Button className="spec_ctl" onClick={this.handleChooseSpec}>选择规格</Button>
        </View>

        {/* 规格框 */}
        <AtFloatLayout isOpened={visiSpec} className="spec_wrap">
          <View className="spec_module_list">
            {/* 主规格 */}
            <View className="spec_module spec">
              <Text className="title">{specTagName}</Text>
              <View className="spec_item_list">
                {
                  recomSpecList.map(itemRecomSpec => {
                    return(
                      <Button 
                        className={`spec_item ${itemRecomSpec.specName===selectSpecName?'select':''}`}
                        onClick={this.handleChangeSpec.bind(this, itemRecomSpec.specName)}
                      >
                        {itemRecomSpec.specName}
                      </Button>
                    )
                  })
                }
              </View>
            </View>
            {/* 子规格 */}
            <View className="spec_module spec">
              <Text className="title">{classTagName}</Text>
              <View className="spec_item_list">
                {
                  selectClassList.map(itemClass => {
                    return(
                      <Button 
                        className={`spec_item ${itemClass.className===selectClassName?'select':''}`}
                        onClick={this.handleChangeClass.bind(this, itemClass)}
                      >
                        {itemClass.className}
                      </Button>
                    )
                  })
                }
              </View>
            </View>
          </View>
          {/* 购买 */}
          <View className="buy_wrap">
            <View className="drpRecommend_warp">
              代理人邀请码：
              <Input 
                className="drpRecommend" 
                onInput={e=>{this.changeDrpRecommend(e)}} 
                onBlur={e=>{this.changeDrpRecommend(e)}} 
                value={drpRecommend} 
                placeholder="请输入代理人邀请码" 
                maxLength="10"
              />
            </View>
            <Button className="buy" onClick={this.handleBuy}>购买</Button>
          </View>
        </AtFloatLayout>
      </View>
    )
  }
}
