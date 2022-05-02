import { useQuery } from 'react-query';
import { ENV } from 'types/environment';
import useNetworks from './useNetworks';

export type Token = {
  symbol: string;
  image: string;
  coinGeckoId: string;
  [chainId: number]: {
    address: string;
    transferOverhead: number;
    decimal: number;
    symbol: string;
    chainColor: string;
    isSupported?: boolean;
    metaTransactionData: {
      supportsEip2612: boolean;
      eip2612Data: {
        name: string;
        version: number;
        chainId: number;
      };
    };
  };
};

const tokensEndpoint =
  process.env.REACT_APP_ENV === ENV.production
    ? 'https://hyphen-v2-api.biconomy.io/api/v1/configuration/tokens'
    : 'https://hyphen-v2-staging-api.biconomy.io/api/v1/configuration/tokens';

function fetchTokens(): Promise<Token[]> {
  return fetch(tokensEndpoint)
    .then(res => res.json())
    .then(data =>
      data.message.reduce((acc: any, token: Token) => {
        const { symbol } = token;
        return {
          ...acc,
          [symbol]: token,
        };
      }, {}),
    );
}

function useTokens() {
  const { data: networks } = useNetworks();

  return useQuery<Token[], Error>('tokens', fetchTokens, {
    enabled: !!networks,
  });
}

export default useTokens;
