import 'dotenv/config'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { openai } from './openai.js'

const question = process.argv[2] || 'hi'

export const createStore = (docs) =>
  MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings())

export const uberDocsPDF = () => {
  const loader = new PDFLoader('uber_2021.pdf')
  return loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: '. ',
      chunkSize: 7000,
      chunkOverlap: 200,
    })
  )
}

export const lyftDocsPDF = () => {
  const loader = new PDFLoader('lyft_2021.pdf')
  return loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: '. ',
      chunkSize: 7000,
      chunkOverlap: 200,
    })
  )
}

const loadStore = async () => {
  const lyftDocs = await lyftDocsPDF()
  const uberDocs = await uberDocsPDF()

  return createStore([...lyftDocs, ...uberDocs])
}

const query = async () => {
  const store = await loadStore()
  const results = await store.similaritySearch(question, 1)

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    messages: [
      {
        role: 'assistant',
        content:
          'You are a helpful AI assistant. Answser questions to your best ability.',
      },
      {
        role: 'user',
        content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context.
        Question: ${question}
  
        Context: ${results.map((r) => r.pageContent).join('\n')}`,
      },
    ],
  })
  console.log(
    `Answer: ${response.choices[0].message.content}\n\nSources: ${results
      .map((r) => r.metadata.source)
      .join(', ')}`
  )
}

query()

