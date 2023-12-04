import React from 'react'
import {createBrowserRouter, redirect, RouterProvider} from 'react-router-dom'
import ReactDOM from 'react-dom/client'

import {RootPage} from './routes/Root'
import {CreateArticlePage} from './routes/CreateArticle'
import {ArticlePage} from './routes/Article'
import {articleLoader} from './routes/Article/loader'

import {Web3Provider} from './context'
import App from './App'

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootPage />,
  },
  {
    path: '/create',
    element: <CreateArticlePage />,
  },
  {
    path: '/article/:articleId',
    element: <ArticlePage />,
    loader: articleLoader,
  },
  {
    path: '*',
    loader: () => redirect('/')
  }
])

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <App>
    <Web3Provider>
      <RouterProvider router={router} />
    </Web3Provider>
  </App>
)
