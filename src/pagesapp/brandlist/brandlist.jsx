import Taro, { Component } from '@tarojs/taro'
import { View, Text,Image,ScrollView,Input } from '@tarojs/components'
import './brandlist.less'
import bgImage from '../../static/hotlist/swiper.png'
import moreIc from '../../static/brand/more.png'
import closeIc from '../../static/brand/close.png'
import icBaoyou from '../../static/hotlist/low.png'
import icBaoshui from '../../static/hotlist/middle.png'
import icBaoys from '../../static/hotlist/high.png'
import { postRequest } from '../../common/util/request';
import servicePath from '../../common/util/api/apiUrl';
import utils from "../../common/util/utils";
import CommonEmpty from '../../components/CommonEmpty/CommonEmpty';

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowSelect: false,
      isShowModal: false,
      brandImage: '',
      list: [],
      current:1,
      pages:1,
      priceSort:'', //价格排序 0=降序，1=升序
      minPrice:'',//价格区间 最低价
      maxPrice:'',//价格区间 最高价	
      taxFree:'',//包税 0=不包税， 1=包税
      expressFree: '', // 包邮 0=不包邮， 1=包邮
      saleSort: '', // 销量排序 0=降序，1=升序
    }
  }
  componentWillMount () { }

  componentDidMount () {
    console.log(this.$router.params.brandId);
    Taro.setNavigationBarTitle({
      title: this.$router.params.name
    })
    this.getItemByBrandId(1)
    this.setState({
      brandImage:window.sessionStorage.getItem('brandImage')
    })
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }
  navigateTo(url){
    Taro.navigateTo({
      url,
    })
  }
  onShareAppMessage () {
    const shareRecommend = Taro.getStorageSync('shareRecommend');
    return {
      title: '优质品牌，低价闪购，每日上新别错过！',
      path: `/pagesapp/brand/brand?shareRecommend=${shareRecommend}`,
      imageUrl:'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/share/brand-image.jpg'
    }
  }
  onReachBottom() { // 上拉加载
    console.log('到底了',this.state.current);
    if (this.state.current === this.state.pages) {
      console.log("进入");
    } else if (this.state.pages !== 0) {
      Taro.showLoading({
        title: '正在加载...'
      })
      this.getItemByBrandId(this.state.current + 1)
    }
  }
  getItemByBrandId(current){
    postRequest(servicePath.getItemByBrandId, {source:50,current,len:10,brandId:this.$router.params.brandId,
    priceSort:this.state.priceSort,
    minPrice:this.state.minPrice,
    maxPrice:this.state.maxPrice,
    taxFree:this.state.taxFree,
    expressFree: this.state.expressFree,
    saleSort: this.state.saleSort, })
      .then(res => {
        console.log("获取品牌分类列表成功", res.data);
        if (res.data.code === 0) {
          if(current==1){
            Taro.pageScrollTo({
              scrollTop:0,
              duration:300,
            })
          }
          this.setState({
            list: current==1?[...res.data.data.records]:[...this.state.list,...res.data.data.records],
            current:res.data.data.current,
            pages:res.data.data.pages,
          })
          Taro.hideLoading();
        }
      })
      .catch(err => {
        console.log("获取品牌分类列表失敗", err);
      })
  }
  getModel=()=>{
    this.setState({
      isShowModal: !this.state.isShowModal,
      isShowSelect:false,
    })
  }
  getSelect=()=>{
    this.setState({
      isShowSelect: !this.state.isShowSelect,
      isShowModal: false,
    })
  }
  getSelectsale=()=>{
    this.setState({
      priceSort:'',
      saleSort:this.state.saleSort==1?0:1,
      current:1,
    },()=>{
      this.getItemByBrandId(1)
    })
  }
  getSelectlist=(e)=>{ // 综合排序
    this.setState({
      priceSort:e,
      saleSort:'',
      current:1,
      isShowSelect: false,
    },()=>{
      console.log(this.state.priceSort);
      this.getItemByBrandId(1)
    })
    
  }
  change(e,item){ // input双向绑定
    let value = e.target.value
    // value = value.replace(/\D/g,'')
    value = (value.match(/^\d*(\.?\d{0,2})/g)[0]) || null
    this.setState({
      minPrice:item=='minPrice'?value:this.state.minPrice,
      maxPrice:item=='maxPrice'?value:this.state.maxPrice,
    })
    console.log(this.state.minPrice,this.state.maxPrice);
  }
  getSelectFree=(item)=>{ // 包邮包税
    let taxFree = 0
    let expressFree = 0
    if(item=='two'){
      if(this.state.taxFree===1&&this.state.expressFree===1){
        taxFree = ''
        expressFree = ''
      } else {
        taxFree = 1
        expressFree = 1
      }
    } else if (item=='expressFree'){
      if(this.state.taxFree===''&&this.state.expressFree===1){
        taxFree = ''
        expressFree = ''
      } else {
        taxFree = ''
        expressFree = 1
      }
    } else {
      if(this.state.taxFree===1&&this.state.expressFree===''){
        taxFree = ''
        expressFree = ''
      } else {
        taxFree = 1
        expressFree = ''
      }
      
    }
    this.setState({
      taxFree,
      expressFree,
    })
    e.stopPropagation();
  }
  getSubmit=(e)=>{ // 筛选框按钮
    if(e=='reset'){
      this.setState({
        minPrice:'',
        maxPrice:'',
        expressFree:'',
        taxFree:'',
      })
    } else {
      console.log(this.state.minPrice,this.state.maxPrice);
      if(this.state.maxPrice&&(Number(this.state.maxPrice)<=Number(this.state.minPrice))){
        Taro.showToast({
          title: '最高价不可小于最低价',
          icon: 'none',
          duration: 2000
        })
        return
      }
      this.setState({
        isShowModal:false,
        current:1,
      },()=>{
        this.getItemByBrandId(1)
        // Taro.pageScrollTo({
        //   scrollTop:0,
        //   duration:300,
        // })
      })
    }
    e.stopPropagation();
  }
  getNavigateApp=(e,item)=>{
    console.log(item,'11111111');
    if (item.itemId) {
      if (window.sessionStorage.getItem('system') === 'android') {
        click.toGoodsDetail(item.itemId)
      } else {
        window.webkit.messageHandlers.toGoodsDetail.postMessage(item.itemId)
      }
    } else {
      Taro.showToast({
        title: '参数出现null',
        icon: 'none',
      })
    }
    e.stopPropagation();
  }
  config = {
    navigationBarTitleText: this.$router.params.name!='null'?decodeURI(this.$router.params.name):'品牌闪购'
  }

  render () {
    const { brandImage,isShowSelect,isShowModal,list,minPrice,maxPrice,taxFree,expressFree,pages,current,saleSort,priceSort } = this.state
    return (
      <View className='brandlist'>
        <Image className="bg" src={brandImage}></Image>
        <View className="select">
          <View className={saleSort===''?"item on":'item'} onClick={this.getSelect}>{priceSort===0?'价格降序':priceSort===1?'价格升序':'综合排序'}</View>
          <View className={saleSort===1||saleSort===0?"item on":'item'} onClick={this.getSelectsale}>销量</View>
          <View className="item no-border" onClick={this.getModel}>筛选<Image className="ic" src={moreIc}></Image></View>
          {/* 综合排序 */}
          {isShowSelect?<View className="item-select">
            <View className="text" onClick={this.getSelectlist.bind(this,'')}>综合排序</View>
            <View className="text" onClick={this.getSelectlist.bind(this,1)}>价格升序</View>
            <View className="text" onClick={this.getSelectlist.bind(this,0)}>价格降序</View>
          </View>:''}
          
        </View>
        <View className="list">
          {
            list.length==0?<CommonEmpty content="暂无数据" />:
            list.map((item,index)=>{
              return <View className="goodItem" onClick={(e)=>this.getNavigateApp(e,item)}>
                <View className="bao">
                  {item.expressFree==1&&item.taxFree==0?<Image className="bg-bao" src={icBaoyou}></Image>:''}
                  {item.expressFree==1&&item.taxFree==1?<Image className="bg-bao" src={icBaoys}></Image>:''}
                  {item.expressFree==0&&item.taxFree==1?<Image className="bg-bao" src={icBaoshui}></Image>:''}
                </View>
              <Image className="pic" src={utils.transWebp(item.image)}></Image>
              <View className="name">{item.itemName}</View>
              <View className="price">
              ￥{item.discountPrice}{item.discountPrice!=item.price?<Text className="old">￥{item.price}</Text>:''}
              <Image className="logo" src={utils.transWebp(item.sign)}></Image>
              </View>
            </View>
            })
          }
          
        </View>
        {
            pages==current?<View className="no-more">-没有更多啦-</View>:''
          }
        {/* 筛选 */}
        {
          isShowModal?<View className="model" onClick={this.getModel}>
          <View className={isShowModal?"dailog on":'dailog'} onClick={()=>{e.stopPropagation();}}>
            <Image className="close" src={closeIc} onClick={this.getModel}></Image>
            <View className="title">折扣和服务</View>
            <View className="select-item">
              <View className={expressFree==1&&taxFree==0?"item on":'item'} onClick={this.getSelectFree.bind(this,'expressFree')}>包邮</View>
              <View className={taxFree==1&&expressFree==0?"item on":'item'} onClick={this.getSelectFree.bind(this,'taxFree')}>包税</View>
              <View className={expressFree==1&&taxFree==1?"item on":'item'} onClick={this.getSelectFree.bind(this,'two')}>包邮包税</View>
            </View>
            <View className="title">价格区间</View>
            <View className="price-div">
              <Input className='inp' type='number' placeholder='最低价' value={minPrice} onChange={(event)=>{this.change(event,'minPrice')}}></Input>
              <Text className='zhi'>-</Text>
              <Input className='inp' type='number' placeholder='最高价' value={maxPrice} onChange={(event)=>{this.change(event,'maxPrice')}}></Input>
            </View>
            <View className="btn">
              <View className="reset" onClick={this.getSubmit.bind(this,'reset')}>重置</View>
              <View className="sub" onClick={this.getSubmit.bind(this,'submit')}>确定</View>
            </View>
          </View>
        </View>:''
        }
        
      </View>
    )
  }
}
