import styled from "styled-components"
import media from "styled-media-query"
import Img from "gatsby-image"
  
export const PortfolioItemWrapper = styled.section`
  align-items: center;
  display: flex;
  background-color: var(--background);
  border-bottom: 1px solid var(--borders);
  padding: 2rem 3rem;
  color: var(--texts);
  text-decoration: none;
  
  body#grid & {
    border: none;
    padding: 2rem 1rem;
    flex-direction: column;
    justify-content: center;
  }

  &:hover {
    color: var(--highlight);
  }

  ${media.lessThan("medium")`
    flex-direction: column;
    padding: 2rem 1rem;
  `}
`

export const PortfolioItemImage = styled(Img)`
  min-width: 240px;
  min-height: 12rem;
  
  display: ${props => ((props.left && props.side === "left") || (props.right && props.side === "right") ? "flex" : "none")};

  body#grid & {
    display: ${props => (props.side === "left" ? "flex" : "none")};
    margin-bottom: 10px;
  }

  ${media.lessThan("medium")`
    display: ${props => (props.side === "left" ? "flex" : "none")};
    margin-bottom: 10px;
  `}
`

export const PortfolioItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${props => (props.left ? "1.5rem" : "0")};
  margin-right: ${props => (props.right ? "1.5rem" : "0")};

  ${media.lessThan("medium")`
    margin: 0;
    margin-top: 1.5rem;
  `}
`

export const PortfolioItemDate = styled.time`
  font-size: 0.9rem;
  margin: 0.2rem 0 0.5rem;

  body#grid & {
    margin: 0.8rem 0;
  }
`

export const PortfolioItemTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;

  body#grid & {
    line-height: 1.1;
  }
`

export const PortfolioItemDescription = styled.p`
  font-size: 1.2rem;
  font-weight: 300;
  line-height: 1.2;
`