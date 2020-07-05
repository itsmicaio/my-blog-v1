import React from 'react'
import { StaticQuery, graphql } from 'gatsby'

import * as S from './styled'

const Image = ({filename, ...props}) => (
  <StaticQuery
    query={graphql`
      query {
        images: allFile(
          filter: { absolutePath: { regex: "/static/assets/img/portfolio/" } }
        ) {
          edges {
            node {
              relativePath
              name
              childImageSharp {
                sizes(maxWidth: 240) {
                  ...GatsbyImageSharpSizes
                }
              }
            }
          }
        }
      }
    `}
    render={data => {
      const image = data.images.edges.find(n => {
        return n.node.relativePath.includes(filename)
      })
      if (!image) {
        return null
      }
      console.log('oi')
      const imageSizes = image.node.childImageSharp.sizes
      console.log(imageSizes)
      return <S.PortfolioItemImage sizes={imageSizes} {...props} />
    }}
  />
)

export default Image