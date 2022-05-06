import { Provider, createClient } from 'wagmi'
import Profile from '../components/profile'
import Layout from '../components/layout'
import Seo from '../components/seo'
import React from 'react'

const client = createClient()

const IndexPage = () => (
    <Layout>
      <Seo title="DeFi Insurance Quote" />
      <Provider client={client}>
      <Profile />
    </Provider>
    </Layout>
  )
  
  export default IndexPage