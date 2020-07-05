import React from "react"
import PropTypes from "prop-types"

import Image from './Image'
import * as S from "./styled"

const PortfolioItem = ({
  title,
  year,
  description,
  image,
  imageAlt,
  right,
  left,
}) => {
  return (
    <S.PortfolioItemWrapper>
      <Image
        right={right}
        left={left}
        side="left"
        alt={imageAlt}
        filename={image}
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
      <Image
        right={right}
        left={left}
        side="right"
        alt={imageAlt}
        filename={image}
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