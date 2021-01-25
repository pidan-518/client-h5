import Taro, { Component, connectSocket } from '@tarojs/taro';
import { View, Text, Checkbox, CheckboxGroup, Form, Input, Textarea, Button } from '@tarojs/components'
import ServicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request';
import "../../common/globalstyle.less";
import "./returnprocessing.less";
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
      fileList: [],
    }
  }

  handleServiceType = () => {
    
  }

  //------------------------------------上传图片相关-------------------------------------------//

  //预览
  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    });
  };
  
  //关闭预览
  handleCancel = () => this.setState({ previewVisible: false });

  //删除
  handleChange = ({ fileList }) => {
    this.setState({
      fileList 
    }, () => {
      console.log(this.state.fileList)
    });
  }

  //------------------------------------------------------------------------------------------//

  //接收我的订单页信息
  getPageReturnApply = () => {
    const orderDetail = JSON.parse(window.sessionStorage.getItem('pageReturnProcessingData')).orderDetail
    console.log(orderDetail, 'orderDetail')
    this.setState({
      orderDetail: orderDetail
    }, () => {
      console.log(this.state.orderDetail.imgUrl)
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
  }


  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '申请退货'
    });
  }

  componentDidShow() {
    // this.getAfterSaleDetail();
    this.getPageReturnApply();
  }

  render() {

    // const reasonList = [ 
    //   '个人原因', 
    //   '商品损坏', 
    //   '卖家发货太慢', 
    //   '卖家原因', 
    //   '已与卖家沟通完毕', 
    // ]

    const selectedReason = this.state;

    return(
      <View className="returnProcessing">

        <View className="top">
          <View className="left" >
            <Text>申请退换中</Text>
          </View>
          <img src={require('../../static/orderpart/truck.png')} className="right" />
        </View>

        <Text className="status">您的申请已提交，请等待商家处理</Text>
        
        <OrderInfo orderDetail={this.state.orderDetail} />

        <View className="ct-wrap">
          <View className="ct-returnApply">
            <View className="applyWrap">
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