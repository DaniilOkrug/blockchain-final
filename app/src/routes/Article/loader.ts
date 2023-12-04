import {LoaderFunctionArgs, redirect} from 'react-router-dom'

export const articleLoader = async (arg: LoaderFunctionArgs) => {
  console.log('<Article Loader>', arg)
  const {params} = arg
  if (!params.articleId) {
    throw redirect('/')
  }
  const articleId = parseInt(params.articleId)
  console.log('parsed', {articleId})
  if (typeof articleId !== 'number' || Number.isNaN(articleId)) {
    throw redirect('/')
  }
  return articleId
}
