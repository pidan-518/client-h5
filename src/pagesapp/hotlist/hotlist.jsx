import Taro, { Component } from '@tarojs/taro'
import { View, Text, ScrollView, Swiper, SwiperItem, Image } from '@tarojs/components'
import SwiperView from 'swiper'
import 'swiper/css/swiper.css'
import './hotlist.less'
import '../../common/globalstyle.less'
import { postRequest } from '../../common/util/request'
import servicePath from '../../common/util/api/apiUrl'
import utils from '../../common/util/utils'

import CommonEmpty from '../../components/CommonEmpty/CommonEmpty'
import Loading from './components/Loading/Loading'

import lowPreferential from '../../static/hotlist/low.png'
import middlePreferential from '../../static/hotlist/middle.png'
import highPreferential from '../../static/hotlist/high.png'

export default class Hotlist extends Component {
  constructor(props) {
    super(props)
    this.state = {
      current: 0, // 分页切换
      shufflyList: [{}], // 轮播图数据
      newDoodsList: [{}], // 热销新品数据
      hotStyleList: [{}], // 爆款新品数据
      hotClassList: [{}], // 热销分类数据
      hotGoodsList: [{}], // 热销商品数据
      isEmpty: false, // 数据加载的状态数据
      len: 4, // 请求商品的数据长度
      showTopBtn: false, // 显示返回头部按钮
    }

    // 节流开关
    this.requestControl = false // 请求控制

    this.vHeight = 0 // 视口高度
  }

  componentDidHide() {
    window.sessionStorage.setItem('classCurrent', '')
  }

  componentWillMount() {}

  componentDidShow() {
    utils.updateRecommendCode(this.$router.params.shareRecommend) //代理人
  }

  // 小程序分享事件
  onShareAppMessage() {
    const shareRecommend = Taro.getStorageSync('shareRecommend')
    return {
      title: '全球爆款热销榜，挑选尖货全攻略，戳这里！',
      path: `pages/hotlist/hotlist?shareRecommend=${shareRecommend}`,
      imageUrl:
        'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/share/hot-image.jpg',
    }
  }

  componentDidMount() {
    // 加载时读取缓存，无缓存时取0，有缓存时取缓存数据
    let classCurrent = 0
    if (window.sessionStorage.getItem('classCurrent') != '') {
      classCurrent = Number(window.sessionStorage.getItem('classCurrent'))
      // console.log('获取缓存下标：', classCurrent)
    }

    this.getViewPortH()
    window.addEventListener('scroll', this.handlePageScroll)

    // 请求轮播图数据
    this.getData('getShufflyList', 'shufflyList')
    // 精选商品
    this.getData('getSearcChoiceness', 'newDoodsList')
    // 请求热销爆款数据
    this.getData('getHotStyleList', 'hotStyleList')
    // 请求热销分类数据
    postRequest(servicePath.getHotClassList, {
      source: 50,
    }).then(res => {
      if (res.data.code === 0) {
        const hotClassList = res.data.data
        this.setState(
          {
            hotClassList,
          },
          () => {
            this.requestControl = true
            this.initSwiper1()
            this.initTabHeader()
            // 获取商品
            if (this.state.hotClassList[this.state.current].classIdPath != undefined) {
              this.getGoodsList(classCurrent)
            }
            if (classCurrent == 0) {
              this.initSwiper2()
            }
          }
        )
      } else {
        Taro.showModal({
          title: '提示',
          content: '热销分类：' + res.data.msg,
          showCancel: false,
        })
      }
    })
  }

  // 获取数据
  getData = (path, stateName) => {
    const requestpath = servicePath[path]
    postRequest(requestpath, {
      source: 50,
    }).then(res => {
      if (res.data.code === 0) {
        const data = res.data.data
        switch (stateName) {
          case 'shufflyList':
            this.setState({
              shufflyList: data,
            })
            break
          case 'newDoodsList':
            this.setState({
              newDoodsList: data,
            })
            break
          case 'hotStyleList':
            this.setState({
              hotStyleList: data,
            })
            break
          default:
            break
        }
      } else {
        Taro.showModal({
          title: '提示',
          content: res.data.msg,
          showCancel: false,
        })
      }
    })
  }

