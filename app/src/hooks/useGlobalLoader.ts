import {GlobalLoaderCtx} from '@context/GlobalLoader'
import {useContext} from 'react'

export const useGlobalLoader = () => {
  return useContext(GlobalLoaderCtx)
}
