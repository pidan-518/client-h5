import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button, Form, Picker, Textarea } from '@tarojs/components'
import ServicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request';
import "../../common/globalstyle.less";
import "./returnapply.less";
import OrderInfo from "../../components/OrderInfo/OrderInfo"

export default class ReturnApply extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "orderDetail": {
        "imgUrl": require("../../static/common/production.png"),
        "proName": "xxxxxxx剃须刀",
        "sellerName": "盛世回首",
        "phone": 18712341234,
        "orderID": 3215461548848,
        "type": "黑色 XXL",
        "amount": 2,
        "price": 135, 
      },
      reasonList: [   //原因列表
        '个人原因',
        '商品损坏',
        '卖家发货太慢',
        '卖家原因',
        '已与卖家沟通完毕',
      ],
      previewVisible: false,
      previewImage: '',
      selectedReason: '个人原因',  //换货原因
      selectedReasonId: 0,  //换货原因编号
      description: '',  //原因描述
      fileList: [], //图片列表
      images: '', //图片相对路径列表
    }
  }


  //------------------------------------上传图片相关----------------------------------------//

  //添加图片事件
  handleAddImg = () => {
    Taro.chooseImage({
      // count: 1,
      // sizeType: ['compressed'],
      success: res => {
        const tempFilePaths = res.tempFilePaths
        Taro.uploadFile({
          url: ServicePath.afterSaleUploadImage,
          filePath: tempFilePaths[0],
          name: 'imgList',
          formData: {
            "orderDetailId": this.state.orderDetail.orderDetailId
          },
          header: {
            'JWT-Token': Taro.getStorageSync("JWT-Token")
          },
          success: res => {
            const path = JSON.parse(res.data).data[0].path
            this.setState({
              images: this.state.images?`${this.state.images},${path}`:`${path}`
            }, () => {
            })
          }
        })
        this.setState({
          fileList: [...this.state.fileList, ...res.tempFilePaths]
        })
      }
    })
  }

  //删除图片事件
  handleDeleteImg = (itemFile) => {
    const index = this.state.fileList.indexOf(itemFile)
    this.state.fileList.splice(index, 1)
    this.state.images.split(index, 1)
    this.setState({})
  }


  //---------------------------------------------------------------------------------------//

  //接收我的订单页信息
  getPageProReturn = () => {
    const itemPro = JSON.parse(window.sessionStorage.getItem('pageReturnApplyData')).state
    this.setState({
      "orderDetail": {
        "imgUrl": itemPro.item.image,
        "proName": itemPro.itemName, 
        "sellerName": itemPro.sellerName,
        "phone": null,
        "orderID": itemPro.orderNo,
        "type": `${itemPro.itemSpecClassRel.specName}`,
        "className": `${itemPro.itemSpecClassRel.className}`,
        "amount": itemPro.itemNum, 
        "price": itemPro.price, 
        "proID": itemPro.itemId,
        "orderDetailId": itemPro.orderDetailId
      }
    }, () => {
      this.getAfterSaleDetail();
    })
  }

  //获取售后申请详情
  getAfterSaleDetail = () => {
    const postData = {
      "orderDetailId": this.state.orderDetail.orderDetailId
    };
    CarryTokenRequest(ServicePath.afterSaleDetail, postData)
      .then(res => {
        if (res.data.code === 0) {
          const rdd = res.data.data;
          const orderDetail = this.state.orderDetail;
          orderDetail.phone = rdd.businessUser.mobile;
          orderDetail.sellerName = rdd.businessUser.owner;
          this.setState({});
        }
      })
      .catch(err => {
        console.log("接口异常 - 查看售后申请详情：", err);
      })
  }

  //原因说明修改事件
  handleChangeDescription = (e) => {
    this.setState({
      description: e.detail.value
    })
  }

  //提交事件
  handleSubmit = () => {
    const sto = this.state.orderDetail;
    const postData = {
      "orderNo": sto.orderID,
      "itemId": sto.proID,
      "orderDetailId": sto.orderDetailId,
      "type": 1,
      "cause": this.state.selectedReasonId,
      "remarks": this.state.description,
      "images":this.state.images,
    }
    this.gotoPageReturnProcessing(postData);
  }

  //获取提交结果并跳转
  gotoPageReturnProcessing = (postData) => {
    CarryTokenRequest(ServicePath.afterSaleApply, postData)
      .then(res => {
        if (res.data.code === 0) {
          const lst = {};
          const orderDetail = JSON.stringify(this.state.orderDetail)
          window.sessionStorage.setItem('pageReturnProcessingData', JSON.stringify({
            orderDetail: this.state.orderDetail
          }))
          Taro.navigateTo({
            url: `../returnprocessing/returnprocessing`
          })
        } else {
          Taro.showToast({
            title: res.data.message,
            icon: 'none'
          });
        }
      })
  }

  //订单详情事件：跳转订单详情
  handleSeeOrder = () => {
    this.props.history.push({
      pathname: "/orderdetails",
      state: {
        "orderNo": this.state.orderDetail.orderID
      }
    })
  }

  //原因说明 - 高度自适应
  autoLine = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight + 2}px`;
    console.log(e.target.scrollHeight)
  }


  //选择原因事件
  handleChangeReason = (e) => {
    this.setState({
      selectedReason: this.state.reasonList[e.detail.value],
      selectedReasonId: JSON.parse(e.detail.value) + 1
    })
  }


  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '申请退货'
    });
  }

  componentDidShow() {
    this.getAfterSaleDetail();
    this.getPageProReturn();
  }


  render() {

    const { selectedReason, reasonList, fileList } = this.state;

    return(
      <View className="returnApply">

        <View className="ct-wrap">
          <View className="ct-returnApply">
            <View className="applyWrap">
              
              <View className="top">
                <View className="left" >
                  <Text>申请退货</Text>
                </View>
                <img src={require('../../static/orderpart/truck.png')} className="right" />
              </View>
              <Form className="form" onSubmit={() => {}}>
                <View className="formItem serviceType">
                  <Text className="title">服务类型</Text>
                  <Text className="right">退货</Text>
                </View>
                <View className="formItem reason">
                  <Text className="title">退货原因</Text>
                  <Picker 
                    className="right"
                    mode='selector'
                    range={reasonList}
                    onChange={this.handleChangeReason}
                  >
                    <Text className="selected_reason" decode="true">{selectedReason}</Text>
                    <img src={require('../../static/common/arrow-next.png')} className="arrow" />
                  </Picker>
                </View>
                <View className="formItem description">
                  <Text className="title">原因说明</Text>
                  <Textarea 
                    className="right"
                    placeholder='请输入原因说明'
                    onInput={this.handleChangeDescription}
                    autoHeight
                    >
                  </Textarea>
                </View>
                <View className="formItem image">
                  <Text className="title">相关图片</Text>
                  <View className="imgList">
                    {
                      fileList.map(itemFile => {
                        return (
                          <View className="item_wrap">
                            <img src={itemFile} className="itemFile"/>
                            <Button className="delete" onClick={this.handleDeleteImg.bind(this, itemFile)}>删除</Button>
                          </View>
                        )
                      })
                    }
                  </View>
                  <View className="addImg_wrap" style={{display: fileList.length<3?'':'none'}}>
                    <Button onClick={this.handleAddImg} className="addImg">
                      添加图片
                    </Button>
                    <Text className="upload_desc">(最多可上传3张)</Text>
                  </View>
                </View>
                <Button className="complete" onClick={this.handleSubmit}>提交申请</Button>
              </Form>

              <OrderInfo orderDetail={this.state.orderDetail} />

              <View className="remind">
                <Text className="title">提示：</Text>
                <Text className="item">1.商品图片及信息仅供参考，不属质量问题，因拍摄灯光及不同显示器色差等问题可能造成商品图片与实物有色差，一切以实物为准。</Text>
                <Text className="item">2.为了不影响您商品的退货服务，请妥善保管商品的附件、赠品、包装至少15天。</Text>
                <Text className="item">3.商品送货时您需与送货人员开箱验机（外观），开箱后如产品有外观缺陷附件问题的，可直接拒收，签收后发生的外观损坏缺件等问题不予退换货。</Text>
              </View>
            </View>
          </View>
        </View>
        <View className="guessLikeWrap">

        </View>
      </View>
    )
  }
}