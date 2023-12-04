import React, {useEffect, useState} from 'react'
import {useLoaderData, useNavigate} from 'react-router-dom'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {Alert, Button, Card, Typography} from 'antd'
import {useWeb3} from '@hooks/useWeb3'
import './styles.css'
import {ArrowLeftOutlined} from '@ant-design/icons'
import {Article} from '@src/hooks/useWeb3'
import {Loader} from '@src/components/Loader'

const str = `A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |
`.repeat(4)

const title =
  'This is going to be a very long story, and I will tell you about the best day in my life. The day when I met your mom'

export const ArticlePage = () => {
  const [markdown, setMarkdown] = useState<string>(str)
  const [articleData, setArticleData] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const articleId = useLoaderData() as number
  const {web3, contract, readArticle} = useWeb3()
  const navigate = useNavigate()

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const data = await readArticle(articleId)
        console.log('data fetched', data)
        setArticleData(data)
      } catch (error) {
        const message = (error as any).message
        const err = message ?? 'Failed to load article'
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadArticle()
  }, [])

  const goBack = () => {
    navigate('/')
  }

  const renderContent = () => {
    if (isLoading) {
      return <Loader />
    }

    if (error || !articleData) {
      return <Alert type='error' message={error} showIcon />
    }

    return (
      <div className='article-wrapper'>
        <Card title={<Typography.Text className='article-title wrap-string'>{articleData.title}</Typography.Text>}>
          <Markdown remarkPlugins={[remarkGfm]}>{articleData.content}</Markdown>
        </Card>
      </div>
    )
  }

  return (
    <div className='article-page-container'>
      {renderContent()}
      <Button type='primary' icon={<ArrowLeftOutlined />} onClick={goBack} className='back-button'>
        Go back
      </Button>
    </div>
  )
}
