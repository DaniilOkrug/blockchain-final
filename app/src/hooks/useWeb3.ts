import {useContext} from 'react'
import {Web3Context, Web3ContextType} from '@context/Web3Provider'
import {ERC20ABI, ethAddress} from '@src/web3'
import {message} from 'antd'

type NonNull<T extends {}> = {
  [key in keyof T]: Exclude<T[key], null>
}

export type ArticleItem = {
  title: string
  hasAccess: boolean
  price: string
  ethPrice: string
  tokenAddress: string
  author: string
  id: string
}

export type Article = {
  title: string
  content: string
  createdAt: string
}

type CheckForAccess = (id: number) => Promise<boolean>
type BuyAccess = (id: number, price: string, tokenAddress?: string) => Promise<void>
type FetchArticle = (id: number) => Promise<ArticleItem>
type ReadArticle = (id: number) => Promise<Article>
type CreateArticle = (
  title: string,
  content: string,
  price: string,
  tokenAddress: string,
  etherPrice: string
) => Promise<void>

type UseWeb3Data = NonNull<Web3ContextType> & {
  checkForAccess: CheckForAccess
  buyAccess: BuyAccess
  fetchArticle: FetchArticle
  readArticle: ReadArticle
  createArticle: CreateArticle
}

export const useWeb3 = (): UseWeb3Data => {
  const {web3, contract} = useContext(Web3Context)
const [messageApi] = message.useMessage()
  const key = 'web3Status'

  if (web3 == null) {
    throw new Error('web3 is null')
  }

  if (contract == null) {
    throw new Error('contract is null')
  }

  const fetchAccount = async (): Promise<string | undefined> => {
    if (!window.ethereum) {
      messageApi.open({
        key,
        type: 'error',
        content: 'MetaMask extension is not found',
        duration: 2,
      })
      return
    }

    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
    const account = accounts[0]

    if (!account) {
      message.open({
        key,
        type: 'error',
        content: 'MetaMask account is not found',
        duration: 2,
      })
      return
    }

    return account
  }

  const checkForAccess: CheckForAccess = async (id) => {
    const account = await fetchAccount()
    if (!account) {
      return
    }

    return contract.methods.accessGranted(account, id).call()
  }

  const buyAccess: BuyAccess = async (id, price, tokenAddress) => {
    const account = await fetchAccount()
    if (!account) {
      return
    }

    if (tokenAddress) {
      const tokenContract = new web3!.eth.Contract(ERC20ABI, tokenAddress)
      await tokenContract.methods.approve(ethAddress, price).send({
        from: account,
      })

      await contract.methods.buyAccessWithToken(id).send({
        from: account,
      })
    } else {
      await contract.methods.buyAccess(id).send({
        from: account,
        value: price
      })
    }
  }

  const fetchArticle: FetchArticle = async (id) => {
    const account = await fetchAccount()
    if (!account) {
      return
    }

    return contract.methods.getArticle(id).call({from: account})
  }

  const readArticle: ReadArticle = async (id) => {
    const account = await fetchAccount()
    if (!account) {
      return
    }

    return contract.methods.readArticle(id).call({from: account})
  }

  const createArticle: CreateArticle = async (...args) => {
    const account = await fetchAccount()
    if (!account) {
      return
    }

    const ether = args.pop() as string
    args.push(web3.utils.toWei(ether, 'ether'))
    return contract.methods.createArticle(...args).send({from: account})
  }

  return {web3, contract, checkForAccess, buyAccess, fetchArticle, readArticle, createArticle}
}
