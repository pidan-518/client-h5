import Taro, { Component } from '@tarojs/taro';
import { View, Text, Checkbox, CheckboxGroup, Input, Button, Label } from '@tarojs/components'
import ServicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest, postRequest } from '../../common/util/request';
import "../../common/globalstyle.less";
import "./cart.less";
import Navigation from '../../components/Navigation/Navigation';
import TabBar from '../../components/TabBar/TabBar';
// import NavigatorTop from '../../components/NavigatorTop/NavigatorTop';

export default class Cart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEmpty: false,
      visibleOO: false,    //二次选择弹框
      checkAll: true,
      totalAmount: 0.00,
      addressId: 3,
      "pageSubmitInfo": {},     //传入“订单提交”页的信息
      "storeList": [],
      "checkedList": [],
      hasCheckAll: true,//是否存在全选按钮
    }
  }
  
  //定位商店、商品
  findTarget = (itemStore, itemPro) => {
    let targetStore = {};
    let targetPro = {};
    this.state.storeList.forEach(iStore => {
      if (iStore.storeID === itemStore.storeID) {
        targetStore = iStore;
        targetStore.proList.forEach(iPro => {
          if (iPro.id === itemPro.id) {
            targetPro = iPro;
          }
        })
      }
    });
    return {
      targetStore: targetStore,
      targetPro: targetPro
    }
  }

  //------------------------------------------勾选相关--------------------------------------//

  //勾选变动事件
  handleCheckChange = (e) => {
    console.log(222)
    const eva = e.detail.value;

    let resultAll = true;
    this.state.storeList.forEach(itemStore => {
      itemStore.proList.forEach(itemPro => {
        if (eva.includes(JSON.stringify(itemPro.id))) {
          itemPro.checked = true;
        } else {
          itemPro.checked = false;
          resultAll = false;
        }
      })
    })

    this.setState({
      hasCheckAll: false,
      checkAll: resultAll
    }, () => {
      this.setState({
        hasCheckAll: true
      })
    })

    this.totalAmount();
  }

  //全选切换
  checkAll = () => {
    if (this.state.checkAll === false) {
      this.setState({
        checkAll: true,
      })
      this.state.storeList.forEach(store => {
        // store.checked = true;
        store.proList.forEach(pro => {
          if (pro.isShelfUp&&(!pro.expired)) {
            pro.checked = true;
          }
        })
      });
    }else {
      this.setState({
        checkAll: false,
      })
      this.state.storeList.forEach(store => {
        // store.checked = false;
        store.proList.forEach(pro => {
          pro.checked = false;
        })
      });
    };
    this.setState({
      proList: this.state.proList
    });

    const list = this.state.storeList;
    this.setState({
      storeList: []
    }, () => {
      this.setState({
        storeList: list
      })
    })

    this.totalAmount();
  }


  //商店选中切换
  checkStore = (itemStore) => {
    itemStore.checked = !itemStore.checked;

    if (itemStore.checked === true) {
      itemStore.proList.forEach(pro => {
        pro.checked = true;
      })
    }else {
      itemStore.proList.forEach(pro => {
        pro.checked = false;
      })
    };

    let result = this.state.storeList.some(store => {         //全选勾选状态切换
      return !store.checked
    });
    this.setState({
      checkAll: !result
    });

    this.totalAmount();
  }

  // 商品选中切换
  checkItem = (itemPro, itemStore) => {
    itemPro.checked = !itemPro.checked;

    let result = itemStore.proList.some(p => {     //商店勾选状态切换
      return !p.checked;
    });
    itemStore.checked = !result;

    let resultAll = this.state.storeList.some(store => {     //全选勾选状态切换
      return !store.checked;
    });

    // this.setState({
    //   hasCheckAll: false,
    //   checkAll: resultAll
    // }, () => {
    //   this.setState({
    //     hasCheckAll: true
    //   })
    // })


    this.totalAmount();
  }

  //----------------------------------------------------------------------------------//

  //------------------------------------数量修改相关-----------------------------------//

  // 商品数量+1
  amountRaise = (itemStore, itemPro) => {
    let targetPro = this.findTarget(itemStore, itemPro).targetPro;

    targetPro.amount_amount++;

    if (targetPro.amount_amount > 99) {
      targetPro.amount_amount = 99;
    }else if (targetPro.amount_amount < 1) {
      targetPro.amount_amount = 1;
    }

    targetPro.amount = targetPro.singlePrice * targetPro.amount_amount;

    this.shoppingCartUpdate(itemPro, targetPro.amount_amount)
    this.totalAmount();

  }

  // 商品数量-1
  amountReduce = (itemStore, itemPro) => {
    let targetPro = this.findTarget(itemStore, itemPro).targetPro;

    targetPro.amount_amount--;
    if (targetPro.amount_amount > 99) {
      targetPro.amount_amount = 99;
    }else if (targetPro.amount_amount < 1) {
      targetPro.amount_amount = 1;
    }

    targetPro.amount = targetPro.singlePrice * targetPro.amount_amount;

    this.shoppingCartUpdate(itemPro, targetPro.amount_amount)
    this.totalAmount();
  }

  //手动输入商品数量
  inputNumber = (e, itemStore, itemPro) => {
    let targetPro = this.findTarget(itemStore, itemPro).targetPro;

    targetPro.amount_amount = e.detail.value;
    // this.setState({}, () => {
      targetPro.amount_amount = (targetPro.amount_amount).replace(/\D/g,'');
      if (targetPro.amount_amount > 99) {
        targetPro.amount_amount = 99;
      }else if (targetPro.amount_amount < 1 && e.detail.value) {
        targetPro.amount_amount = 1;
      }

      targetPro.amount = targetPro.singlePrice * targetPro.amount_amount;

      this.shoppingCartUpdate(itemPro, targetPro.amount_amount)
      this.totalAmount();
    // })
  }

  //输入结束事件
  inputComplete = (e, itemStore, itemPro) => {
    let targetPro = this.findTarget(itemStore, itemPro).targetPro;

    targetPro.amount_amount = e.detail.value;
    this.setState({}, () => {
      targetPro.amount_amount = (targetPro.amount_amount).replace(/\D/g,'').replace(/^[0]+/,'');
      if (targetPro.amount_amount > 99) {
        targetPro.amount_amount = 99;
      }else if (targetPro.amount_amount < 1) {
        targetPro.amount_amount = 1;
      }

      targetPro.amount = targetPro.singlePrice * targetPro.amount_amount;

      this.shoppingCartUpdate(itemPro, targetPro.amount_amount)
      this.totalAmount();
    })
  }

  //后端数量同步
  shoppingCartUpdate = (itemPro, itemNum) => {
    const postData = {
      id: itemPro.id,
      itemId: itemPro.proID,
      itemNum: itemNum
    }
    CarryTokenRequest(ServicePath.shoppingCartUpdate, postData)
  }

  //----------------------------------------------------------------------------------//


  //获取购物车信息
  getCart = () => {

    CarryTokenRequest(ServicePath.getCart, {
      "current": 1,
      "len": 10
    })
      .then(res => {
        if (res.data.data.length > 0) {
          this.setState({
            isEmpty: false,
            storeList: [...res.data.data.map(s => {
              return (
                {
                  "storeID": s.shopId,
                  "storeName": s.shopName,
                  checked: true,
                  "proList": s.detailVOList.map(p => {
                    return (
                      {
                        "proID": p.itemId,
                        "id": p.id,
                        "img": p.image,
                        "proInfo": p.itemName,
                        "amount_amount": p.itemNum,
                        "type": p.className,
                        "subType": p.specName,
                        "originPrice": p.originPrice.toFixed(2),
                        "singlePrice": p.price.toFixed(2),
                        "amount": p.itemNum * p.price,
                        "discount": 0.00,
                        "isFavourite": p.isFavourite,
                        "isShelfUp": p.isShelfUp,
                        "expired": p.expired,
                        checked: p.isShelfUp&&(!p.expired)?true:false
                      }
                    )
                  })
                }
              )
            })]
          }, () => {
            console.log(this.state.storeList, 'storeList')
            this.totalAmount();
          })
        } else {
          this.setState({
            storeList: [],
            isEmpty: true
          }, () => {
            this.totalAmount();
          })
        }
      })
  }

  //计算总价
  totalAmount = () => {
    let a = 0;
    this.state.storeList.forEach(s => {
      s.proList.forEach(p => {
        if (p.checked)
        a += p.amount - p.discount;
      })
    })


    this.setState({
      totalAmount: parseFloat(a.toFixed(2))
    })
  }

  //计算所选商品涉及商店数
  countStore = () => {
    let result = 0;
    const sl =  this.state.storeList;

    for (let indexStore = 0; indexStore < sl.length; indexStore++) {      //计算涉及商店数
      const itemStore = sl[indexStore];
      for (let indexPro = 0; indexPro < itemStore.proList.length; indexPro++) {
        const itemPro = itemStore.proList[indexPro];
        itemStore.includeChecked = false;
        if (itemPro.checked === true) {
          itemStore.includeChecked = true;
          break;
        };
      }
      if (itemStore.includeChecked === true) {
        result++;
      }
    }

    return result;
  }


  //-----------------------------------------删除相关------------------------------------------

  //-----------------------------------------单个删除：确认+删除
  deleteSingleConfirm = (itemStore, itemPro) => {
    const id = [itemPro.id];

    const deleteSingleLocal = () => {    //本地删除
      let i = 0;
      let targeStore = {};
      this.state.storeList.forEach(iStore => {
        if (iStore.storeID === itemStore.storeID) {
          targeStore = iStore;
          targeStore.proList.forEach(iPro => {
            if (iPro.id === itemPro.id) {
              i = targeStore.proList.indexOf(iPro)
            }
          })
        }
      });
      targeStore.proList.splice(i, 1);
      if (targeStore.proList.length === 0) {       //商店内商品全删时连同商品一起删除
        let indexStore = this.state.storeList.indexOf(targeStore);
        this.state.storeList.splice(indexStore,1);
      }
      if (this.state.storeList.length === 0) {    //商品全被删除后切换至空购物车状态
        this.setState({
          isEmpty: true
        })
      }
      this.totalAmount();
    }
    const deleteSingleRequest = (id) => {

      CarryTokenRequest(ServicePath.deleteProduction, id)      //发起删除
        .then(res => {
          if (res.data.code === 0) {
            Taro.showToast({
              title: "删除成功",
              icon: "success",
              duration: 2000
            });
            deleteSingleLocal();
          }
        })
        .catch(err => {
          console.log("接口异常 - 删除商品：", err);
        })
    }

    Taro.showModal({
      title: "删除商品",
      content: "是否删除该商品？",
      success: res => {
        if (res.confirm) {
          deleteSingleRequest(id);
        }
      }
    })
  }

  //---------------------------------------------------------------------------------------//

  //收藏事件
  handleConcern = (itemStore, itemPro) => {
    const postData = {
      "itemId": itemPro.proID
    }

    CarryTokenRequest(ServicePath.userAtItemAdd, postData)
      .then(res => {
        if (res.data.code === 0) {
          Taro.showToast({
            title: '收藏成功',
            icon: 'success',
            duration: 2000
          });
          // const targetPro = this.findTarget(itemStore, itemPro).targetPro
          // targetPro.isFavourite = true;
          this.state.storeList.forEach(iStore => {
            if (iStore.storeID === itemStore.storeID) {
              iStore.proList.forEach(iPro => {
                if (iPro.proID === itemPro.proID) {
                  iPro.isFavourite = true;
                }
              })
            }
          })
          this.setState({})
        }
      })
  }

  //取消收藏事件
  handleCancelConcern = (itemStore, itemPro) => {
    const postData = {
      itemIdList: [itemPro.proID]
    }
    CarryTokenRequest(ServicePath.userAtItemRemoveByIds, postData)
      .then(res => {
        if (res.data.code === 0) {
          Taro.showToast({
            title: '取消收藏成功'
          });
          // const targetPro = this.findTarget(itemStore, itemPro).targetPro;
          // targetPro.isFavourite = false;
          this.state.storeList.forEach(iStore => {
            if (iStore.storeID === itemStore.storeID) {
              iStore.proList.forEach(iPro => {
                if (iPro.proID === itemPro.proID) {
                  iPro.isFavourite = false;
                }
              })
            }
          })
          this.setState({})
        } else {
          Taro.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: false
          })
        }
      })
  }

  //结算事件
  handleComplete = () => {
    let countStoreResult = this.countStore();     //获取涉及商店数

    if (countStoreResult === 0) {         //未勾选时弹框
      // DialogCreate.open({
      //   title: "未选择商品",
      //   para: "请至少勾选一件商品，再进行结算",
      //   hasCancel: false,
      // });
    } else {
      this.complete()
    }
  }

  //正式结算
  complete = () => {
    let shoppingDetailList = []; //已选商品列表
    this.state.storeList.forEach(itemStore => {
      itemStore.proList.forEach(itemPro => {
        if (itemPro.checked === true) {
          const checkedPro = {
            "number": itemPro.amount_amount,
            "shoppingDetailId": itemPro.id
          }
          shoppingDetailList.push(checkedPro);
        }
      })
    })

    let postData =  {
      "shoppingDetailList": shoppingDetailList
    }
    this.gotoPageOrderSubmit(postData);
  }

  //获取结算页信息并跳转
  gotoPageOrderSubmit = (postData) => {

    CarryTokenRequest(ServicePath.gotoSettlement, postData)
    .then(res => {
      if (res.data.code === 0) {
        this.setState({
          "pageSubmitInfo": res.data.data
        }, () => {
          window.sessionStorage.setItem('pageSubmitData', JSON.stringify({
            pageSubmitInfo: this.state.pageSubmitInfo,
            shoppingDetailList: postData.shoppingDetailList
          }))
          Taro.navigateTo({
            url: `../ordersubmit/ordersubmit`,
          })
        })
      } else {
        Taro.showToast({
          title: res.data.msg,
          duration: 4000,
          icon: 'none'
        })
      }
    })
  }


  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: "购物车"
    })
  }

  componentDidShow() {
    this.getCart();

    // Taro.request({
    //   url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxc7c0d84ef9e7dbe5&secret=051f99bde086af3372b8bacc947abaca',
    //   method: 'GET'
    // })
  }

  componentDidHide() {
    this.setState({
      storeList: []
    })
  }


  render() {

    return(
      <View className="cart">
        <View className="ct-Cart">
          <form action="">
            <CheckboxGroup onChange={this.handleCheckChange}>
              <View className="table">
                <Label className="checkAll_wrap">
                  {this.state.hasCheckAll===true?
                    <Checkbox className="checkbox checkAll" onClick={this.checkAll} checked={this.state.checkAll}>
                      <Text className="text">全选</Text>
                    </Checkbox>
                    :null
                  }
                </Label>
                {
                    this.state.storeList.map(itemStore => {
                      return(
                        /* 店铺项 */
                        <tbody className="tbody" key={itemStore.storeID}  /* style={{display: this.state.isEmpty === true?"":"none"}} */>
                          <tr className="tr storeName">
                            <td className="td" colSpan="2">
                              {/* <Checkbox className="checkbox" name="" id="" checked={itemStore.checked} onChange={this.checkStore.bind(this, itemStore)} /> */}
                              <Text className="text">{itemStore.storeName}</Text>
                            </td>
                          </tr>
                          {
                            itemStore.proList.map(itemPro => {
                              return (
                                /* 商品项 */
                                <tr className="tr production" key={itemPro.id}>
                                  <td className="td picture">
                                    <Checkbox 
                                      className="checkbox" 
                                      name="" 
                                      id="" 
                                      checked={itemPro.isShelfUp&&(!itemPro.expired)?itemPro.checked:false} 
                                      onClick={this.checkItem.bind(this, itemPro, itemStore)} 
                                      value={itemPro.id} 
                                      disabled={(!itemPro.isShelfUp)||itemPro.expired?"disabled":""}
                                    />
                                      <Navigation url={`/pages/goodsdetails/goodsdetails?itemId=${itemPro.proID}`} >
                                        <img className="img" src={itemPro.img} alt=""/>
                                      </Navigation>
                                  </td>
                                  <View className="production_right">
                                    <td className="td proInfo">
                                      <Navigation url={`/pages/goodsdetails/goodsdetails?itemId=${itemPro.proID}`} >
                                        {itemPro.proInfo}
                                        <Text
                                          className="isShelfUp"
                                          style={{display: itemPro.isShelfUp!==true?"":"none"}}
                                        >
                                        （已下架）
                                        </Text>
                                        <Text
                                          className="expired"
                                          style={{display: itemPro.expired?"":"none"}}
                                        >
                                        （已过期）
                                        </Text>
                                      </Navigation>

                                    </td>
                                    <td className="td proStyle">
                                      <Text className="subType">{itemPro.subType}</Text>
                                      <Text className="type">{itemPro.type}</Text>
                                      <td className="td singlePrice">
                                        <Text className="priceOrigin currency" style={{display: itemPro.originPrice!==itemPro.singlePrice?'':'none'}}>{itemPro.originPrice}</Text>
                                        <Text className="priceCurrent currency">{itemPro.singlePrice}</Text>
                                      </td>
                                      <View className="amount">
                                        <Button className="reduce" type="Button" onClick={this.amountReduce.bind(this, itemStore, itemPro)}><Text className="line"></Text></Button>
                                        <Input
                                          type="number"
                                          className="amount_amount"
                                          value={itemPro.amount_amount}
                                          maxLength='2'
                                          min="1"
                                          onBlur={e => {
                                            this.inputComplete(e, itemStore, itemPro)
                                          }}
                                        />
                                        <Button className="raise" type="Button" onClick={this.amountRaise.bind(this, itemStore, itemPro)}>
                                          <Text className="line"></Text>
                                          <Text className="line trans"></Text>
                                        </Button>
                                      </View>
                                    </td>
                                    <td className="td action">
                                      <Button className="delete" type="Button" onClick={this.deleteSingleConfirm.bind(this, itemStore, itemPro)}>删除</Button>
                                      <Button className="concern" type="Button" onClick={this.handleConcern.bind(this, itemStore, itemPro)} style={{display: itemPro.isFavourite===false?"":"none"}}>添加收藏</Button>
                                      <Button
                                        className="isFavourite"
                                        style={{display: itemPro.isFavourite===true?"":"none"}}
                                        onClick={this.handleCancelConcern.bind(this, itemStore, itemPro)}
                                      >
                                        取消收藏
                                      </Button>
                                    </td>
                                  </View>
                                </tr>
                              )
                            })
                          }
                        </tbody>
                      )
                    })
                  } 
              </View> 

              <View className="empty" style={{display: this.state.isEmpty === true?"block":"none"}}>
                空空如也~~快去选购您喜爱的商品吧
              </View>

              <View className="action_bottom">
                <View className="left">
                </View>
                <View className="right">
                  <View className="totalAmount">
                  <Text className="description">（不含运费）</Text>
                  <Text className="title" decode="{{true}}">总价:&ensp;&ensp;</Text>
                  <Text className="currency">{this.state.totalAmount.toFixed(2)}</Text>
                  </View>
                  <Button className="complete" onClick={this.handleComplete} type="Button">去结算</Button>
                </View>
              </View>
            </CheckboxGroup>
          </form>
        </View>
        <TabBar />
      </View>
    )
  }
}
