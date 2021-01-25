import Taro, { Component } from "@tarojs/taro";
import { View } from "@tarojs/components";
import "./landingpage.less";
import "../../common/globalstyle.less";
import { postRequest } from "../../common/util/request";
import servicePath from "../../common/util/api/apiUrl";

class LandingPage extends Component {
  state = {
    isWx: false,
    downloadUrl: "",
  };

  handleDownLoad = () => {
    const { downloadUrl } = this.state;
    let u = navigator.userAgent;
    let isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1; //g
    let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    if (isAndroid) {
      //安卓操作系统
      window.location.href = downloadUrl;
    }
    if (isIOS) {
      //ios操作系统
      window.location.href = downloadUrl;
    }
  };

  // 获取最新版本信息
  getLatestDownloadUrl(source) {
    postRequest(servicePath.getLatestDownloadUrl, {
      source: source,
    })
      .then((res) => {
        console.log("获取最新版本信息成功", res.data);
        if (res.data.code === 0) {
          this.setState({
            downloadUrl: res.data.data.downloadUrl,
          });
        }
      })
      .catch((err) => console.log("获取最新版本信息失败", err));
  }

  componentDidMount() {
    let u = navigator.userAgent;
    let isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1; //g
    let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    let isWx = window.navigator.userAgent.toLowerCase();
    let source = isAndroid ? 20 : isIOS ? 30 : "";
    if (isWx.match(/MicroMessenger/i) == "micromessenger") {
      this.setState({
        isWx: true,
      });
      return;
    }
    this.getLatestDownloadUrl(source);

    if (isAndroid) {
      window.location.href = 'h5://www.aigangmao:8888/from';
    }

    if (isIOS) {
      window.location.href = 'iconmall://homepage';
    }
  }

  config = {
    navigationBarTitleText: "",
  };

  render() {
    return (
      <View id="landing-page">
        <View
          className="down-box"
          style={{ display: !this.state.isWx ? "block" : "none" }}
        >
          <View className="link">
            <img
              className="download-img"
              onClick={this.handleDownLoad}
              src={require("../../static/landing-page/download.png")}
              alt=""
            />
          </View>
        </View>
        <View
          className="mask"
          style={{ display: this.state.isWx ? "block" : "none" }}
        ></View>
      </View>
    );
  }
}

export default LandingPage;
