import Taro, { Component } from '@tarojs/taro';
import { View, Text, Checkbox, Button, Input, Form } from '@tarojs/components'
import { CarryTokenRequest } from '../../common/util/request';
import ServicePath from "../../common/util/api/apiUrl";
import "../../common/globalstyle.less";
import { setGlobalData, getGlobalData } from '../../common/util/global_data'
import "./ordersubmit.less";

export default class OrderSubmit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visiAddAddress: false,
      visiChangeAddress: false,
      totalAmount: 0, //总价（不含运税费）
      itemAmount: 0,  //商品总数量
      cityData: "",
      visiRealName: false,  //实名认证框
      visiMask: false, //是否显示遮罩
      ifAccountUnreal: false,  //帐户是否未实名
      isAccountRealAuth: false,  //是否设为帐户实名信息
      "logisticsFee": 0.00, //运费
      "taxFee": 0.00, //税费
      "addressId": 31,  //暂弃用
      "pageOrderPayInfo": {},
      "receiveInfo": {
        "name": "",
        "phone": "",
        "phoneT": "",
        "area": "",
        "addDetail": "",
        "addressId": 1
      },
      "storeList": [],
      "addressList": [], //地址列表
      goodsFrom: '',  //跳转来源（商品）
      recommend: 0,  //代理人id
      detailReqList: [],  //营销商品信息
    }
  }


  //接收“购物车/营销商品详情”页面信息
  getPageCart = () => {
    const pageSubmitData = JSON.parse(window.sessionStorage.getItem('pageSubmitData'))
    const r = pageSubmitData.pageSubmitInfo

    this.setState({ //订单信息
      "goodsFrom": pageSubmitData.goodsFrom,  //跳转来源（商品）
      "recommend": pageSubmitData.recommend,  //代理人id
      "detailReqList": pageSubmitData.detailReqList,  //营销商品信息
      "logisticsFee": r.totalLogisticsFee,
      "taxFee": r.totalTaxFee,
      "storeList": r.shoppingCartList.map(s => {
        return (
          {
            "storeId": s.shopId,
            "storeName": s.shopName,
            "proList": s.detailVOList.map(p => {
              return (
                {
                  "proID": p.itemId,
                  "id": p.id,
                  "img": p.image,
                  "proInfo": p.itemName,
                  "singlePrice": p.price, 
                  "amount_amount": p.itemNum,
                  "type": p.specName,
                  "subType": p.className,
                  "discount": 0,
                  "amount": p.price * p.itemNum
                }
              )
            })
          }
        )
      })
    }, () => {
      this.totalAmount(); //计算总价
      this.getLogisticsAddress();
      this.countItem(); //计算商品总数量
    });
  }


  //---------------------------------------地址相关--------------------------------------//

  //获取地址
  getLogisticsAddress = () => {
    const postData = {
      "current": 1,
      "len": 20
    };

    CarryTokenRequest(ServicePath.logisticsAddress, postData)
      .then(res => {
        if (res.data.code === 0) {
          const rr = res.data.data.records
          if (rr.length === 0) {  //尚无地址时，弹出添加地址框 
            this.openAddAddreass()
          } else {  //有地址时，更新地址信息
            let currentAddress = {}
            rr.forEach(itemAddress => {
              if (itemAddress.inCommonUse === 1) {
                currentAddress = itemAddress;
              }
            })
            if (JSON.stringify(currentAddress) === "{}") {  //无默认地址时使用第一个地址
              currentAddress = rr[0]
            }
            this.setState({
              "addressList": rr,  //地址列表
            }, () => {
              if (JSON.parse(window.sessionStorage.getItem('selectAddressID'))) { //从选择地址页面返回时
                const selectAddressID = JSON.parse(window.sessionStorage.getItem('selectAddressID'));
                let selectAddress = {};
                this.state.addressList.forEach(itemAddress => {
                  if (itemAddress.addressId === selectAddressID) {
                    selectAddress = itemAddress
                  }
                })
                this.setState({
                  receiveInfo: {
                    "name": selectAddress.addresser,
                    "phone": selectAddress.telephone,
                    "postalCode": selectAddress.postalCode,
                    "area": selectAddress.regionPath,
                    "addDetail": selectAddress.addressInfo,
                    "addressId": selectAddress.addressId
                  }
                }, () => {
                  this.feeUpdate()
                })
              } else { //其它页面（非地址选择页）跳转来时
                this.setState({
                  receiveInfo: {
                    "name": currentAddress.addresser,
                    "phone": currentAddress.telephone,
                    "postalCode": currentAddress.postalCode,
                    "area": currentAddress.regionPath,
                    "addDetail": currentAddress.addressInfo,
                    "addressId": currentAddress.addressId
                  }
                })
              }
            })
          };
        }
      })
  }

  //修改地址后重新计算运费、税费
  feeUpdate = () => {
    let postUrl = ''
    let postData = {}
    if (this.state.goodsFrom!=='drp') { //普通流程
      postUrl = ServicePath.gotoSettlement
      postData = {
        "shoppingDetailList": JSON.parse(window.sessionStorage.getItem('pageSubmitData')).shoppingDetailList,
        "addressId": this.state.receiveInfo.addressId
      }
    } else {  //营销流程
      postUrl = ServicePath.msGotoSettlement
      postData = {
        recommend: this.state.recommend,
        detailReqList: this.state.detailReqList
      }
    }
    CarryTokenRequest(postUrl, postData)
      .then(res => {
        if (res.data.code === 0) {
          const rdd = res.data.data
          this.setState({
            "logisticsFee": rdd.totalLogisticsFee,
            "taxFee": rdd.totalTaxFee
          })
        } else {
          Taro.showToast({
            // title: res.data.msg,
            title: '异常 - msg2',
            icon: 'none'
          })
        }
      })
  }

  //---------------------------------------------------------------------------------//

  //计算总价+商品总数量
  totalAmount = () => {
    let a = 0
    this.state.storeList.map(itemStore => {
      itemStore.proList.forEach(p => {
        a = a + p.amount
      })
    })
    this.setState({
      totalAmount: parseFloat(a.toFixed(2))
    });
  }

  //计算商品总数量
  countItem = () => {
    let amount = 0
    const count = () => {
      this.state.storeList.forEach(itemStore => {
        itemStore.proList.forEach(itemPro => {
          amount = amount + itemPro.amount_amount;
        })
      })
    };
    count()
    this.setState({
      itemAmount: amount
    })
  }

  //跳转添加收货地址
  gotoEditAddress = () => {
    Taro.navigateTo({
      url: '../editaddress/editaddress'
    })
  }

  //跳转修改地址
  gotoChangeAddress = () => {
    window.sessionStorage.setItem('pageChangeAddressData', JSON.stringify({
      addressList: this.state.addressList,
      currentAddressID: this.state.receiveInfo.addressId
    }))
    Taro.navigateTo({
      url: `../changeaddress/changeaddress`
    })
  }

  //提交订单事件
  handleSubmit = () => {
    if (!(this.state.goodsFrom === 'drp')) {  //跳转自购物车时
      let shoppingDetailIds = []
      this.state.storeList.forEach(itemStore => {
        itemStore.proList.forEach(itemPro => {
          shoppingDetailIds.push(itemPro.id)
        })
      })
      const postData = {
        "shoppingDetailIds": shoppingDetailIds,
        "source": 0,
        "addressId": this.state.receiveInfo.addressId
      }
      this.gotoPageOrderPay(postData, ServicePath.submitOrder)
    } else {  //跳转自营销商品详情时
      const postData = {
        recommend: this.state.recommend,
        source: 0,
        addressId: this.state.receiveInfo.addressId,
        detailReqList: this.state.detailReqList,
      }
      this.gotoPageOrderPay(postData, ServicePath.msSubmitOrder)
    }
  }

  //获取订单信息并跳转
  gotoPageOrderPay = (postData, url) => {
    CarryTokenRequest(url,postData)
      .then(res => {
        if (res.data.code === 0) {
          this.setState({
            "pageOrderPayInfo": res.data.data
          }, () => {
            // const state = JSON.stringify({
            //   "pageOrderPayInfo": this.state.pageOrderPayInfo
            // })
            // Taro.setStorage({
            //   key: 'pageOrderPayData',
            //   data: {
            //     state: {
            //       pageOrderPayInfo: this.state.pageOrderPayInfo
            //     }
            //   }
            // })
            window.sessionStorage.setItem('pageOrderPayData', JSON.stringify({
              state: {
                pageOrderPayInfo: this.state.pageOrderPayInfo
              }
            }))
            Taro.navigateTo({
              url: `../orderpay/orderpay`
            })
          })
        } else if (res.data.code === 250) {  //姓名未实名
          this.setState({
            visiMask: true,
            visiRealName: true
          })
        } else if (res.data.code === 50) { //帐户未实名
          this.setState({
            ifAccountUnreal: true,
            visiMask: true,
            visiRealName: true
          })
        } else if (res.data.msg === "请勿重复提交！") {
          Taro.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
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

  //------------------------------------实名认证相关

  //表单填写事件
  handleInputRealName = (e) => {
    console.log(e, 'class')
    // switch(e.target.)
  }

  //勾选帐户实名事件
  handleChangeIsAccountRealAuth = () => {
    this.setState({
      isAccountRealAuth: !this.state.isAccountRealAuth
    })
  }

  //取消认证事件
  handleRealNameCancel = () => {
    this.setState({
      visiRealName: false,
      visiMask: false
    })
  }

  //提交认证事件
  handleRealNameSubmit = (e) => {
    const value = e.detail.value
    /* 表单正则 */
    const isIdCard = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/ //有效身份证号

    if ( !(value && isIdCard.test(value.idCard)) ) {
      Taro.showToast({
        title: '请输入有效的身份证号',
        icon: 'none'
      })
    } else {
      const postData = {
        addresser: this.state.receiveInfo.name,
        idCard: value.idCard,
        addressId: this.state.receiveInfo.addressId,
        isAccountRealAuth: this.state.isAccountRealAuth ? 1 : 0
      }
      Taro.showLoading({
        title: '提交认证中...'
      })
      CarryTokenRequest(ServicePath.idCardCheck, postData)
        .then(res => {
          Taro.hideLoading()
          if (res.data.code === 0) {
            this.handleSubmit()
          } else {
            Taro.showToast({
              title: '异常 - msg1',
              // title: res.data.msg,
              icon: 'none'
            })
          }
        })
    }
  }


  //-----------------------------------------------

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '提交订单'
    })

  }

  componentDidShow() {
    this.getPageCart();
  }

  componentWillUnmount() {
    Taro.removeStorage({
      key: 'selectAddressID'
    });
  }

  render() {

    const {receiveInfo, visiRealName, visiMask, ifAccountUnreal} = this.state;

    return(
      <View className="orderSubmit">
        <View className="ct-orderSubmit">
          <form action="">
            <View className="receiveInfo item">
              <Button type="button"  className="add" onClick={this.gotoEditAddress}>
                <img src={require('../../static/common/location.png')} className="location" />
                添加收货地址 
                <img src={require('../../static/common/arrow-next.png')} className="arrow" />
              </Button>
              
              <Button type="button"  className="change" onClick={this.gotoChangeAddress}>
                <img src={require('../../static/common/location.png')} className="location" />
                选择其它地址 
                <img src={require('../../static/common/arrow-next.png')} className="arrow" />
              </Button>

              <View className="receiveInfo_show item">
                <View className="name"> 
                  <Text className="line_desc">收货人：</Text>
                  <Text className="value">{receiveInfo.name}</Text>
                </View>
                <View className="phone">
                  <Text className="line_desc">手机号码：</Text>
                  <Text className="value">{receiveInfo.phone}</Text>
                </View>
                <View className="area">
                  <Text className="line_desc">所在地区：</Text>
                  <Text className="value">{receiveInfo.area}</Text>
                </View>
                <View className="addDetail">
                  <Text className="line_desc">详细地址：</Text>
                  <Text className="value">{receiveInfo.addDetail}</Text>
                </View>
              </View>

            </View>
            <View className="storeList item"> 
            {
              this.state.storeList.map(itemStore => {
                return (
                  <table className="proList" key={itemStore.storeId}> 
                    <thead>
                      <tr>
                        <Text className="production">{itemStore.storeName}</Text>
                      </tr>
                    </thead>
                    <div>
                      {
                        itemStore.proList.map(itemPro => {
                          return (
                            <tr key={itemPro.id} className="itemPro">
                              <td className="production left">
                                <img src={itemPro.img} alt=""/>
                              </td>
                              <View className="right">
                                <Text className="proInfo">{itemPro.proInfo}</Text>
                                <View className="proStyle">
                                    <Text className="subType">{itemPro.subType}</Text>
                                    <Text className="type">{itemPro.type}</Text>
                                </View>
                                <td className="amount">
                                  <View className="amount-amount">数量：x {itemPro.amount_amount}</View>
                                </td>
                                <td className="subTotal">
                                  <Text className="unit">HK$</Text>
                                  <Text className="subTotal_amount">{itemPro.amount}</Text>
                                </td>
                              </View>
                            </tr>
                          )
                        })
                      }
                    </div>
                  </table>
                )
              })
            }
            </View>
            <View className="preferential item">
              <View className="info">
                <View className="line total">
                  <Text className="prop">商品金额：</Text>
                  <Text className="value">HK$ {this.state.totalAmount.toFixed(2)}</Text>
                </View>
                <View className="line freightCharges">
                  <Text className="prop">运费：</Text>
                  <Text className="value">{this.state.logisticsFee}</Text>
                </View>
                <View className="line taxFee">
                  <Text className="prop">税费：</Text>
                  <Text className="value">{this.state.taxFee}</Text>
                </View>
              </View>
            </View>
            <View className="action item">
              <View className="right">
                <View className="finalAmount">
                  <Text className="prop">总金额：</Text>
                  <Text className="value">HK$ {(this.state.totalAmount + this.state.logisticsFee + this.state.taxFee).toFixed(2)}</Text>
                </View>
                  <Button type="button" onClick={this.handleSubmit}>提交订单</Button>
              </View>
            </View>
          </form>
        </View>

        {/* 帐户未实名/地址姓名非帐户姓名 */}
        <View className="mask" style={{display: visiMask===true?'':'none'}}></View>
        <Form 
          className="realName"
          onSubmit={this.handleRealNameSubmit}
          style={{display: visiRealName===true?'':'none'}}
        >
          <Text className="title">实名认证</Text>
          <View className="content">
            <View className="desc">{'因您购买的跨境商品清关需要，请填写以下实名认证信息。\n认证成功后将自动提交订单。'}</View>
            <View className="itemList">
              <View className="item item_realName" >
                <Text className="item_desc">姓名：</Text>
                <Input 
                  className="value value_realName"
                  name="realName"
                  value={receiveInfo.name}
                  disabled
                />
              </View>
              <View className="item idCard" >
                <Text className="item_desc">身份证号：</Text>
                <Input 
                  placeholder="请输入身份证号" 
                  maxLength="18" 
                  className="value"
                  name="idCard"
                />
              </View>
              <View 
                className="item item_isAccountRealAuth" 
                style={{display: ifAccountUnreal===true?'':'none'}}
              >
                <Checkbox name="isAccountRealAuth" onClick={this.handleChangeIsAccountRealAuth}>设为本帐号的实名认证信息</Checkbox>
              </View>
            </View>
          </View>
          <View className="action">
            <Button type="button" className="cancel" onClick={this.handleRealNameCancel}>取消</Button>
            <Button formType="submit" className="complete">认证</Button>
          </View>
        </Form>

      </View>
    )
  }
}
