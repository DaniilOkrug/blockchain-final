import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Markdown from 'react-markdown'
import {Input, Flex, Button, Card, Typography, Form, message} from 'antd'
import {HomeFilled, FileTextOutlined} from '@ant-design/icons'
import remarkGfm from 'remark-gfm'
import remarkCodeTitle from 'remark-code-title'
import {useWeb3} from '@hooks/useWeb3'
import {useGlobalLoader} from '@hooks/useGlobalLoader'
import {Rule} from 'antd/es/form'

import './style.css'

const floatRegex = /^([0-9]+[.])?[0-9]+$/

export const CreateArticlePage = () => {
  const [text, setText] = useState(loremIpsumText)
  const [showPreview, setShowPreview] = useState(false)
  const [title, setTitle] = useState('Ego, Fear and Money: How the A.I. Fuse Was Lit'.repeat(2))

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
    console.log('submit values:', values)
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
      console.error(error)
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
          <Markdown className='preview-text' remarkPlugins={[remarkGfm, remarkCodeTitle]}>
            {text}
          </Markdown>
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

const loremIpsumText =
  `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ullamcorper eget orci non congue. Donec tempus aliquam vehicula. Duis nec metus at odio venenatis feugiat. Sed ultricies varius dolor condimentum eleifend. Nulla faucibus ligula id urna aliquam pharetra. Donec at sem ac eros vestibulum ornare condimentum in felis. Sed id nisl sit amet eros dignissim dignissim in at neque. Donec sed massa at massa molestie luctus non ac lacus. Pellentesque metus erat, congue et enim a, auctor faucibus turpis.

Curabitur in tempus nibh, eu maximus tortor. Aliquam arcu augue, posuere a volutpat at, mattis sollicitudin purus. Nullam sem ex, lacinia at mi sit amet, luctus mattis tortor. Fusce vitae sem ipsum. Maecenas molestie metus et finibus tempus. Nunc in orci nibh. Nulla urna nisi, blandit in porta sed, convallis a enim. Suspendisse scelerisque turpis ut velit condimentum, ac aliquam mi malesuada. Nunc in eros mi.

Maecenas interdum, leo in ornare congue, sem metus sodales nunc, at vestibulum eros tortor nec odio. Maecenas nec venenatis lacus. Vivamus et risus ac felis rutrum accumsan. Duis ultricies dictum turpis non dapibus. Donec efficitur suscipit turpis ac luctus. Aliquam accumsan nisi quis accumsan mattis. Vestibulum et nisi luctus, euismod enim non, blandit augue. Phasellus efficitur est ante, in blandit ante dignissim ut. In ac finibus risus. Ut ac purus facilisis nisl lacinia maximus sit amet et nisi.

Suspendisse eleifend felis at velit vehicula egestas. Morbi condimentum malesuada magna id ultricies. Nulla facilisi. Nunc sollicitudin et turpis quis pellentesque. Curabitur fermentum nisl ipsum, id ultrices dui consectetur nec. Suspendisse efficitur scelerisque dolor, non lacinia quam ullamcorper convallis. Nunc orci diam, gravida at massa vulputate, sollicitudin consectetur purus. Sed eget efficitur sem. Nunc sit amet ex nec tellus elementum scelerisque quis ut quam. Vestibulum orci sem, suscipit et nibh in, finibus faucibus justo.

Ut tristique bibendum ligula, sit amet interdum augue cursus at. Donec scelerisque volutpat elementum. Sed commodo ipsum consectetur porta luctus. Ut rutrum ut lacus a cursus. Sed placerat lacinia aliquam. Mauris id purus vitae elit tempus accumsan. Sed id malesuada sem. Duis placerat sit amet nunc non dignissim`.repeat(
    2
  )
