import React from "react"
import PropTypes from "prop-types"
import {useStaticQuery, graphql} from 'gatsby'

import * as S from "./styled"

const PortfolioItem = ({
  title,
  year,
  description,
  image,
  right,
  left,
}) => {
  const {portfolioImage} = useStaticQuery(
    graphql`
      query {
        portfolioImage: file(relativePath: { eq: "icon.png" }){
          childImageSharp {
            fluid(maxWidth: 512){
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
  `)
  return (
    <S.PortfolioItemWrapper>
      <S.PortfolioItemImage 
        right={right}
        left={left}
        side="left"
        fluid={portfolioImage.childImageSharp.fluid}
      />
      <S.PortfolioItemInfo
        right={right}
        left={left}
      >
        <S.PortfolioItemTitle>{title}</S.PortfolioItemTitle>
        <S.PortfolioItemDate>
          {year}
        </S.PortfolioItemDate>
        <S.PortfolioItemDescription>{description}</S.PortfolioItemDescription>
      </S.PortfolioItemInfo>
      <S.PortfolioItemImage 
        right={right}
        left={left}
        side="right"
        fluid={portfolioImage.childImageSharp.fluid}
      />
    </S.PortfolioItemWrapper>
)}

PortfolioItem.propTypes = {
  title: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imagee: PropTypes.string.isRequired,
}

export default PortfolioItem