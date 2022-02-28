import ProgressBar from 'components/ProgressBar';
import { HiAdjustments, HiArrowSmLeft } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';
import AssetOverview from '../AssetOverview';
import StepSlider from '../StepSlider';
import collectFeesIcon from '../../../../assets/images/collect-fees-icon.svg';
import LiquidityInfo from '../LiquidityInfo';
import { BigNumber } from 'ethers';
import { useQuery } from 'react-query';
import useLPTokenContract from 'hooks/useLPToken';
import useLiquidityProviders from 'hooks/useLiquidityProviders';
import { useEffect, useMemo, useState } from 'react';
import tokens from 'config/tokens';
import useWhitelistPeriodManager from 'hooks/useWhitelistPeriodManager';
import { makeNumberCompact } from 'utils/makeNumberCompact';
import getTokenBalance from 'utils/getTokenBalance';
import { useWalletProvider } from 'context/WalletProvider';
import { chains } from 'config/chains';

function ManagePosition() {
  const navigate = useNavigate();
  const { accounts } = useWalletProvider()!;
  const { chainId, positionId } = useParams();
  const { getPositionMetadata } = useLPTokenContract();
  const { getTotalLiquidity } = useLiquidityProviders();
  const { getTokenTotalCap } = useWhitelistPeriodManager();
  const [walletBalance, setWalletBalance] = useState<string | undefined>();
  const [liquidityAmount, setLiquidityAmount] = useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(0);

  const { isLoading: isPositionMetadataLoading, data: positionMetadata } =
    useQuery(
      ['positionMetadata', positionId],
      () => getPositionMetadata(BigNumber.from(positionId)),
      {
        enabled: !!positionId,
      },
    );

  const {
    shares,
    suppliedLiquidity,
    token: tokenAddress,
  } = positionMetadata || {};

  const chain = chainId
    ? chains.find(chainObj => {
        return chainObj.chainId === Number.parseInt(chainId);
      })
    : null;

  const token =
    chainId && tokenAddress
      ? tokens.find(tokenObj => {
          return (
            tokenObj[Number.parseInt(chainId)].address.toLowerCase() ===
            tokenAddress.toLowerCase()
          );
        })
      : null;

  const tokenDecimals =
    chainId && token ? token[Number.parseInt(chainId)].decimal : null;

  const { data: totalLiquidity } = useQuery(
    ['totalLiquidity', tokenAddress],
    () => getTotalLiquidity(tokenAddress),
    {
      // Execute only when metadata is available.
      enabled: !!positionMetadata,
    },
  );

  const formattedTotalLiquidity =
    tokenDecimals && totalLiquidity
      ? totalLiquidity / 10 ** tokenDecimals
      : totalLiquidity;

  const { data: tokenTotalCap } = useQuery(
    ['tokenTotalCap', tokenAddress],
    () => getTokenTotalCap(tokenAddress),
    {
      // Execute only when accounts are available.
      enabled: !!tokenAddress,
    },
  );

  const formattedTokenTotalCap =
    tokenDecimals && tokenTotalCap
      ? tokenTotalCap / 10 ** tokenDecimals
      : tokenTotalCap;

  useEffect(() => {
    async function getWalletBalance() {
      if (!accounts || !chain || !token) {
        return null;
      }

      const { displayBalance } = await getTokenBalance(
        accounts[0],
        chain,
        token,
      );
      setWalletBalance(displayBalance);
    }

    getWalletBalance();
  }, [accounts, chain, token]);

  function handleIncreaseLiquidity() {
    navigate('../increase-liquidity');
  }

  async function handleLiquidityAmountChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const regExp = /^((\d+)?(\.\d{0,3})?)$/;
    const newLiquidityAmount = e.target.value;
    const isInputValid = regExp.test(newLiquidityAmount);

    if (isInputValid) {
      setLiquidityAmount(newLiquidityAmount);
    }
  }

  function handleSliderChange(value: number) {
    setSliderValue(value);

    if (value === 0) {
      setLiquidityAmount('');
    } else if (walletBalance && parseFloat(walletBalance) > 0) {
      const newLiquidityAmount = (
        Math.trunc(parseFloat(walletBalance) * (value / 100) * 1000) / 1000
      ).toString();
      setLiquidityAmount(newLiquidityAmount);
    }
  }

  function handleMaxButtonClick() {
    if (walletBalance && parseFloat(walletBalance) > 0) {
      setSliderValue(100);
      setLiquidityAmount(
        (Math.trunc(parseFloat(walletBalance) * 1000) / 1000).toString(),
      );
    }
  }

  if (isPositionMetadataLoading) return null;

  return (
    <article className="my-24 rounded-10 bg-white p-12.5 pt-2.5">
      <header className="relative mt-6 mb-12 flex items-center justify-center border-b px-10 pb-6">
        <div className="absolute left-0">
          <button
            className="flex items-center rounded text-hyphen-gray-400"
            onClick={() => navigate(-1)}
          >
            <HiArrowSmLeft className="h-5 w-auto" />
          </button>
        </div>

        <h2 className="text-xl text-hyphen-purple">Manage Position</h2>

        <div className="absolute right-0 flex">
          <button className="mr-4 text-xs text-hyphen-purple">Clear All</button>
        </div>
      </header>

      <AssetOverview positionId={BigNumber.from(positionId)} />

      <section className="mt-8 grid grid-cols-2">
        <div className="max-h-100 h-100 border-r pr-12.5 pt-9">
          <div className="mb-8">
            <ProgressBar
              currentProgress={formattedTotalLiquidity}
              totalProgress={formattedTokenTotalCap}
            />
            <div className="mt-1 flex justify-between text-xxs font-bold uppercase text-hyphen-gray-300">
              <span>Pool cap</span>
              <span>
                {makeNumberCompact(formattedTotalLiquidity) || '...'}{' '}
                {token?.symbol} /{' '}
                {makeNumberCompact(formattedTokenTotalCap) || '...'}{' '}
                {token?.symbol}
              </span>
            </div>
          </div>

          <label
            htmlFor="liquidityAmount"
            className="flex justify-between px-5 text-xxs font-bold uppercase"
          >
            <span className="text-hyphen-gray-400">Input</span>
            <span className="flex items-center text-hyphen-gray-300">
              Balance: {walletBalance}
              <button
                className="ml-2 flex h-4 items-center rounded-full bg-hyphen-purple px-1.5 text-xxs text-white"
                onClick={handleMaxButtonClick}
              >
                MAX
              </button>
            </span>
          </label>
          <input
            id="liquidityAmount"
            placeholder="0.000"
            type="number"
            inputMode="decimal"
            className="mt-2 mb-6 h-15 w-full rounded-2.5 border bg-white px-4 py-2 font-mono text-2xl text-hyphen-gray-400 focus:outline-none"
            value={liquidityAmount}
            onChange={handleLiquidityAmountChange}
          />

          <StepSlider
            dots
            onChange={handleSliderChange}
            step={25}
            value={sliderValue}
          />

          <button className="mt-9 mb-2.5 h-15 w-full rounded-2.5 bg-hyphen-purple font-semibold text-white">
            Confirm Removal
          </button>
          <button
            className="h-15 w-full rounded-2.5 border-2 border-hyphen-purple font-semibold text-hyphen-purple"
            onClick={handleIncreaseLiquidity}
          >
            + Increase Liquidity
          </button>
        </div>
        <div className="max-h-100 h-100 pl-12.5 pt-1">
          <label
            htmlFor="unclaimedFees"
            className="pl-5 text-xxs font-bold uppercase text-hyphen-gray-400"
          >
            Unclaimed Fees
          </label>
          <input
            id="unclaimedFees"
            placeholder="0.000"
            type="text"
            className="mt-2 mb-10 h-15 w-full rounded-2.5 border bg-white px-4 py-2 font-mono text-2xl text-hyphen-gray-400 focus:outline-none"
          />

          <button className="mb-11 flex h-15 w-full items-center justify-center rounded-2.5 bg-hyphen-purple font-semibold text-white">
            <img src={collectFeesIcon} alt="Collect fees" className="mr-1" />
            Collect Fees
          </button>

          <LiquidityInfo />
        </div>
      </section>
    </article>
  );
}

export default ManagePosition;
