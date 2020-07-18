import React from "react"
import PropTypes from "prop-types"

import * as S from "./styled"

import {FileJs} from "@styled-icons/boxicons-solid/FileJs"
import {ReactLogo} from "@styled-icons/boxicons-logos/ReactLogo"
import {Ruby} from "@styled-icons/simple-icons/Ruby"
import {DevTo} from "@styled-icons/boxicons-logos/DevTo"
import {Amazonaws} from "@styled-icons/simple-icons/Amazonaws"
import {Coffee} from "@styled-icons/boxicons-solid/Coffee"

const defaultCss = {
  display: "block",
  height: "3.75rem",
  width: "3.75rem",
  position: "relative"
}

const categories = {
  js: {
    icon: <FileJs />,
    background: "#F8DC3C",
  },
  react: {
    icon: <ReactLogo />,
    background: "#00DAFF",
    css: {
      height: "4rem",
      width: "4rem",
    }
  },
  ruby: {
    icon: <Ruby />,
    background: "#940907",
    css: {
      height: "3rem",
      width: "3rem",
    }
  },
  dev: {
    icon: <DevTo />,
    background: "#573ACD",
  },
  aws: {
    icon: <Amazonaws />,
    background: "#F79A18",
    css: {
      marginTop: "5px"
    }
  },
  misc: {
    icon: <Coffee />,
    background: "#3B1D15",
    css: {
      marginLeft: "5px"
    }
  }
}

const PostItemTag = ({
  category,
}) => {
  const {icon, background, css = {}} = categories[category]
  return (
    <S.PostItemTag background={background}>
      <div style={{...defaultCss, ...css}}>{icon}</div>
    </S.PostItemTag>
  )
}

PostItemTag.propTypes = {
  category: PropTypes.string.isRequired,
}

export default PostItemTag