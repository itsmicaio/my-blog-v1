import React from "react"
import PropTypes from "prop-types"

import getThemeColor from '../../utils/getThemeColor'
import * as S from "./styled"

const PortfolioItem = ({
  title,
  year,
  description,
}) => (
  <S.PostItemLink 
    cover
    direction="right"
    bg={getThemeColor()}
    duration={0.6}
  >
    <S.PostItemWrapper>
      <S.PostItemTag>{title}</S.PostItemTag>
      <S.PostItemInfo>
        <S.PostItemDate>
          {year}
        </S.PostItemDate>
        <S.PostItemTitle>{title}</S.PostItemTitle>
        <S.PostItemDescription>{description}</S.PostItemDescription>
      </S.PostItemInfo>
    </S.PostItemWrapper>
  </S.PostItemLink>
)

PortfolioItem.propTypes = {
  title: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
}

export default PortfolioItem