import {PropsWithChildren, createContext, useEffect, useState} from 'react'
import Web3 from 'web3'

import {abiItems, ethAddress} from '../web3'
import {Contract} from 'web3-eth-contract'
import {Alert, Button} from 'antd'

export type Web3ContextType = {
  web3: Web3 | null
  contract: Contract | null
}

export const Web3Context = createContext<Web3ContextType>({
  web3: null,
  contract: null,
})

export const Web3Provider = ({children}: PropsWithChildren) => {
  const [web3, setWeb3] = useState<Web3 | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)

  useEffect(() => {
    if (window.ethereum) {
      const w3 = new Web3(window.ethereum)
      setWeb3(w3)

      const contract = new w3.eth.Contract(abiItems, ethAddress)
      setContract(contract)
    }
  }, [])

  if (!window.ethereum) {
    return (
      <Alert
        type='error'
        message='Metamask extension is not detected'
        description='Please install Metamask and reload page'
        className='no-metamask-alert'
        action={
          <Button type='default' danger onClick={() => window.location.reload()}>
            Reload page
          </Button>
        }
      />
    )
  }

  if (!web3 || !contract) return <div>Loading web3</div>

  return <Web3Context.Provider value={{web3, contract}}>{children}</Web3Context.Provider>
}