  // 获取商品数据
  getGoodsList = (classCurrent, datalen = 6) => {
    const firatComIds = this.state.hotClassList[classCurrent].classIdPath

    postRequest(servicePath.getItemListByComIds, {
      comIds: [firatComIds],
      current: 1,
      len: datalen,
      source: 50,
    }).then(res => {
      if (res.data.code === 0) {
        const hotGoodsList = res.data.data.records
        const total = res.data.data.total
        const dataNum = res.data.data.size * res.data.data.current

        let isEmpty = false

        // 总数据小于等于请求的数据量时，数据加载完毕
        if (total <= dataNum) {
          console.log('加载完全！')
          isEmpty = true
          this.requestControl = false
        }
        // 总数据为零时，显示空白组件，不显示数据加载完成
        if (this.state.hotGoodsList.length == 0) {
          console.log('没有商品数据！')
          isEmpty = false
        }

        this.setState({
          hotGoodsList,
          current: classCurrent,
          isEmpty,
          len: datalen,
        })
      } else {
        Taro.showModal({
          title: '提示',
          content: '商品：' + res.data.msg,
          showCancel: false,
        })
      }
    })
  }

  componentWillUnmount() {}

  componentDidUpdate(prevProps, prevState) {
    if (this.state.current !== prevState.current) {
      // this.initTabHeader()
      this.initSwiper2()
    }
  }

  // 首屏轮播图初始化
  initSwiper1() {
    this.swiper2 = new SwiperView('#swiper1', {
      autoplay: true,
      loop: true,
      preventLinksPropagation: false,
      observer: true, //修改swiper自己或子元素时，自动初始化swiper    重要
      observeParents: true, //修改swiper的父元素时，自动初始化swiper  重要
      on: {
        click: e => {
          let link = e.target.getAttribute('data-link')
          this.handleToUrl(link)()
        },
      },
    })
    this.swiper2.init()
  }

  // 商品页初始化
  initSwiper2() {
    const current = this.state.current
    const _this = this

    this.swiper1 = new SwiperView('#swiper2', {
      initialSlide: current,
      preventLinksPropagation: false,
      // autoHeight: true, //高度随内容变化
      observer: true, //修改swiper自己或子元素时，自动初始化swiper    重要
      observeParents: true, //修改swiper的父元素时，自动初始化swiper  重要
      controller: {
        control: this.swiper3,
      },
      on: {
        slideChange: function() {
          console.log('商品页activeIndex为' + this.activeIndex)
          const n = this.activeIndex
          _this.handleSwiperPageChange(n)()
        },
      },
    })
    this.swiper1.init()
  }

  // tabheader初始化
  initTabHeader() {
    const current = this.state.current

    this.swiper3 = new SwiperView('#tabs-header', {
      initialSlide: current,
      observer: true, //修改swiper自己或子元素时，自动初始化
      observeParents: true, //修改swiper的父元素时，自动初始化
      observeSlideChildren: true, // 子元素修改的时候，自动初始化
      slidesPerView: 'auto', // 自适应显示的slide数量
      slideToClickedSlide: true, // 点击slide为activity
      // centeredSlides: true, // slide-activity居中
      // centeredSlidesBounds: true, // slide贴合边缘
      normalizeSlideIndex: false, // slide-activity默认为左，false为右
    })
    this.swiper3.init()
  }

  // 分页切换
  handleSwiperPageChange = n => () => {
    // 禁止切换时触发上拉事件,1000ms后打开请求开关
    this.requestControl = false
    setTimeout(() => {
      this.requestControl = true
    }, 1000)

    // 储存当前下标
    window.sessionStorage.setItem('classCurrent', n)

    this.getGoodsList(n)
    this.handleScrollReset()
  }

  // 重置滚动条位置
  handleScrollReset = () => {
    const query = Taro.createSelectorQuery()
    // query.select('#hotStyleView').boundingClientRect()
    query.select('#hotStyleView').fields(
      {
        rect: true,
        size: true,
        computedStyle: ['margin'],
      },
      function(res) {
        // 此处返回指定要返回的样式名
        res.margin
      }
    )
    query.select('#swiper1').boundingClientRect()
    query.select('.new-product-box').fields(
      {
        rect: true,
        size: true,
        computedStyle: ['margin'],
      },
      function(res) {
        // 此处返回指定要返回的样式名
        res.margin
      }
    )
    query.exec(function(res) {
      // console.log(res[0])
      // console.log(res[1], res[2]) // 显示区域的竖直滚动位置
      const marginBottom = Number(res[0].margin.split(' ')[2].slice(0, -2))
      const marginNum = Number(res[2].margin.split(' ')[0].slice(0, -2))
      const scrollDis = res[1].height + res[2].height + marginBottom + marginNum
      // console.log(scrollDis)
      Taro.pageScrollTo({ scrollTop: scrollDis })
    })
  }

