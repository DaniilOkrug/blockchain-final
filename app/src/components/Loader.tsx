import {LoadingOutlined} from '@ant-design/icons'
import {Flex, Spin} from 'antd'

export const Loader = () => {
  return (
    <Flex justify='center' align='center'>
      <Spin size='large' indicator={<LoadingOutlined style={{fontSize: 36}} spin />} />
    </Flex>
  )
}
