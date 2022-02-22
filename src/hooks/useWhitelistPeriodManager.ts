import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import whitelistPeriodManagerABI from 'contracts/WhitelistPeriodManager.abi.json';

function useWhitelistPeriodManager() {
  const whitelistPeriodManagerContract = useMemo(() => {
    return new ethers.Contract(
      '0xE6A9E731Bf796a9368a61d125092D3E8871ebace',
      whitelistPeriodManagerABI,
      new ethers.providers.Web3Provider(window.ethereum),
    );
  }, []);

  const getTokenWalletCap = useCallback(
    (tokenAddress: string | undefined) => {
      return whitelistPeriodManagerContract.perTokenWalletCap(tokenAddress);
    },
    [whitelistPeriodManagerContract],
  );

  const getTotalLiquidityByLP = useCallback(
    (tokenAddress: string | undefined) => {
      return whitelistPeriodManagerContract.totalLiquidityByLp(tokenAddress);
    },
    [whitelistPeriodManagerContract],
  );

  return {
    whitelistPeriodManagerContract,
    getTokenWalletCap,
    getTotalLiquidityByLP,
  };
}

export default useWhitelistPeriodManager;
