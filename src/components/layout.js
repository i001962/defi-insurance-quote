/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import * as React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"
import {Helmet} from "react-helmet";
import { Link } from "gatsby";
import Header from "./header"
import "./layout.css"

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <>
    <Helmet>
      {/* GA Snippet here if you are evil */}
    </Helmet>
      <Header siteTitle={data.site.siteMetadata?.title || `Title`} />
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: `0 1.0875rem 1.45rem`,
        }}
      >
           <p><Link to="/">Estimate Current Rate</Link>! | <Link to="/page2">Portfolio simulator</Link>! | <Link to="/page3">Policy details</Link>! | <Link to="/exposure">Stats On All Policies</Link>!</p>

        <main>{children}</main>
        <footer
          style={{
            marginTop: `2rem`,
          }}
        >        
     
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.npmjs.com/package/@solace-fi/sdk">Solace SDK</a>
        </footer>
      </div>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
