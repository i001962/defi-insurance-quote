import React, { useEffect, useRef, useState } from 'react';
import { HotChart } from '../components/hotChart';
import Layout from '../components/layout'
import Seo from '../components/seo'

const IndexPage = () => (
  <Layout>
    <Seo title="DeFi Insurance Quote" />
     <HotChart var={[.05,.95]} />
  </Layout>
)
export default IndexPage



//export default AreaGraph;