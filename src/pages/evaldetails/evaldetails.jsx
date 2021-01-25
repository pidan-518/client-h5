import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Textarea } from '@tarojs/components'
import "taro-ui/dist/style/components/image-picker.scss";
import "taro-ui/dist/style/components/icon.scss";
import '../../common/globalstyle.less'
import './evaldetails.less';
import servicePath from '../../common/util/api/apiUrl';
import { CarryTokenRequest } from '../../common/util/request';

// 编辑地址
class EvalDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [], // 评论上传图片
      evalState: '', // 好评中评差评状态
      commentState: '', // 评论状态 已评论或未评论
      commentVal: '', // 评价详情的值
      shopName: '', // 店铺名
      goodsNum: '', // 商品数量
      specName: '', // 商品规格名
      className: '', // 商品类名
      goodsName: '', // 商品名
      goodsPrice: '', // 商品价格
      goodsImage: '' // 商品图片
    }
  }

  // 好评中评差评点击事件
  handleEvalState = (state) => {
    this.setState({
      evalState: state
    })
  }

  // 详情信息输入框事件
  handleCommentVal = (e) => {
    this.setState({
      commentVal: e.detail.value
    })
  }

  // 删除图片点击事件
  handleCommentImgDelete = (index) => {
    let files = this.state.files;
    files.splice(index, 1);
    this.setState({ files });
  }

  // 图片上传
  handleEvalImageUpload = () => {
    Taro.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      success: res => {
        let tempFilePaths = res.tempFilePaths;
        Taro.showLoading({ title: "上传中..." });
        for (let i in tempFilePaths) {
          Taro.uploadFile({
            url: servicePath.uploadPhoto,
            filePath: tempFilePaths[i],
            name: 'file',
            fileName: res.tempFiles[i].originalFileObj.name,
            header: {
              /* "Content-Type": "multipart/form-data;", */
              'JWT-Token': window.sessionStorage.getItem("JWT-Token")
            },
            success: response => {
              console.log(response);
              const data = JSON.parse(response.data);
              if (data.code === 0) {
                console.log("上传图片成功", data);
                let imgArr = [];
                imgArr.push(data.data);
                this.setState({
                  files: [...this.state.files, ...imgArr]
                }, () => {
                  Taro.hideLoading();
                })
              }
            },
            fail: err => {
              console.log(err);
            }
          })
        }
      }
    });
  }

  // 评论提交点击事件
  handleSubmit = () => {
    const { evalState, commentVal, files } = this.state;
    if (evalState === '') {
      Taro.showToast({ title: '请选择评论状态', icon: 'none', duration: 1000 });
    } else if (commentVal === '') {
      Taro.showToast({ title: '请输入评论内容', icon: 'none', duration: 1000 });
    } else {
      CarryTokenRequest(servicePath.orderEvaluateInsert, {
        remarks: `${commentVal}`,
        imageList: files,
        state: evalState,
        orderDetailId: this.$router.params.orderDetailId,
      })
        .then((res) => {
          console.log("保存评论信息成功", res.data);
          if (res.data.code === 0) {
            Taro.showToast({
              title: '评论成功',
              icon: 'none',
              duration: 1500,
              success: res => {
                setTimeout(() => {
                  Taro.navigateBack({
                    delta: 1
                  })
                }, 1500);
              }
            })
          } else {
            Taro.showToast({
              title: '评论失败，请稍后重试',
              icon: 'none',
              duration: 1500,
            })
          }
        })
        .catch((err) => {
          console.log("保存评论信息失败", err);
          this.setState({
            isLoading: false,
          });
        });
    }
  }

  // 获取评论详情信息
  selectOrderEvaluate() {
    CarryTokenRequest(servicePath.selectOrderEvaluate, {
      orderDetailId: this.$router.params.orderDetailId,
      itemId: this.$router.params.itemId
    })
      .then(res => {
        console.log("获取评论详情信息成功", res.data);
        if (res.data.code === 0) {
          let defaultImg = res.data.data.images ? res.data.data.images.split(",") : [];
          this.setState({
            files: defaultImg,
            commentVal: res.data.data.remarks,
            evalState: res.data.data.state,
            goodsImage: res.data.data.image
          })
        }
        
      })
      .catch(err => {
        console.log("获取评论详情信息成功", err);
      })
  }

  componentWillMount () {  
    let params = this.$router.params
    if (Number(params.evaluateState) !== 80) {
      this.selectOrderEvaluate();
      this.setState({
        commentState: Number(params.evaluateState),
        shopName: decodeURI(params.shopName),
        goodsNum: params.itemNum,
        className: decodeURI(params.className),
        specName: decodeURI(params.specName),
        goodsName: decodeURI(params.goodsName),
        goodsPrice: params.goodsPrice,
      })
    } else {
      this.setState({
        commentState: Number(params.evaluateState),
        shopName: decodeURI(params.shopName),
        goodsNum: params.itemNum,
        className: decodeURI(params.className),
        specName: decodeURI(params.specName),
        goodsName: decodeURI(params.goodsName),
        goodsPrice: params.goodsPrice,
        goodsImage: params.goodsImage,
      })
    }
  }

  componentDidMount () { 
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  config = {
    navigationBarTitleText: '评价晒单',
    usingComponents: {}
  }

  render () {

    // 好评中评差评图标
    const evalStatus = [
      {
        txt: "好评",
        icon: require("../../static/personcenter/praise.png"),
        iconAc: require("../../static/personcenter/praise-ac.png"),
        state: 0,
      },
      {
        txt: "中评",
        icon: require("../../static/personcenter/chicom.png"),
        iconAc: require("../../static/personcenter/chicom-ac.png"),
        state: 10,
      },
      {
        txt: "差评",
        icon: require("../../static/personcenter/necom.png"),
        iconAc: require("../../static/personcenter/necom-ac.png"),
        state: 20,
      },
    ]

    const { 
      files, 
      evalState, 
      commentState,
      goodsName,
      goodsNum,
      specName,
      className,
      goodsPrice,
      shopName,
      goodsImage,
      commentVal
    } = this.state

    return (
      <View>
        <View id='evaldetails'>
          <View className="good-item">
            <View className="item-head">
              <View className="shop-name">
                <Text>{shopName}</Text>
                <img src={require("../../static/goodsdetails/right.png")} />
              </View>
            </View>
            <View className="item-content">
              <img src={goodsImage} />
              <View className="good-wrap">
                <View className="good-info">
                  <View>{goodsName}</View>
                  <Text className="good-spec">{className}/{specName}</Text>
                  <Text> × {goodsNum}</Text>
                </View>
                <View className="good-price">
                  <Text className="price-symbol">HK$ </Text>
                  <Text> {goodsPrice}</Text>
                </View>
              </View>
            </View>
          </View>
          <View className="eval-status">
            {
              evalStatus.map(item => 
                <View 
                  className={item.state === evalState ? 'eval-status-item-ac' : 'eval-status-item'}
                  style={{pointerEvents: commentState !== 80  ? 'none' : null}}
                  key={item.state} 
                  onClick={this.handleEvalState.bind(this, item.state)}
                >
                  <img src={item.state === evalState ? item.iconAc : item.icon} />
                  <Text className="eval-status-txt">{item.txt}</Text>
                </View>
              )
            }
          </View>
          <View className="eval-operation">
            <View className="eval-Textarea">
              <View className="">原因说明：</View>
              <Textarea 
                onInput={this.handleCommentVal} 
                disabled={commentState !== 80 ? true : false} 
                placeholder="请说明详细信息..." 
                value={commentVal}
              />
            </View>
          </View>
          <View className="eval-upload">
            <View 
              style={{display: commentState !== 80 ? 'none' : 'block'}}
              className="eval-upload-title"
            >
              最多上传3张
            </View>
            <View className="upload-img-list">
              {
                files.map((item, index) => 
                  <View className="upload-img-item" key={index}>
                    <View
                      style={{display: commentState !== 80 ? 'none' : 'block'}}
                      className="item-delete" 
                      onClick={this.handleCommentImgDelete.bind(this, index)}
                    >
                      <img src={require("../../static/img-delete-icon.png")} />
                    </View>
                    <img className="item-img" src={item} />
                  </View>
                )
              }
              {
                files.length >= 3 ? null : 
                  <View style={{display: commentState !== 80 ? 'none' : 'block'}} className="upload-img-item">
                    <img className="item-img" onClick={this.handleEvalImageUpload} src={require("../../static/common/buttonAdd.png")}  alt=""/>
                  </View>
              }
            </View>
          </View>
        </View>
        <View
          className="eval-btn"
          style={{display: commentState !== 80 ? 'none' : 'block'}}
        >
          <Button onClick={this.handleSubmit}>评价提交</Button>
        </View>
      </View>
    )
  }
}

export default EvalDetails;