  // 获取视口高度
  getViewPortH = () => {
    const viewport = Taro.createSelectorQuery()
    viewport.selectViewport().boundingClientRect()
    viewport.exec(res => {
      this.vHeight = res[0].height // 显示区域的竖直滚动位置
    })
  }

  // 点击返回头部
  handleScrollTop = () => {
    Taro.pageScrollTo({ scrollTop: 0 })
  }

  // 跳转到APP商品详情
  handleToShopDetail = id => () => {
    if (id) {
      if (window.sessionStorage.getItem('system') === 'android') {
        click.toGoodsDetail(id)
      } else {
        window.webkit.messageHandlers.toGoodsDetail.postMessage(id)
      }
    } else {
      Taro.showToast({
        title: '参数出现null',
        icon: 'none',
      })
    }
  }

  // 页面滑动监听
  handlePageScroll = () => {
    const scrollTop = document.documentElement.scrollTop || window.pageYOffset
    if (scrollTop >= this.vHeight * 2.5 && !this.state.showTopBtn) {
      let showTopBtn = true

      this.setState({
        showTopBtn,
      })
    } else if (scrollTop < this.vHeight * 2.5 && this.vHeight != 0 && this.state.showTopBtn) {
      let showTopBtn = false

      this.setState({
        showTopBtn,
      })
    }
  }

  // 轮播图跳转url
  handleToUrl = link => () => {
    const params = /(http|https):\/\/([\w.]+\/?)\S*/
    if (link.match(params) != null) {
      window.location.href = link
    } else {
      const idIndex = link.indexOf('id=')
      if (idIndex == -1) {
        console.log('链接格式错误！')
      } else {
        this.handleToShopDetail(link.slice(idIndex + 3))()
      }
    }
  }

  config = {
    navigationBarTitleText: '热销榜单',
    onReachBottomDistance: 5,
  }

  // 上拉事件
  onReachBottom() {
    const activityComId = this.state.hotClassList[this.state.current].classIdPath
    if (activityComId == undefined) this.requestControl = false

    console.log('上拉加载,是否可请求：', this.requestControl)

    if (this.requestControl) {
      // 增加请求数据量
      let dataLen = this.state.len + 4

      // 加载商品 && 检测数据是否加载完成
      this.getGoodsList(this.state.current, dataLen)
    }
  }

