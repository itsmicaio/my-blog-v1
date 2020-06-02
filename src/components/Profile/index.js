import React from 'react'
import Avatar from '../Avatar'

import * as S from './styled'

const Profile = ({ title, position, description, isMobileHeader }) => {
    
  return (
    <S.ProfileWrapper isMobileHeader={isMobileHeader}>
      <S.ProfileLink>
        <Avatar />
        <S.ProfileAuthor>
          {title}
          <S.ProfilePosition>{position}</S.ProfilePosition>
        </S.ProfileAuthor>
      </S.ProfileLink>
      <S.ProfileDescription>
        {description} 
      </S.ProfileDescription>
    </S.ProfileWrapper>
  )
}

export default Profile