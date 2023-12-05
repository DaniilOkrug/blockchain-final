import React, {useEffect, useState} from 'react'
import {useLoaderData, useNavigate} from 'react-router-dom'
import {Alert, Button, Card, Typography} from 'antd'
import {useWeb3} from '@hooks/useWeb3'
import {ArrowLeftOutlined} from '@ant-design/icons'
import {Article} from '@src/hooks/useWeb3'
import {Loader} from '@src/components/Loader'
import Markdown from '@src/components/Markdown'

import './styles.css'

export const ArticlePage = () => {
  const [articleData, setArticleData] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const articleId = useLoaderData() as number
  const {readArticle} = useWeb3()
  const navigate = useNavigate()

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const data = await readArticle(articleId)
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
          <Markdown className='article-text'>{articleData.content}</Markdown>
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