  render() {
    const { hotClassList, hotGoodsList, current } = this.state

    return (
      <View id="hotlist">
        {this.state.showTopBtn ? (
          <View className="TopBtn" onClick={this.handleScrollTop}></View>
        ) : null}
        {/* 海报轮播图 */}
        <View className="swiper-banner" id="swiper1">
          <View className="swiper-wrapper">
            {this.state.shufflyList.map(item => {
              return (
                <View className="swiper-slide" key={item.picSort}>
                  <img
                    className="swiperItem-img"
                    src={item.picUrl == undefined ? null : utils.transWebp(item.picUrl)}
                    data-link={item.picHyperlinks}
                    alt={'数据出错'}
                  />
                </View>
              )
            })}
          </View>
        </View>

        <View className="new-product-box">
          {/* 精选新品 */}
          <View className="new-product-list">
            <Text className="new-product-title">精品好物</Text>
            <Text className="new-product-title2">为你优选精品好物</Text>

            {/* 新品 */}
            {this.state.newDoodsList.map(item => {
              return (
                <View className="new-product-item" onClick={this.handleToShopDetail(item.itemId)}>
                  <View className="new-product-detail">
                    <Image
                      src={item.logoPath == undefined ? null : utils.transWebp(item.logoPath)}
                      className="logo"
                    />
                    <Text className="brandName">{item.itemName}</Text>
                    <Text className="shopDesc">{item.description}</Text>
                    <Text className="price">
                      ￥{item.discountPrice == null ? item.price : item.discountPrice}
                    </Text>
                  </View>
                  <View className="new-product-shop">
                    <Image
                      src={item.image == undefined ? null : utils.transWebp(item.image)}
                      className="shopImg"
                    />
                    <View className="shopBtn">
                      <Text className="btnDesc">立即购买</Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>

          {/* 热销爆款swiper */}
          <View className="scrollview-box" id="hotStyleView">
            <h3 className="new-product-title">热销爆款</h3>
            <p className="new-product-title2">为你优选精品好物</p>
            <Swiper className="scrollview" nextMargin="80px" onChange={this.handleShopChange}>
              {this.state.hotStyleList.map(item => {
                return (
                  <SwiperItem className="abox" onClick={this.handleToUrl(item.hotHyperlinks)}>
                    <Image
                      src={item.hotUrl == undefined ? null : utils.transWebp(item.hotUrl)}
                      alt="数据出错"
                    />
                  </SwiperItem>
                )
              })}
            </Swiper>
          </View>
        </View>

        {/* 热销分类 */}
        <View id="tabs-header" className="swiper-banner">
          <View className="swiper-wrapper">
            {this.state.hotClassList.map((item, index) => {
              return (
                <View
                  className="tabs-item swiper-slide"
                  onClick={this.handleSwiperPageChange(index)}
                  style={{ width: 'auto' }}
                >
                  <View className={this.state.current === index ? 'btn-item-active' : 'btn-item'}>
                    <Text className="mainTitle">{item.mainTitle}</Text>
                    <Text className="subtitle">{item.subtitle}</Text>
                  </View>
                  {index == this.state.hotClassList.length - 1 ? null : (
                    <View className="line"></View>
                  )}
                </View>
              )
            })}
          </View>
        </View>

        {/* 热销商品--商品列表 */}
        <View className="swiper-box">
          <View className="swiper-banner" id="swiper2">
            <View className="swiper-wrapper">
              {hotClassList.map((item, index) => {
                return (
                  <View className="swiper-slide">
                    {current == index
                      ? hotGoodsList != undefined
                        ? hotGoodsList.map(item => {
                            return (
                              <View
                                className="shop-item"
                                onClick={this.handleToShopDetail(item.itemId)}
                              >
                                <Image
                                  className={
                                    item.taxFree == 0 && item.expressFree == 0
                                      ? 'flag-hide'
                                      : 'flag'
                                  }
                                  src={
                                    item.taxFree == 1
                                      ? item.expressFree == 1
                                        ? highPreferential
                                        : middlePreferential
                                      : item.expressFree == 1
                                      ? lowPreferential
                                      : null
                                  }
                                ></Image>
                                <Image
                                  src={item.image == undefined ? null : utils.transWebp(item.image)}
                                  alt="加载失败"
                                  className="shopImg"
                                />
                                <Text
                                  className="shopTitle"
                                  style={{ '-webkit-box-orient': 'vertical' }}
                                >
                                  {item.itemName}
                                </Text>
                                <View className="shopPrice">
                                  <Text className="symbol">￥</Text>
                                  {item.discountPrice == 0 ? (
                                    <View className="shopPrice-text">
                                      <Text className="integer">0</Text>
                                      <Text className="decimal">.00</Text>
                                    </View>
                                  ) : (
                                    <View className="shopPrice-text">
                                      <Text className="integer">
                                        {String(item.discountPrice).split('.')[0]}
                                      </Text>
                                      <Text className="decimal">
                                        {String(item.discountPrice).split('.')[1] != undefined
                                          ? '.' + String(item.discountPrice).split('.')[1]
                                          : ''}
                                      </Text>
                                      {item.discountPrice === item.price ? null : (
                                        <Text className="originalPrice">￥{item.price}</Text>
                                      )}
                                      {item.sign == null ? null : (
                                        <Image
                                          className="sign"
                                          src={utils.transWebp(item.sign)}
                                        ></Image>
                                      )}
                                    </View>
                                  )}
                                </View>
                              </View>
                            )
                          })
                        : null
                      : null}
                    {current == index ? (
                      hotGoodsList.length != 0 ? (
                        this.state.isEmpty ? (
                          <Text className="bottomTip">-已经没有数据了-</Text>
                        ) : (
                          <Loading color={'#109b9a'}></Loading>
                        )
                      ) : (
                        <CommonEmpty content="没有数据" />
                      )
                    ) : (
                      <Loading color={'#109b9a'}></Loading>
                    )}
                  </View>
                )
              })}
            </View>
          </View>
        </View>
      </View>
    )
  }
}
