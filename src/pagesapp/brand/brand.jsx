import Taro, { Component } from '@tarojs/taro'
import { View, Text,Image,ScrollView } from '@tarojs/components'
import Swiper from 'swiper';
import 'swiper/css/swiper.css';
import './brand.less'
import { postRequest } from '../../common/util/request';
import servicePath from '../../common/util/api/apiUrl';
import utils from "../../common/util/utils";

import bgImage from '../../static/hotlist/swiper.png'
import Index from 'src/pages/index';

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bottom: true,
      id:0,
      border: 0,
      list: [],
      top:[],
      detailList: [],
      current:1,
      pages:1,
      brandCategoryId:'',
      moveStart:'',
      swiperList:[],
    }
  }
  componentWillMount () { }

  componentDidMount () {
    this.getBrandCategoryList()
    this.initSwiper()
   }

  componentWillUnmount () { }

  componentDidShow () {
    if(this.$router.params.shareRecommend){
      utils.updateRecommendCode(this.$router.params.shareRecommend); //绑定、存储代理码
    }
   }

  componentDidHide () { 
    window.sessionStorage.setItem('brandIndex','')
  }
  onShareAppMessage () {
    const shareRecommend = Taro.getStorageSync('shareRecommend');
    return {
      title: '优质品牌，低价闪购，每日上新别错过！',
      path: `/pagesapp/brand/brand?shareRecommend=${shareRecommend}`,
      imageUrl:'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/share/brand-image.jpg'
    }
  }
  // 上拉事件
  onReachBottom() {
    console.log('到底了');
    if (this.state.current === this.state.pages) {
      console.log("进入");
    } else if (this.state.pages !== 0) {
      // Taro.showLoading({
      //   title: '正在加载...'
      // })
      this.getBrandSessionList(this.state.current + 1,this.state.brandCategoryId)
    }
  }

  getBrandCategoryList() {
    postRequest(servicePath.getBrandCategoryList, {source:50})
      .then(res => {
        console.log("获取品牌分类列表成功", res.data);
        if (res.data.code === 0) {
          const swiperList = new Array(res.data.data.length).fill([])
          this.setState({
            swiperList,
          },()=>{
            console.log('11111111111',this.state.swiperList);
          })
          console.log('swiperList',swiperList);
          if(window.sessionStorage.getItem('brandIndex')){
            const index = Number(window.sessionStorage.getItem('brandIndex'))
            this.setState({
              list:res.data.data,
              brandCategoryId:res.data.data[index].id,
              id:index,
            })
            this.getBrandSessionList(1,res.data.data[index].id)
            this.swiper1.slideTo(index, 0, false);
          } else {
            this.setState({
              list:res.data.data,
              brandCategoryId:res.data.data[0].id
            })
            this.getBrandSessionList(1,res.data.data[0].id)
          }
        }
      })
      .catch(err => {
        console.log("获取品牌分类列表失敗", err);
      })
  }
  getBrandSessionList(current,brandCategoryId) {
    postRequest(servicePath.getBrandSessionList, {source:50,brandCategoryId,current,len:4,})
      .then(res => {
        console.log("获取品牌分类列表成功", res.data);
        console.log('index',this.state.id);
        if (res.data.code === 0) {
          let list = this.state.swiperList
          // list[this.state.id] = this.state.detailList
          this.setState({
            detailList: current==1?[...res.data.data.records]:[...this.state.detailList,...res.data.data.records],
            current:res.data.data.current,
            pages:res.data.data.pages,
            brandCategoryId,
          },()=>{
            list[this.state.id] = this.state.detailList
            this.setState({
              swiperList:list,
            },()=>{
              console.log('222222222222',this.state.swiperList);
              // this.initSwiper()
            })
          })
          // Taro.hideLoading();
          document.getElementById('div1').scrollLeft= document.getElementById('a'+this.state.id).offsetLeft - 100
        }
      })
      .catch(err => {
        console.log("获取品牌分类列表失敗", err);
      })
  }
  getNavigate(item){
    Taro.navigateTo({
      url:'/pagesapp/brandlist/brandlist?brandId='+item.brandId+'&name='+item.title
    })
    window.sessionStorage.setItem('brandImage',item.insideImage?item.insideImage:item.image)
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
  getmoreList=()=>{
    this.setState({
      bottom:!this.state.bottom,
    })
  }
  getSelectList=(e,type)=>{
    this.swiper1.slideTo(e, 0, false);
    this.getBrandSessionList(1,this.state.list[e].id)
    this.setState({
      brandCategoryId:this.state.list[e].id,
      id:e,
      bottom:type=='dai'?!this.state.bottom:this.state.bottom
    })
    document.getElementById('div1').scrollLeft= document.getElementById('a'+e).offsetLeft - 100
    // console.log(document.getElementById('div1').scrollLeft,document.getElementById('a'+e).offsetLeft);
    Taro.pageScrollTo({
      scrollTop:0,
      duration:100,
    })
    window.sessionStorage.setItem('brandIndex',e)
  }
  initSwiper() { // 初始化swiper
    this.swiper1 = new Swiper('.swiper-container', {
      loop: false,
      watchSlidesProgress : true,
      autoHeight: true,
      on:{
        sliderMove:()=>{
          // console.log('index111111111',this.swiper1.activeIndex);
          if(this.state.id!=this.swiper1.activeIndex){
            this.setState({
              brandCategoryId:this.state.list[this.swiper1.activeIndex].id,
              id:this.swiper1.activeIndex,
            },()=>{
              this.getBrandSessionList(1,this.state.list[this.swiper1.activeIndex].id)
              Taro.pageScrollTo({
                scrollTop:0,
                duration:100,
              })
            })
          }
        },
        slideChange:()=>{
          if(this.state.id!=this.swiper1.activeIndex){
            this.setState({
              brandCategoryId:this.state.list[this.swiper1.activeIndex].id,
              id:this.swiper1.activeIndex,
            },()=>{
              this.getBrandSessionList(1,this.state.list[this.swiper1.activeIndex].id)
              Taro.pageScrollTo({
                scrollTop:0,
                duration:100,
              })
            })
          }
        }
      },
      preventLinksPropagation: false,
      autoplay:false,
      observer: true, //修改swiper自己或子元素时，自动初始化swiper    重要
      observeParents: true, //修改swiper的父元素时，自动初始化swiper  重要
    });
    this.swiper1.init();
  }
  config = {
    navigationBarTitleText: '品牌闪购',
    onReachBottomDistance: 2,
  }

  render () {
    const { bottom,list,id,border,detailList,current,pages,swiperList } = this.state
    return (
      <View className='brand'  id='div2'>
        {/* onTouchMove={(e)=>this.onTouchMove(e)} onTouchStart={(e)=>this.onTouchStart(e)} onTouchEnd={(e)=>this.onTouchEnd(e)} */}
        <View className="topTab">
          <View className="top">
            <View className="scrollView" id='div1'>
              {
                list.map((item,index)=>{
                  return <View className={id==index?"item on":'item'} onClick={this.getSelectList.bind(this,index,'top')} id={'a'+index}>{item.title}</View>
                })
              }
            </View>
            <View className="list" onClick={this.getmoreList}>分类</View>
          </View>
          <View className={bottom?"posi":'posi on'}>
            {
              list.map((item,index)=>{
                return <View className={id==index?"item on":'item'} onClick={this.getSelectList.bind(this,index,'dai')}>{item.title}</View>
              })
            }
          </View>
          {bottom?'':<View className="model"  onClick={this.getmoreList}></View>}
        </View>
        <View className="bottom" >
            <View className="rio">
              <View className="blue" style={'transform:scaleX('+1*border+')'}></View>
            </View>
            <View className="swiper-container">
              <View className="swiper-wrapper">
                  {
                    swiperList.map((itemN,indexN)=>{
                      return <View className="swiper-slide">
                        {
                          itemN.map((item,index)=>{
                                return <View className="brandList" onClick={this.getNavigate.bind(this,item)}>
                                <Image className="bg" src={utils.transWebp(item.image?item.image:'')}></Image>
                                <View className="itemList">
                                  {
                                    item.itemList?item.itemList.map((itemA,indexA)=>{
                                      return <View className="good" onClick={(e)=>this.getNavigateApp(e,itemA)}>
                                        <Image className="pic" src={utils.transWebp(itemA.image)}></Image>
                                        <View className="price">￥{itemA.discountPrice} {itemA.discountPrice!=itemA.price?<Text className="old">￥{itemA.price}</Text>:''}</View>
                                      </View>
                                    }):''
                                  }
                                </View>
                              </View>
                          })
                        }
                      </View>
                    })
                  }
              </View>
            </View>
              {/* {
                detailList.map((item,index)=>{
                      return <View className="brandList" onClick={this.getNavigate.bind(this,item)}>
                      <Image className="bg" src={utils.transWebp(item.image?item.image:'')}></Image>
                      <View className="itemList">
                        {
                          item.itemList?item.itemList.map((itemA,indexA)=>{
                            return <View className="good" onClick={(e)=>this.getNavigateApp(e,itemA)}>
                              <Image className="pic" src={utils.transWebp(itemA.image)}></Image>
                              <View className="price">￥{itemA.discountPrice} {itemA.discountPrice!=itemA.price?<Text className="old">￥{itemA.price}</Text>:''}</View>
                            </View>
                          }):''
                        }
                      </View>
                    </View>
                })
              } */}
              {
                // &&detailList.length>=3&&id+1!=list.length
                current==pages?<View className="more">-没有更多啦-</View>:''
              }
        </View>
        {/* {
          // &&detailList.length>=3&&id+1!=list.length
          current==pages?<View className="more">-没有更多啦-</View>:''
        } */}
      </View>
    )
  }
}
