import { ChainConfig } from "..";
import { NATIVE_ADDRESS } from "../../constants";
import maticIcon from "../../../assets/images/tokens/matic-icon.svg"

export const POLYGON: ChainConfig = {
  name: "Polygon",
  image: maticIcon,
  subText: "Polygon Mainnet",
  chainId: 137,
  chainColor: "#8247E51A",
  rpcUrl: "https://polygon-rpc.com/",
  currency: "MATIC",
  nativeToken: NATIVE_ADDRESS,
  nativeDecimal: 18,
  nativeFaucetURL: "",
  biconomy: {
    enable: true,
    apiKey: "jYEsJEDel.8bc71a9b-4097-4f77-98dc-3a713e3988b9",
  },
  assetSentTopicId:
    "0xfa67019f292323b49b589fc709d66c232c7b0ce022f3f32a39af2f91028bbf2c",
  networkAgnosticTransfer: true,
  graphURL: "https://api.thegraph.com/subgraphs/name/divyan73/hyphenpolygonv2",
  explorerUrl: "https://polygonscan.com",
};
