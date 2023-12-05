import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Input, Flex, Button, Card, Typography, Form, message} from 'antd'
import {HomeFilled, FileTextOutlined} from '@ant-design/icons'

import Markdown from '@components/Markdown'
import {useWeb3} from '@hooks/useWeb3'
import {useGlobalLoader} from '@hooks/useGlobalLoader'
import {Rule} from 'antd/es/form'

import './style.css'

const floatRegex = /^([0-9]+[.])?[0-9]+$/

export const CreateArticlePage = () => {
  const [text, setText] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [title, setTitle] = useState('')

  const {setGlobalLoading} = useGlobalLoader()
  const navigate = useNavigate()
  const {web3, createArticle} = useWeb3()

  const [messageApi, contextHolder] = message.useMessage()
  const notificationKey = 'creationStatus'

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTitle(e.target.value)
  }

  const onClickHome = () => {
    const shouldReturn = window.confirm('Are you sure to leave? Changes will not be saved')
    if (shouldReturn) {
      navigate('/')
    }
  }

  const onSubmit = async (values: any) => {
    messageApi.open({
      key: notificationKey,
      type: 'loading',
      content: 'Creating article...',
    })

    setGlobalLoading(true)
    try {
      await createArticle(title, text, values.tokenPrice, values.tokenAddress, values.etherPrice)
      await messageApi.open({
        key: notificationKey,
        type: 'success',
        content: 'Creating article...',
        duration: 2,
      })
      navigate('/')
    } catch (error) {
      const message = (error as any).message

      await messageApi.open({
        key: notificationKey,
        type: 'error',
        content: message,
        duration: 5,
      })
    } finally {
      setGlobalLoading(false)
    }
  }

  const priceValidationRule: Rule = {
    validator(_, value) {
      const isValid = floatRegex.test(value)
      return isValid ? Promise.resolve() : Promise.reject('Expected non-negative float')
    },
  }

  const tokenAddressValidationRule: Rule = {
    validator(_, value) {
      const isAddress = web3.utils.isAddress(value)
      return isAddress ? Promise.resolve() : Promise.reject('Invalid ethereum address')
    },
  }

  const renderCard = () => {
    if (showPreview) {
      return (
        <Card
          className='card'
          title={
            <Typography.Title level={3} className='zero-margin wrap-string preview-title'>
              {title}
            </Typography.Title>
          }
        >
          <Markdown className='preview-text'>{text}</Markdown>
        </Card>
      )
    }

    return (
      <Card
        className='card'
        title={
          <div className='edit-title'>
            <Input.TextArea
              autoSize
              size='large'
              className='title-textarea'
              placeholder='Your title here...'
              value={title}
              onChange={onChangeTitle}
            />
          </div>
        }
      >
        <Input.TextArea
          autoSize
          size='middle'
          className='edit-text'
          placeholder='Your text here...'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </Card>
    )
  }

  const submitDisabled = title.length === 0 || text.length === 0

  return (
    <div className='create-article-container'>
      {contextHolder}
      {renderCard()}
      <div className='side-buttons-block'>
        <Flex vertical justify='space-between' align='start' gap={8}>
          <Button icon={<HomeFilled />} onClick={onClickHome}>
            Go Home
          </Button>
          <Button icon={<FileTextOutlined />} onClick={() => setShowPreview((prev) => !prev)}>
            Show preview
          </Button>
          <Form layout='vertical' onFinish={onSubmit} initialValues={{tokenPrice: '0', etherPrice: '0'}}>
            <Form.Item
              label='Token address'
              name='tokenAddress'
              rules={[{required: true, message: 'Can not be empty'}, tokenAddressValidationRule]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='Price in token'
              name='tokenPrice'
              rules={[{required: true, message: 'Can not be empty'}, priceValidationRule]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label='Price in Ether'
              name='etherPrice'
              rules={[{required: true, message: 'Can not be empty'}, priceValidationRule]}
            >
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type='primary' htmlType='submit' disabled={submitDisabled}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Flex>
      </div>
    </div>
  )
}
