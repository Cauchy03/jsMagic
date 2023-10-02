//@ts-ignore
import QRCode from 'qrcodejs2-fix'

const useQRCode = (el: any) => {
  let text = '自定义二维码内容';
  new QRCode(el, {
    text: text, // 二维码内容字符串
    width: 128,
    height: 128,
    colorDark: '#000000', // 二维码前景色
    colorLight: '#ffffff', // 二维码背景色
    correctLevel: QRCode.CorrectLevel.H, // 容错级别 低到高分别为L M Q H
  })
}


export default useQRCode