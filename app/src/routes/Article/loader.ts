import {LoaderFunctionArgs, redirect} from 'react-router-dom'

export const articleLoader = async (arg: LoaderFunctionArgs) => {
  const {params} = arg
  if (!params.articleId) {
    throw redirect('/')
  }
  const articleId = parseInt(params.articleId)
  if (typeof articleId !== 'number' || Number.isNaN(articleId)) {
    throw redirect('/')
  }
  return articleId
}
