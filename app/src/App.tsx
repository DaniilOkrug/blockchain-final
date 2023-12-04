import React, {PropsWithChildren} from 'react'
import {GlobalLoader} from '@context/GlobalLoader'

import './app-style.css'

const App: React.FC<PropsWithChildren> = ({children}) => {
  return (
    <div className='app'>
      <GlobalLoader>{children}</GlobalLoader>
    </div>
  )
}

export default App
