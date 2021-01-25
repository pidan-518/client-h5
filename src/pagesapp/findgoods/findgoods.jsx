import Taro, { Component } from '@tarojs/taro';
import { View, Text, ScrollView, Image, Swiper, SwiperItem } from '@tarojs/components'
import background from './static/background.png'
import "../../common/globalstyle.less";
import "./findgoods.less";
import { postRequest } from '../../common/util/request';
import servicePath from '../../common/util/api/apiUrl';
import utils from "../../common/util/utils"
export default class Findgoods extends Component {
	constructor(props) {
		super(props);
		this.state = {
			goodsList: [], //商品列表
			tabsIndex: 0, // tabs id
			tabsList: [{ image: ' ' }],// 分类tab数据
			tabScroll: 0, // tabs自动偏移
			windowWidth: '', // 窗口总大小
			widowHeight: '',//屏幕长度
			currentPage: 1, //当前页
			pageTotal: 2, //总页数
			loading: false,//上拉加载动画
			limit: true, //限流阀 防止上拉多次请求
			backtop: false,//显示回到顶部按钮
		}
	}
	config = {
		navigationBarTitleText: '好物推荐',
		onReachBottomDistance: 50,
	}
	componentWillMount() { }

	componentDidMount() {
		//获取屏幕宽度
		Taro.getSystemInfo({
			success: res => {
				this.setState({
					windowWidth: res.windowWidth,
					widowHeight: res.windowHeight * 2
				}, () => { console.log(this.state.widowHeight * 2) })
			}
		})
		if (window.sessionStorage.getItem('Index')) {
			this.setState({
				tabsIndex: Number(window.sessionStorage.getItem('Index')),
				tabScroll: Number(window.sessionStorage.getItem('tabScroll'))
			}, () => { this.getProductList(), console.log(this.state.tabsIndex, 'dui') })
		} else {
			this.getProductList()
		}
		utils.updateRecommendCode(this.$router.params.shareRecommend)
	}

	componentWillUnmount() { }

	componentDidShow() { }

