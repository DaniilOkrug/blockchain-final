import {Spin} from 'antd'
import React, {PropsWithChildren, createContext, useState} from 'react'

type GlobalLoaderContext = {
  setGlobalLoading: (value: boolean) => void
  isGlobalLoading: boolean
}

export const GlobalLoaderCtx = createContext<GlobalLoaderContext>({
  isGlobalLoading: false,
  setGlobalLoading: () => {
    throw new Error('global loader is not defined')
  },
})

export const GlobalLoader: React.FC<PropsWithChildren> = ({children}) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <GlobalLoaderCtx.Provider value={{isGlobalLoading: isLoading, setGlobalLoading: setIsLoading}}>
      <Spin spinning={isLoading} delay={100} rootClassName='spinner-container'>
        {children}
      </Spin>
    </GlobalLoaderCtx.Provider>
  )
}
