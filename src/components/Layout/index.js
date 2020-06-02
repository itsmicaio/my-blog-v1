import React, { useState } from "react"
import { useStaticQuery, graphql} from 'gatsby'
import PropTypes from "prop-types"
import { TransitionPortal } from 'gatsby-plugin-transition-link'

import Profile from '../Profile'
import Sidebar from '../Sidebar'
import MenuBar from '../MenuBar'

import GlobalStyles from '../../styles/global'
import * as S from './styled'


const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const {site: 
    {siteMetadata}
  } = useStaticQuery(graphql`
    query GetSiteMetadata {
      site {
        siteMetadata {
          title
          position
          description
        }
      }
    }
  `)

  return (
    <S.LayoutWrapper>
      <GlobalStyles />
      <TransitionPortal level="top">
        <Profile
          title={siteMetadata.title}
          position={siteMetadata.position}
          description={siteMetadata.description}
          isMobileHeader={true}
        />
        <Sidebar 
          site={siteMetadata}
          setIsMenuOpen={setIsMenuOpen}
          isMenuOpen={isMenuOpen}
        />
      </TransitionPortal>
      <S.LayoutMain>{children}</S.LayoutMain>
      <TransitionPortal level="top">
        <MenuBar 
          setIsMenuOpen={setIsMenuOpen}
          isMenuOpen={isMenuOpen}
        />
      </TransitionPortal>
    </S.LayoutWrapper>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
