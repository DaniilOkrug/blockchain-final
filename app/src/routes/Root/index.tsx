import React, {useEffect, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {Card, Button, Alert, Flex, Typography, Pagination} from 'antd'
import useMessage from 'antd/es/message/useMessage'

import {ArticleItem, useWeb3} from '@hooks/useWeb3'
import {useGlobalLoader} from '@hooks/useGlobalLoader'
import {Loader} from '@components/Loader'
import {useMountedRef} from '@hooks/useMounted'

import './style.css'

const pageSize = 4

export const RootPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {setGlobalLoading} = useGlobalLoader()
  const isMounted = useMountedRef()
  const [messageApi, contextHolder] = useMessage()

  const navigate = useNavigate()
  const {web3, contract, checkForAccess, buyAccess, fetchArticle} = useWeb3()

  useEffect(() => {
    const loadStartData = async () => {
      try {
        const length = parseInt(await contract.methods.getArticlesLength().call())
        if (typeof length != 'number') {
          throw new Error('expected getArticlesLength() to return number')
        }
        setTotalItems(length)
        if (length === 0) {
          setCurrentPage(0)
        }

        const from = Math.max(length - pageSize, 0)
        const to = Math.min(from + pageSize, length)
        await fetchArticles(from, to)
      } catch (error) {
        const message = (error as any).message ?? 'Failed to load articles'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    const interval = setInterval(async () => {
      try {
        const length = await parseInt(await contract.methods.getArticlesLength().call())
        setTotalItems(length)
      } catch (error) {
        const message = (error as any).message
        setError(message)
      }
    }, 5000)

    loadStartData()

    return () => {
      clearInterval(interval)
    }
  }, [])

  const fetchArticles = async (from: number, to: number) => {
    console.log(`fetch ${from} - ${to}`)
    try {
      const indexes: number[] = []
      for (let i = from; i < to; i++) {
        indexes.push(i)
      }

      const promises = indexes.map(fetchArticle)
      const articles = await Promise.all(promises)

      console.log('articles', articles)
      setArticles(articles)
    } catch (error) {
      const message = (error as any).message ?? 'Failed to load articles'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const onReadClick = async (idx: number) => {
    try {
      const hasAccess = checkForAccess(idx)
      if (!hasAccess) {
        window.alert("You don't have access to this article")
        return
      }

      navigate(`/article/${idx}`)
    } catch (error) {
      window.alert(error)
    }
  }

  const onBuyClick = async (id: number, price: string, tokenAddress?: string) => {
    try {
      setGlobalLoading(true)
      await buyAccess(id, price, tokenAddress)
      if (!isMounted()) {
        return
      }
    } catch (error) {
      messageApi.open({
        type: 'error',
        duration: 5,
        content: (error as any).message ?? 'Transaction failed',
      })
    } finally {
      setGlobalLoading(false)
    }
  }

  const onChangePage = (page: number) => {
    setCurrentPage(page)
    const from = Math.max(totalItems - page * pageSize, 0)
    const to = Math.min(from + pageSize, totalItems)
    fetchArticles(from, to)
  }

  const renderArticle = (
    id: string,
    title: string,
    hasAccess: boolean,
    price: string,
    ethPrice: string,
    tokenAddress: string,
    author: string
  ) => {
    const convertedEtherPrice = web3.utils.fromWei(ethPrice, 'ether')

    const titleBlock = (
      <Flex vertical gap={5}>
        <Typography.Title level={3} className='zero-margin wrap-string'>
          {title}
        </Typography.Title>
        <Typography.Text type='secondary' className='title-meta'>
          Author's wallet: {author}
        </Typography.Text>
        <Typography.Text type='secondary' className='title-meta'>
          Ether price: {convertedEtherPrice}
        </Typography.Text>
        <Typography.Text type='secondary' className='title-meta'>
          Token price: {price}
        </Typography.Text>
      </Flex>
    )

    const articleId = parseInt(id)

    const button = hasAccess ? (
      <Button onClick={() => onReadClick(articleId)}>Read</Button>
    ) : (
      <>
        <Button type='primary' onClick={() => onBuyClick(articleId, ethPrice)}>
          Buy Access for Ether
        </Button>
        <Button type='primary' onClick={() => onBuyClick(articleId, price, tokenAddress)}>
          Buy Access for Token
        </Button>
      </>
    )

    return (
      <Card className='article-block' key={articleId} title={titleBlock}>
        <Flex justify='center' align='center' gap={15}>
          {button}
        </Flex>
      </Card>
    )
  }

  const renderContent = () => {
    if (isLoading) {
      return <Loader />
    }

    if (error) {
      return (
        <Alert
          type='error'
          message={error}
          showIcon
          action={
            <Button type='default' danger onClick={() => window.location.reload()}>
              Reload page
            </Button>
          }
        />
      )
    }

    if (totalItems === 0) {
      return <Alert type='info' message='No articles found' showIcon />
    }

    return (
      <div className='articles-list'>
        {articles.map(({title, hasAccess, price, tokenAddress, ethPrice, id, author}) =>
          renderArticle(id, title, hasAccess, price, ethPrice, tokenAddress, author)
        )}
      </div>
    )
  }

  return (
    <div className='root-container'>
      {contextHolder}
      {renderContent()}
      {!error && (
        <div className='side-buttons-block'>
          <Pagination simple total={totalItems} current={currentPage} onChange={onChangePage} pageSize={pageSize} />
          <Link className='create-article-btn' to='/create'>
            <Button type='primary'>Create article</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