	componentDidHide() {
		window.sessionStorage.setItem("Index", '')
		window.sessionStorage.setItem("tabScroll", '')
	}
	//头部bar切换
	handleTabsClick = (e1, index) => {
		let e = document.querySelector(`#v${index}`)
		console.log(e)
		if (this.state.tabsIndex !== index) {
			let actId = this.state.tabsList[index].categoryComId
			let tabWidth = this.state.windowWidth;
			this.setState({
				tabScroll: (e.offsetLeft - tabWidth / 2 + 50),
				tabsIndex: index,
				goodsList: [],
				currentPage: 1,
				pageTotal: 1,
				loading: true,
			},
				() => {
					window.sessionStorage.setItem("Index", index),
						window.sessionStorage.setItem("tabScroll", this.state.tabScroll)
					this.getGoodsList(1, actId), console.log(this.state.tabScroll, '99999')
				}
			);
		}
	}
	// scroll滚动事件
	handleScrollEvent = (e) => {
		if (e.detail.scrollTop > 1000) {
			!this.state.backtop && this.setState({ backtop: true })
		} else {
			this.state.backtop && this.setState({ backtop: false })
		}
	}
//点击回到顶部
	clickTop = () => {
		this[`scrollview${this.state.tabsIndex}`].container.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
	}
	//跳转商品详情
	handleClickGood = (item) => {
		console.log(window.sessionStorage.getItem('system'))
		if (item.itemId) {
			if (window.sessionStorage.getItem('system') === 'android') {
				click.toAppPage(`iconmall://goodsdetail?id=${item.itemId}`)
			} else {
				window.webkit.messageHandlers.toAppPage.postMessage({
					path: `iconmall://goodsdetail?id=${item.itemId}`,
				})
			}
		} else {
			Taro.showToast({
				title: '参数出现null',
				icon: 'none'
			})
		}
	}
	//获取头部导航列表
	getProductList = () => {
		postRequest(servicePath.getItemListByKey, {
			"key": "FOUND_GOOD_THINGS", "source": "50",
		})
			.then(response => {
				console.log("获取头部导航列表成功", response);
				this.setState({ tabsList: response.data.data[0].itemCategoryList }, () => {
					console.log('列表首个categoryComId', this.state.tabsList), this.getGoodsList(1, this.state.tabsList[this.state.tabsIndex].categoryComId)
				})
			})
			.catch(err => {
				console.log("获取列表失败", err);
			})
	}
	//获取分类查询活动商品列表
	getGoodsList = (currentPage = 1, categoryComId) => {
		postRequest(servicePath.getItemByComIds, {
			"source": "50",
			"current": currentPage,
			"len": 10,
			"comIds": [categoryComId]
		})
			.then(response => {
				console.log("获取分页查询活动商品", response);
				this.setState(prevState => {
					return {
						goodsList: [...prevState.goodsList, ...response.data.data.records],
						currentPage: response.data.data.current,
						pageTotal: Math.ceil(response.data.data.total / 10),
						loading: false,
						limit: true
					}
				}, () => { console.log('1142', this.state.goodsList, this.state.currentPage, this.state.pageTotal) })
			})
			.catch(err => {
				console.log("获取列表失败", err);
			})
	}
	//点击头部图片跳转
	handleNavigateTo = () => {
		const { tabsList, tabsIndex } = this.state
		console.log(tabsList[tabsIndex].url, '232322')
		let str = tabsList[tabsIndex].url
		const params = /(http|https):\/\/([\w.]+\/?)\S*/
		if (str.match(params) != null) {
			window.location.href = str
		} else {
			const idIndex = str.indexOf('id=')
			if (idIndex == -1) {
				console.log('链接格式错误！')
			} else {
				this.handleClickGood({ 'itemId': str.slice(idIndex + 3) })
			}
		}
	}
	//分享
	onShareAppMessage() {
		const shareRecommend = Taro.getStorageSync('shareRecommend');
		return {
			title: '爱港猫好物种草机，平价正货随便买！',
			path: `pages/findgoods/findgoods?shareRecommend=${shareRecommend}`,
			imageUrl: 'https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/share/findgoods-image.jpg'
		}
	}
	//阻断scrollview的阻止冒泡
	through = () => {
		return true
	}
	//上拉加载
	onScrollToUpper = () => {
		if (!this.state.limit) { return; }
		this.setState({ limit: false })
		if (this.state.currentPage < this.state.pageTotal) {
			console.log('上拉')
			let ind = this.state.tabsIndex
			let actId = this.state.tabsList[ind].categoryComId
			this.getGoodsList(this.state.currentPage + 1, actId)
			this.setState({ loading: true})
		} else {
			this.setState({ loading: false })
			console.log('到底了')
		}
	}
	//swiper切换
	swiperChange = (e) => {
		let even = document.querySelector(`#v${e.detail.current}`)
		this.setState({
			tabsIndex: e.detail.current,
			backtop: false
		})
		let index = e.detail.current
		if (this.state.tabsIndex !== index) {
			let actId = this.state.tabsList[index].categoryComId
			let tabWidth = this.state.windowWidth;
			this.setState({
				tabScroll: (even.offsetLeft - tabWidth / 2 + 50),
				tabsIndex: index,
				goodsList: [],
				currentPage: 1,
				pageTotal: 1,
				loading: true,
			},
				() => {
					window.sessionStorage.setItem("Index", index),
						window.sessionStorage.setItem("tabScroll", this.state.tabScroll)
					this.getGoodsList(1, actId)
				}
			);
		}

	}
	transition = (e) => {
		console.log(e)
	}
	render() {
		const { goodsList, tabScroll, tabsList, tabsIndex } = this.state
		let image = (((tabsList[tabsIndex]) || '').image == null ? background : ((tabsList[tabsIndex]) || ' ').image)
		return (
			<View className="specialOfferCategory">
				<ScrollView scrollX="true" scrollAnchoring={true} className="categoryTabs" scrollLeft={tabScroll} scrollWithAnimation >
					{
						tabsList.map((item, index) =>
							<View
								className={index === tabsIndex ? "tabsItem itemSelect" : "tabsItem"}
								key={item.id}
								id={`v${index}`}
								onClick={(e) => { this.handleTabsClick(e, index) }}
							>
								<View className="itemTxt">
									{(item.title == null || item.title == "") ? item.name : item.title}
								</View>
							</View>
						)
					}
				</ScrollView>
				<Swiper
					className='swiper'
					onChange={this.swiperChange}
					onTransition={this.transition}
					current={this.state.tabsIndex}
				>
					{tabsList.map((_, index) => {
						return (
							<SwiperItem
								className='swiperItem'>
								{this.state.tabsIndex == index ?
									<ScrollView
										scrollY
										ref={el => this[`scrollview${index}`] = el}
										enableBackToTop={true}
										scrollWithAnimation
										onScroll={this.handleScrollEvent}
										onTouchMove={this.through}
										onScrollToLower={this.onScrollToUpper}
										className='scrollview'>
										<View className='content' id='content'>
											<View className='background' onClick={this.handleNavigateTo}>
												<Image className='backgroundImage' src={utils.transWebp(image)} ></Image>
											</View>
											<View className="tabsContent">
												{goodsList.map((item) =>
													<View className='goodList' onClick={() => { this.handleClickGood(item) }}>
														<View className='leftImg'>
															<Image src={utils.transWebp(item.image)} />
														</View>
														<View className='rightText'>
															<Text className='goodsTitle'>{item.itemName}</Text>
															<Text className='goodsContent'>{item.itemIntro}</Text>
															<View className='goodsfoot'>
																<View className='goodsPrice'>
																	<Text className='Price'>￥{item.discountPrice}</Text>
																	<Text className={item.discountPrice == item.price ? 'hidden' : 'discountPrice'} hidden={true}>￥{item.price}</Text>
																</View>
																<View className='goodsCat' >查看详情</View>
															</View>
														</View>
													</View>)}
												<View className={goodsList.length == 0 ? "noList" : ''}>
													{this.state.loading == true
														? <View className='load-more'>
															<span></span>
															<span></span>
															<span></span>
															<span></span>
															<span></span></View>
														: null}
												</View>
												{goodsList.length > 0 && this.state.pageTotal == this.state.currentPage ? <View style='text-align:center;font-size:12px' >--没有更多了--</View> : null}
											</View>
										</View>
									</ScrollView> : null}
							</SwiperItem>
						)
					})}
				</Swiper>
				<View id='backTop' className="backtop" hidden={!this.state.backtop} onClick={this.clickTop}> <img src="https://iconmall-developer.oss-cn-beijing.aliyuncs.com/png/small/public/top.png" alt="" />  </View>
			</View>
		)
	}
}
